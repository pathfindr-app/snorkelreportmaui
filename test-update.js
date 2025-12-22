// Test script for the update flow
// Run with: node test-update.js

import { scrapeSnorkelStore } from './api/lib/scrapers/snorkelStore.js';
import { scrapeMauiNow } from './api/lib/scrapers/mauiNow.js';
import { fetchBuoyData } from './api/lib/fetchers/noaaBuoy.js';
import { fetchTideData } from './api/lib/fetchers/noaaTides.js';
import { generateSpotScoresAndConditions } from './api/lib/llm/generateConditions.js';

async function test() {
  console.log('=== Testing Maui Snorkel Report Update Flow ===\n');

  // Step 1: Test scraper
  console.log('1. Scraping The Snorkel Store...');
  const snorkelStoreData = await scrapeSnorkelStore();
  console.log('   Zone scores:', snorkelStoreData.zones);
  console.log('   Narrative length:', snorkelStoreData.fullNarrative?.length || 0, 'chars');
  console.log('   Narrative preview:', snorkelStoreData.fullNarrative?.slice(0, 200) + '...');
  console.log('');

  // Step 2: Fetch other data
  console.log('2. Fetching NOAA and Maui Now data...');
  const [mauiNowData, buoyData, tideData] = await Promise.all([
    scrapeMauiNow(),
    fetchBuoyData(),
    fetchTideData()
  ]);
  console.log('   Buoy:', { waves: buoyData.waveHeightFt, temp: buoyData.waterTempF });
  console.log('   Tide:', { rising: tideData.currentTide?.rising });
  console.log('   Wind:', mauiNowData.windConditions);
  console.log('');

  // Step 3: Test LLM
  if (!process.env.OPENAI_API_KEY) {
    console.log('3. SKIPPING LLM TEST - No OPENAI_API_KEY set');
    console.log('   Set OPENAI_API_KEY env var to test LLM scoring');
    return;
  }

  console.log('3. Calling LLM for spot scores and conditions...');
  const llmResult = await generateSpotScoresAndConditions({
    zones: snorkelStoreData.zones,
    fullNarrative: snorkelStoreData.fullNarrative || '',
    buoyData,
    tideData,
    mauiNowData
  });

  console.log('   Generated scores for', Object.keys(llmResult.spots).length, 'spots');
  console.log('');

  // Step 4: Show results
  console.log('=== RESULTS ===\n');

  const zoneScores = {
    northwest: snorkelStoreData.zones.northwest?.score ?? 5,
    kaanapali: snorkelStoreData.zones.kaanapali?.score ?? 5,
    southshore: snorkelStoreData.zones.southshore?.score ?? 5
  };

  console.log('Zone Scores from Snorkel Store:');
  console.log('  Northwest:', zoneScores.northwest);
  console.log('  Ka\'anapali:', zoneScores.kaanapali);
  console.log('  South Shore:', zoneScores.southshore);
  console.log('');

  console.log('LLM-Generated Spot Scores (should be within ±1 of zone):');
  console.log('');

  // Group by zone for display
  const zoneSpots = {
    'Northwest': ['honolua', 'kapalua', 'napili'],
    'Ka\'anapali': ['blackrock', 'kahekili'],
    'South Shore': ['olowalu', 'coralgardens', 'kamaole1', 'kamaole2', 'kamaole3',
                    'uluabeach', 'waileapoint', 'changssouth', 'fivegraves',
                    'makenalandingnorth', 'makenalandingsouth', 'maluaka', 'ahihikinau']
  };

  for (const [zoneName, spots] of Object.entries(zoneSpots)) {
    console.log(`${zoneName}:`);
    for (const spotId of spots) {
      const spot = llmResult.spots[spotId];
      if (spot) {
        console.log(`  ${spotId}: ${spot.score} - "${spot.conditions}"`);
      }
    }
    console.log('');
  }

  console.log('=== TEST COMPLETE ===');
}

test().catch(console.error);
