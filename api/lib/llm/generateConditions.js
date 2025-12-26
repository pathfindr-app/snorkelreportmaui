// GPT-4o-mini Conditions Generator
// Generates spot-specific scores AND conditions text using LLM
// Interprets The Snorkel Store narrative to fine-tune individual spot scores

import OpenAI from 'openai';

// Lazy initialization of OpenAI client
let openai = null;
function getOpenAI() {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  return openai;
}

// Zone to spot mapping
const ZONE_SPOTS = {
  northwest: ['honolua', 'kapalua', 'napili'],
  kaanapali: ['blackrock', 'kahekili'],  // malawharf has derived score,
  southshore: [
    'olowalu', 'coralgardens', 'kamaole1', 'kamaole2', 'kamaole3',
    'uluabeach', 'waileapoint', 'changssouth', 'fivegraves',
    'makenalandingnorth', 'makenalandingsouth', 'maluaka', 'whiterock', 'ahihikinau'
  ]
};

// All spot IDs
const ALL_SPOTS = Object.values(ZONE_SPOTS).flat();

// Spot metadata for context
const SPOTS_METADATA = {
  honolua: { name: 'Honolua Bay', exposure: 'Fully exposed to north swells', zone: 'northwest' },
  kapalua: { name: 'Kapalua Bay', exposure: 'Partially protected cove', zone: 'northwest' },
  napili: { name: 'Napili Bay', exposure: 'Sheltered crescent bay', zone: 'northwest' },
  blackrock: { name: 'Black Rock', exposure: 'West-facing, exposed to west swells', zone: 'kaanapali' },
  kahekili: { name: 'Kahekili (Airport Beach)', exposure: 'West-facing, partially protected', zone: 'kaanapali' },
  olowalu: { name: 'Olowalu', exposure: 'Protected from north swells', zone: 'southshore' },
  coralgardens: { name: 'Coral Gardens', exposure: 'Protected, boat access', zone: 'southshore' },
  kamaole1: { name: 'Kamaole Beach I', exposure: 'South-facing', zone: 'southshore' },
  kamaole2: { name: 'Kamaole Beach II', exposure: 'South-facing', zone: 'southshore' },
  kamaole3: { name: 'Kamaole Beach III', exposure: 'South-facing', zone: 'southshore' },
  uluabeach: { name: 'Ulua Beach', exposure: 'Protected cove in Wailea', zone: 'southshore' },
  waileapoint: { name: 'Wailea Point', exposure: 'Rocky point, more exposed', zone: 'southshore' },
  changssouth: { name: "Chang's South", exposure: 'Part of Turtle Town', zone: 'southshore' },
  fivegraves: { name: 'Five Graves', exposure: 'Exposed, can have surge', zone: 'southshore' },
  makenalandingnorth: { name: 'Makena Landing North', exposure: 'Gateway to Turtle Town', zone: 'southshore' },
  makenalandingsouth: { name: 'Makena Landing South', exposure: 'More exposed than north', zone: 'southshore' },
  maluaka: { name: 'Maluaka Beach', exposure: 'Protected sandy beach', zone: 'southshore' },
  whiterock: { name: 'White Rock', exposure: 'South end of Big Beach, rocky entry', zone: 'southshore' },
  ahihikinau: { name: 'Ahihi-Kinau', exposure: 'Protected marine reserve', zone: 'southshore' }
};

// System prompt for JSON output with scores
const SYSTEM_PROMPT = `You are a snorkeling conditions analyst for Maui. Given zone scores and narrative from The Snorkel Store, generate individual spot scores and brief condition descriptions.

CRITICAL SCORING RULES:
1. Each spot score MUST be within ±1 point of its zone score (e.g., if zone is 6, spot can be 5.0-7.0)
2. Use the narrative to determine relative rankings within each zone
3. If narrative says "X is better than Y" or "X is calmer than Y", X should score higher than Y
4. If narrative mentions a spot is dangerous/rough/hazardous, score it lower within the range
5. If narrative mentions a spot is calm/protected/good, score it higher within the range
6. If a spot is not mentioned in the narrative, default to exactly the zone score
7. Scores should be to 1 decimal place (e.g., 6.5, not 6.53)

CONDITION TEXT RULES:
- 1-2 sentences maximum
- NEVER use specific numbers like "6 ft waves" or "79°F" - use general terms only
- Use phrases like: "waves are up", "calm conditions", "visibility reduced", "warm water"
- Be practical and safety-focused
- If dangerous, say so clearly

ZONE ASSIGNMENTS:
- Northwest zone: honolua, kapalua, napili
- Ka'anapali zone: blackrock, kahekili
- South Shore zone: olowalu, coralgardens, kamaole1, kamaole2, kamaole3, uluabeach, waileapoint, changssouth, fivegraves, makenalandingnorth, makenalandingsouth, maluaka, whiterock, ahihikinau

You MUST output valid JSON only, no markdown or explanation.`;

/**
 * Get zone score for a spot
 */
function getZoneScoreForSpot(spotId, zones) {
  const meta = SPOTS_METADATA[spotId];
  if (!meta) return 5;
  return zones[meta.zone]?.score ?? 5;
}

/**
 * Clamp score to within ±1 of zone score
 */
