// Wind Check Script - Analyzes webcam images for whitecaps and adjusts scores
// Runs at 11am and 2pm HST via GitHub Actions

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Webcam configuration - maps Ozolio camera IDs to zones
// Only includes working cams that we've verified
const WEBCAMS = [
  {
    id: 'napili',
    name: 'Napili Bay',
    zone: 'northwest',
    snapshotUrl: 'https://relay.ozolio.com/pub.api?cmd=snap&latency=low&oid=CID_00000008'
  },
  {
    id: 'kahekili',
    name: 'Airport Beach',
    zone: 'kaanapali',
    snapshotUrl: 'https://relay.ozolio.com/pub.api?cmd=snap&latency=low&oid=CID_TIGL000014BB'
  },
  {
    id: 'uluabeach',
    name: 'Ulua/Wailea Beach',
    zone: 'southshore',
    snapshotUrl: 'https://relay.ozolio.com/pub.api?cmd=snap&latency=low&oid=CID_GQRS00000091'
  },
  {
    id: 'waileapoint',
    name: 'Polo Beach',
    zone: 'southshore',
    snapshotUrl: 'https://relay.ozolio.com/pub.api?cmd=snap&latency=low&oid=CID_XWEE00001592'
  }
];

// Score penalty based on whitecap detection
const WHITECAP_PENALTY = {
  light: 2,    // Some texture/light chop
  moderate: 3, // Clear whitecaps
  heavy: 4     // Significant whitecaps/rough conditions
};

