// GitHub Actions Script - Updates conditions daily and saves to data/conditions.json
// This script reuses the existing lib functions from api/lib/

import { scrapeSnorkelStore } from '../api/lib/scrapers/snorkelStore.js';
import { scrapeMauiNow } from '../api/lib/scrapers/mauiNow.js';
import { fetchBuoyData } from '../api/lib/fetchers/noaaBuoy.js';
import { fetchTideData } from '../api/lib/fetchers/noaaTides.js';
import { generateSpotScoresAndConditions } from '../api/lib/llm/generateConditions.js';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load base conditions structure
const baseConditions = JSON.parse(
  readFileSync(join(__dirname, '../src/data/conditions.json'), 'utf-8')
);

// Load manual overrides from repo
function getManualOverrides() {
  try {
    const overrides = JSON.parse(
      readFileSync(join(__dirname, '../manual-overrides.json'), 'utf-8')
    );
    return overrides;
  } catch (err) {
    console.error('Error reading manual overrides:', err);
    return { spots: {} };
  }
}

async function updateConditions() {
  console.log('Starting conditions update at', new Date().toISOString());

  try {
    // Fetch all data sources in parallel
    const [snorkelStoreData, mauiNowData, buoyData, tideData] = await Promise.all([
      scrapeSnorkelStore(),
      scrapeMauiNow(),
      fetchBuoyData(),
      fetchTideData()
    ]);

    const manualOverrides = getManualOverrides();

    console.log('Manual overrides:', Object.keys(manualOverrides.spots || {}).length, 'spots');

    console.log('Data fetched:', {
      snorkelStore: snorkelStoreData.zones,
      mauiNow: { advisories: mauiNowData.advisories, surf: mauiNowData.surfConditions },
      buoy: { waves: buoyData.waveHeightFt, temp: buoyData.waterTempF },
      tides: { nextHigh: tideData.nextHighTide },
      narrativeLength: snorkelStoreData.fullNarrative?.length || 0
    });

    // Generate scores AND conditions for all spots using LLM
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

    // Save to data/conditions.json
    const outputPath = join(__dirname, '../data/conditions.json');
    writeFileSync(outputPath, JSON.stringify(updatedConditions, null, 2));

    console.log('Conditions saved to:', outputPath);
    console.log('Update completed successfully at', new Date().toISOString());

    return {
      success: true,
      spotsUpdated: Object.keys(llmResult.spots).length,
      dataQuality: updatedConditions.dataQuality
    };
  } catch (error) {
    console.error('Error updating conditions:', error);
    process.exit(1);
  }
}

// Run the update
updateConditions();