function clampToZoneRange(score, zoneScore) {
  const min = Math.max(0, zoneScore - 1);
  const max = Math.min(10, zoneScore + 1);
  const clamped = Math.max(min, Math.min(max, score));
  return Math.round(clamped * 10) / 10;
}

/**
 * Convert buoy wave height to general description
 */
function getWaveDescription(waveHeightMeters) {
  if (waveHeightMeters === null || waveHeightMeters === undefined) return 'unknown';
  const ft = waveHeightMeters * 3.28084;
  if (ft < 2) return 'calm to light';
  if (ft < 4) return 'moderate';
  if (ft < 6) return 'elevated';
  if (ft < 8) return 'rough';
  return 'very rough';
}

/**
 * Generate fallback scores when LLM fails - just use zone scores
 */
function generateFallbackScores(zones) {
  const result = { spots: {} };
  for (const spotId of ALL_SPOTS) {
    const zoneScore = getZoneScoreForSpot(spotId, zones);
    result.spots[spotId] = {
      score: zoneScore,
      conditions: 'Conditions vary. Check locally before snorkeling.'
    };
  }
  return result;
}

/**
 * Parse and validate LLM response
 */
function parseAndValidateResponse(content, zones) {
  let parsed;

  // Try to parse JSON
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[1]);
    } else {
      throw new Error('Failed to parse LLM response as JSON');
    }
  }

  // Validate structure
  if (!parsed.spots || typeof parsed.spots !== 'object') {
    throw new Error('LLM response missing "spots" object');
  }

  // Validate and clamp each spot
  const validatedSpots = {};
  for (const spotId of ALL_SPOTS) {
    const zoneScore = getZoneScoreForSpot(spotId, zones);
    const spotData = parsed.spots[spotId] || {};

    // Parse and clamp score
    let score = parseFloat(spotData.score);
    if (isNaN(score)) {
      score = zoneScore;
    } else {
      score = clampToZoneRange(score, zoneScore);
    }

    // Get conditions text
    let conditions = spotData.conditions;
    if (!conditions || typeof conditions !== 'string' || conditions.length < 5) {
      conditions = 'Conditions vary. Check locally before entering.';
    }

    validatedSpots[spotId] = { score, conditions };
  }

  return { spots: validatedSpots };
}

/**
 * Generates scores and conditions for all spots using GPT-4o-mini
 * @param {object} params - { zones, fullNarrative, buoyData, tideData, mauiNowData }
 * @returns {Promise<{spots: object}>} - { spots: { spotId: { score, conditions } } }
 */
export async function generateSpotScoresAndConditions({ zones, fullNarrative, buoyData, tideData, mauiNowData }) {
  // Build environmental context (no specific numbers for LLM output)
  const waveCondition = getWaveDescription(buoyData?.waveHeight);
  const swellDir = buoyData?.waveDirectionCompass || 'variable';
  const windDesc = mauiNowData?.windConditions || 'variable';
  const tideStatus = tideData?.currentTide?.rising ? 'rising' : 'falling';

  // Build spot list for prompt
  const spotList = ALL_SPOTS.map(id => {
    const meta = SPOTS_METADATA[id];
    return `- ${id}: ${meta.name} (${meta.exposure})`;
  }).join('\n');

  // Build the user prompt
  const userPrompt = `ZONE SCORES FROM THE SNORKEL STORE:
- Northwest: ${zones.northwest?.score ?? 5}/10
- Ka'anapali: ${zones.kaanapali?.score ?? 5}/10
- South Shore: ${zones.southshore?.score ?? 5}/10

NARRATIVE FROM THE SNORKEL STORE:
"""
${fullNarrative || 'No narrative available today.'}
"""

CURRENT ENVIRONMENTAL CONDITIONS:
- Wave conditions: ${waveCondition}
- Swell direction: ${swellDir}
- Wind: ${windDesc}
- Tide: ${tideStatus}

SPOTS TO SCORE (remember: each score must be within ±1 of its zone score):
${spotList}

Generate a JSON object with this exact structure:
{
  "spots": {
    "honolua": { "score": <number>, "conditions": "<string>" },
    "kapalua": { "score": <number>, "conditions": "<string>" },
    ... and so on for all ${ALL_SPOTS.length} spots ...
  }
}`;

  try {
    console.log('Calling GPT-4o-mini for spot scores and conditions...');

    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3, // Lower for more consistent scoring
      max_tokens: 2500
    });

    const content = response.choices[0]?.message?.content || '';
    console.log('LLM response received, parsing...');

    // Parse and validate
    const result = parseAndValidateResponse(content, zones);
    console.log('Successfully generated scores for', Object.keys(result.spots).length, 'spots');

    return result;
  } catch (error) {
    console.error('Error generating conditions with LLM:', error.message);
    console.log('Using fallback scores (zone scores directly)');
    return generateFallbackScores(zones);
  }
}

// Keep old function name for backwards compatibility during transition
export async function generateAllConditions(params) {
  // Convert old params to new format
  const result = await generateSpotScoresAndConditions({
    zones: params.zones,
    fullNarrative: '', // Old callers don't have narrative
    buoyData: params.buoyData,
    tideData: params.tideData,
    mauiNowData: params.mauiNowData
  });

  // Return just the conditions text for backwards compatibility
  const conditions = {};
  for (const [spotId, data] of Object.entries(result.spots)) {
    conditions[spotId] = data.conditions;
  }
  return conditions;
}

export default generateSpotScoresAndConditions;