async function fetchWebcamImage(webcam) {
  try {
    console.log(`Fetching snapshot from ${webcam.name}...`);

    // Use curl for more reliable fetching (handles DNS/TLS better than Node fetch)
    const buffer = execSync(`curl -s "${webcam.snapshotUrl}"`, {
      maxBuffer: 10 * 1024 * 1024, // 10MB max
      timeout: 30000 // 30 second timeout
    });

    const base64 = buffer.toString('base64');
    const contentType = 'image/jpeg';

    console.log(`  ✓ Got image (${Math.round(buffer.length / 1024)}KB)`);
    return { base64, contentType, success: true };
  } catch (error) {
    console.error(`  ✗ Failed to fetch ${webcam.name}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function analyzeImageForWhitecaps(client, imageData, webcamName) {
  try {
    console.log(`Analyzing ${webcamName} for wind chop...`);

    const response = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 150,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: imageData.contentType,
                data: imageData.base64
              }
            },
            {
              type: 'text',
              text: `You are analyzing a beach webcam image for snorkeling conditions.

Look at the ocean water surface and determine if there are whitecaps or wind chop visible.

Respond with ONLY one of these exact words:
- CALM (smooth water, no whitecaps, good for snorkeling)
- LIGHT (slight texture/ripples, minor wind effect)
- MODERATE (visible whitecaps, choppy conditions)
- HEAVY (significant whitecaps, rough conditions)

Just the single word, nothing else.`
            }
          ]
        }
      ]
    });

    const result = response.content[0].text.trim().toUpperCase();
    console.log(`  → ${webcamName}: ${result}`);

    // Validate response
    if (['CALM', 'LIGHT', 'MODERATE', 'HEAVY'].includes(result)) {
      return result;
    }

    // If unexpected response, try to parse it
    if (result.includes('CALM')) return 'CALM';
    if (result.includes('HEAVY')) return 'HEAVY';
    if (result.includes('MODERATE')) return 'MODERATE';
    if (result.includes('LIGHT')) return 'LIGHT';

    console.warn(`  ⚠ Unexpected response: "${result}", defaulting to CALM`);
    return 'CALM';
  } catch (error) {
    console.error(`  ✗ Analysis failed for ${webcamName}:`, error.message);
    return null;
  }
}

function calculateZoneAdjustments(results) {
  // Group results by zone
  const zoneResults = {};

  for (const result of results) {
    if (!result.analysis) continue;

    if (!zoneResults[result.zone]) {
      zoneResults[result.zone] = [];
    }
    zoneResults[result.zone].push(result.analysis);
  }

  // Calculate adjustment per zone
  const adjustments = {};

  for (const [zone, analyses] of Object.entries(zoneResults)) {
    // Find worst condition in zone
    const severityOrder = ['CALM', 'LIGHT', 'MODERATE', 'HEAVY'];
    const worstIndex = Math.max(...analyses.map(a => severityOrder.indexOf(a)));
    const worstCondition = severityOrder[worstIndex];

    let penalty = 0;
    if (worstCondition === 'LIGHT') penalty = WHITECAP_PENALTY.light;
    else if (worstCondition === 'MODERATE') penalty = WHITECAP_PENALTY.moderate;
    else if (worstCondition === 'HEAVY') penalty = WHITECAP_PENALTY.heavy;

    adjustments[zone] = {
      condition: worstCondition,
      penalty,
      camsAnalyzed: analyses.length
    };
  }

  return adjustments;
}

function applyAdjustments(conditions, adjustments) {
  const updated = JSON.parse(JSON.stringify(conditions)); // Deep clone

  const now = new Date().toISOString();

  // Update the main lastUpdated timestamp so the UI shows fresh time
  updated.lastUpdated = now;

  // Add wind check metadata
  updated.windCheck = {
    timestamp: now,
    adjustments: {},
    cameras: WEBCAMS.map(w => ({ id: w.id, name: w.name, zone: w.zone }))
  };

  for (const [zoneId, adjustment] of Object.entries(adjustments)) {
    if (!updated.zones[zoneId]) continue;

    const zone = updated.zones[zoneId];
    const originalScore = zone.score;

    // Only apply penalty if conditions are not calm
    if (adjustment.penalty > 0) {
      // Adjust zone score
      zone.score = Math.max(0, originalScore - adjustment.penalty);
      zone.windAdjusted = true;
      zone.windCondition = adjustment.condition;

      // Adjust all spot scores in this zone
      for (const spotId of Object.keys(zone.spots)) {
        const spot = zone.spots[spotId];
        const originalSpotScore = spot.score;
        if (typeof originalSpotScore === 'number') {
          spot.score = Math.max(0, originalSpotScore - adjustment.penalty);
          spot.windAdjusted = true;
        }
      }

      console.log(`Zone ${zoneId}: ${originalScore} → ${zone.score} (${adjustment.condition}, -${adjustment.penalty})`);
    } else {
      console.log(`Zone ${zoneId}: ${originalScore} (no change - ${adjustment.condition})`);
    }

    updated.windCheck.adjustments[zoneId] = {
      originalScore,
      adjustedScore: zone.score,
      condition: adjustment.condition,
      penalty: adjustment.penalty
    };
  }

  return updated;
}

async function main() {
  console.log('='.repeat(60));
  console.log('Wind Check Starting at', new Date().toISOString());
  console.log('='.repeat(60));

  // Initialize Anthropic client
  const client = new Anthropic();

  // Fetch and analyze all webcams
  const results = [];

  for (const webcam of WEBCAMS) {
    const imageData = await fetchWebcamImage(webcam);

    if (imageData.success) {
      const analysis = await analyzeImageForWhitecaps(client, imageData, webcam.name);
      results.push({
        ...webcam,
        analysis,
        success: true
      });
    } else {
      results.push({
        ...webcam,
        analysis: null,
        success: false,
        error: imageData.error
      });
    }
  }

  // Calculate zone adjustments
  const adjustments = calculateZoneAdjustments(results);

  console.log('\n' + '-'.repeat(60));
  console.log('Zone Adjustments:');
  console.log(JSON.stringify(adjustments, null, 2));

  // Load current conditions
  const conditionsPath = join(__dirname, '../data/conditions.json');
  const conditions = JSON.parse(readFileSync(conditionsPath, 'utf-8'));

  // Apply adjustments
  const updatedConditions = applyAdjustments(conditions, adjustments);

  // Save updated conditions
  writeFileSync(conditionsPath, JSON.stringify(updatedConditions, null, 2));

  console.log('\n' + '='.repeat(60));
  console.log('Wind Check Complete at', new Date().toISOString());
  console.log('Results saved to:', conditionsPath);
  console.log('='.repeat(60));

  // Summary
  const successCount = results.filter(r => r.success).length;
  const hasAdjustments = Object.values(adjustments).some(a => a.penalty > 0);

  console.log(`\nSummary: ${successCount}/${WEBCAMS.length} cameras analyzed`);
  console.log(`Adjustments applied: ${hasAdjustments ? 'YES' : 'NO'}`);

  return { success: true, results, adjustments };
}

main().catch(error => {
  console.error('Wind check failed:', error);
  process.exit(1);
});
