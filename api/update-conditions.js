// Vercel Cron Handler - Updates conditions daily at 8:05am HST
// Schedule: 5 18 * * * (18:05 UTC = 8:05am HST)

import { put, list } from '@vercel/blob';
import { scrapeSnorkelStore } from './lib/scrapers/snorkelStore.js';
import { scrapeMauiNow } from './lib/scrapers/mauiNow.js';
import { fetchBuoyData } from './lib/fetchers/noaaBuoy.js';
import { fetchTideData } from './lib/fetchers/noaaTides.js';
import { generateSpotScoresAndConditions } from './lib/llm/generateConditions.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Base conditions structure (will be merged with scraped data)
const __dirname = dirname(fileURLToPath(import.meta.url));
const baseConditions = JSON.parse(
  readFileSync(join(__dirname, '../src/data/conditions.json'), 'utf-8')
);

export const config = {
  maxDuration: 60
};

// Fetch manual overrides from blob
async function getManualOverrides() {
  try {
    const { blobs } = await list({ prefix: 'manual-overrides.json', limit: 1 });
    if (blobs.length > 0) {
      const response = await fetch(`${blobs[0].url}?t=${Date.now()}`, { cache: 'no-store' });
      if (response.ok) {
        return await response.json();
      }
    }
  } catch (err) {
    console.error('Error fetching manual overrides:', err);
  }
  return { spots: {} };
}

export default async function handler(req, res) {
  // Verify this is a cron request (optional security)
  const authHeader = req.headers.authorization;
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // In production, you might want to verify the request
    // For now, we'll allow all requests during development
    console.log('Note: CRON_SECRET not verified');
  }

  console.log('Starting conditions update at', new Date().toISOString());

  try {
    // Fetch all data sources in parallel (including manual overrides)
    const [snorkelStoreData, mauiNowData, buoyData, tideData, manualOverrides] = await Promise.all([
      scrapeSnorkelStore(),
      scrapeMauiNow(),
      fetchBuoyData(),
      fetchTideData(),
      getManualOverrides()
    ]);

    console.log('Manual overrides:', Object.keys(manualOverrides.spots || {}).length, 'spots');

    console.log('Data fetched:', {
      snorkelStore: snorkelStoreData.zones,
      mauiNow: { advisories: mauiNowData.advisories, surf: mauiNowData.surfConditions },
      buoy: { waves: buoyData.waveHeightFt, temp: buoyData.waterTempF },
      tides: { nextHigh: tideData.nextHighTide },
      narrativeLength: snorkelStoreData.fullNarrative?.length || 0
    });

    // Generate scores AND conditions for all spots using LLM
    // The LLM interprets the Snorkel Store narrative to fine-tune individual spot scores
    const llmResult = await generateSpotScoresAndConditions({
      zones: snorkelStoreData.zones,
      fullNarrative: snorkelStoreData.fullNarrative || '',
      buoyData,
      tideData,
      mauiNowData
    });

    console.log('Generated scores and conditions for', Object.keys(llmResult.spots).length, 'spots');

    // Build the updated conditions object
    const updatedConditions = {
      lastUpdated: new Date().toISOString(),
      dataQuality: {
        snorkelStore: snorkelStoreData.error ? 'stale' : 'fresh',
        noaaBuoy: buoyData.error ? 'unavailable' : 'fresh',
        noaaTides: tideData.error ? 'unavailable' : 'fresh',
        lastSuccessfulUpdate: new Date().toISOString()
      },
      marine: {
        waveHeight: buoyData.waveHeightFt,
        waveDirection: buoyData.waveDirectionCompass,
        waterTemp: buoyData.waterTempF,
        currentTide: tideData.currentTide,
        nextHighTide: tideData.nextHighTide,
        nextLowTide: tideData.nextLowTide
      },
      alerts: snorkelStoreData.alerts || [],
      zones: {}
    };

    // Update each zone with scraped scores and generated conditions
    for (const [zoneId, zoneData] of Object.entries(baseConditions.zones)) {
      const scrapedZone = snorkelStoreData.zones[zoneId] || {};

      // General wave description based on buoy data
      const waveDesc = buoyData.waveHeight < 1.2 ? 'Light' :
                       buoyData.waveHeight < 2 ? 'Moderate' :
                       buoyData.waveHeight < 2.5 ? 'Elevated' : 'Rough';

      updatedConditions.zones[zoneId] = {
        ...zoneData,
        score: scrapedZone.score ?? zoneData.score,
        // Keep original summary, don't copy scraped narrative verbatim
        summary: zoneData.summary,
        details: `Water is warm (${buoyData.waterTempF}). ${waveDesc} conditions. ${mauiNowData.windConditions || 'Light'} winds.`,
        spots: {}
      };

      // Update each spot in this zone
      for (const [spotId, spotData] of Object.entries(zoneData.spots)) {
        const override = manualOverrides.spots?.[spotId];
        const llmSpot = llmResult.spots?.[spotId];
        const zoneScore = scrapedZone.score ?? zoneData.score;

        // Skip malawharf here - it gets a derived score calculated below
        if (spotId === 'malawharf') {
          updatedConditions.zones[zoneId].spots[spotId] = {
            ...spotData,
            conditions: override?.conditions || spotData.conditions,
            score: zoneScore, // Placeholder - calculated after all spots
            derivedScore: true
          };
          continue;
        }

        updatedConditions.zones[zoneId].spots[spotId] = {
          ...spotData,
          // Priority for conditions: 1) Manual override, 2) LLM, 3) Static
          conditions: override?.conditions || llmSpot?.conditions || spotData.conditions,
          // Priority for score: 1) Manual override, 2) LLM score, 3) Zone score
          score: override?.score ?? llmSpot?.score ?? zoneScore,
          // Flag source of score
          ...(override && { hasManualOverride: true }),
          ...(llmSpot && !override && { hasLLMScore: true })
        };
      }
    }

    // Calculate derived score for Mala Wharf (average of zone + blackrock + kahekili)
    if (updatedConditions.zones.kaanapali?.spots?.malawharf) {
      const kaanapaliZone = updatedConditions.zones.kaanapali;
      const blackrockScore = kaanapaliZone.spots.blackrock?.score ?? kaanapaliZone.score;
      const kahekiliScore = kaanapaliZone.spots.kahekili?.score ?? kaanapaliZone.score;
      const zoneScore = kaanapaliZone.score;

      // Average of zone score, blackrock, and kahekili
      const derivedScore = Math.round(((zoneScore + blackrockScore + kahekiliScore) / 3) * 10) / 10;

      updatedConditions.zones.kaanapali.spots.malawharf.score = derivedScore;
      console.log(`Mala Wharf derived score: ${derivedScore} (avg of zone:${zoneScore}, blackrock:${blackrockScore}, kahekili:${kahekiliScore})`);
    }

    // Save to Vercel Blob
    const blob = await put('conditions.json', JSON.stringify(updatedConditions, null, 2), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json'
    });

    console.log('Conditions saved to blob:', blob.url);

    return res.status(200).json({
      success: true,
      message: 'Conditions updated successfully',
      timestamp: new Date().toISOString(),
      blobUrl: blob.url,
      spotsUpdated: Object.keys(llmResult.spots).length,
      dataQuality: updatedConditions.dataQuality
    });
  } catch (error) {
    console.error('Error updating conditions:', error);

    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
