// Vercel Cron Handler - Updates conditions daily at 8:05am HST
// Schedule: 5 18 * * * (18:05 UTC = 8:05am HST)

import { put } from '@vercel/blob';
import { scrapeSnorkelStore } from './lib/scrapers/snorkelStore.js';
import { fetchBuoyData } from './lib/fetchers/noaaBuoy.js';
import { fetchTideData } from './lib/fetchers/noaaTides.js';
import { generateAllConditions } from './lib/llm/generateConditions.js';
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
    // Fetch all data sources in parallel
    const [snorkelStoreData, buoyData, tideData] = await Promise.all([
      scrapeSnorkelStore(),
      fetchBuoyData(),
      fetchTideData()
    ]);

    console.log('Data fetched:', {
      snorkelStore: snorkelStoreData.zones,
      buoy: { waves: buoyData.waveHeightFt, temp: buoyData.waterTempF },
      tides: { nextHigh: tideData.nextHighTide }
    });

    // Generate conditions for all spots using LLM
    const spotConditions = await generateAllConditions({
      zones: snorkelStoreData.zones,
      buoyData,
      tideData
    });

    console.log('Generated conditions for', Object.keys(spotConditions).length, 'spots');

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

      updatedConditions.zones[zoneId] = {
        ...zoneData,
        score: scrapedZone.score ?? zoneData.score,
        // Keep original summary, don't copy scraped narrative verbatim
        summary: zoneData.summary,
        details: `Water temp ${buoyData.waterTempF}. Waves ${buoyData.waveHeightFt} from ${buoyData.waveDirectionCompass}.`,
        spots: {}
      };

      // Update each spot in this zone
      for (const [spotId, spotData] of Object.entries(zoneData.spots)) {
        updatedConditions.zones[zoneId].spots[spotId] = {
          ...spotData,
          conditions: spotConditions[spotId] || spotData.conditions,
          // Inherit zone score if spot doesn't have explicit score
          score: spotData.score ?? null
        };
      }
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
      spotsUpdated: Object.keys(spotConditions).length,
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
