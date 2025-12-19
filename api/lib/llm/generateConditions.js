// GPT-4o-mini Conditions Generator
// Generates spot-specific conditions text using LLM

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Spot metadata for generating conditions
const SPOTS_METADATA = {
  // Northwest Zone
  honolua: {
    name: 'Honolua Bay',
    exposure: 'Fully exposed to north swells',
    characteristics: 'Marine Life Conservation District, rocky entry, best in calm summer conditions'
  },
  kapalua: {
    name: 'Kapalua Bay',
    exposure: 'Partially protected cove, still affected by large north swells',
    characteristics: 'Small protected cove, sandy entry, good for beginners on calm days'
  },
  napili: {
    name: 'Napili Bay',
    exposure: 'Sheltered crescent bay, less exposed than Honolua',
    characteristics: 'Sandy bottom with reef on sides, popular with families'
  },

  // Ka\'anapali Zone
  blackrock: {
    name: 'Black Rock (Pu\'u Keka\'a)',
    exposure: 'West-facing, exposed to west swells',
    characteristics: 'Iconic lava rock formation, easy beach access, can get crowded'
  },
  kahekili: {
    name: 'Kahekili (Airport Beach)',
    exposure: 'West-facing, partially protected',
    characteristics: 'Less crowded, excellent reef system, sandy entry'
  },

  // South Shore Zone
  olowalu: {
    name: 'Olowalu',
    exposure: 'Protected from north swells, exposed to south',
    characteristics: 'Mile Marker 14, shallow water, known for turtle sightings'
  },
  coralgardens: {
    name: 'Coral Gardens',
    exposure: 'Protected, boat access common',
    characteristics: 'Vibrant coral formations, abundant marine life, watch for boat traffic'
  },
  kamaole1: {
    name: 'Kamaole Beach I',
    exposure: 'South-facing, affected by south swells',
    characteristics: 'Family-friendly, lifeguards, best snorkeling near south rocks'
  },
  kamaole2: {
    name: 'Kamaole Beach II',
    exposure: 'South-facing, affected by south swells',
    characteristics: 'Reef on both ends, lifeguards present'
  },
  kamaole3: {
    name: 'Kamaole Beach III',
    exposure: 'South-facing, affected by south swells',
    characteristics: 'Largest Kamaole beach, grassy park, family friendly'
  },
  uluabeach: {
    name: 'Ulua Beach',
    exposure: 'Protected cove in Wailea',
    characteristics: 'Gentle sandy entry, lava fingers with diverse marine life'
  },
  waileapoint: {
    name: 'Wailea Point',
    exposure: 'Rocky point, more exposed',
    characteristics: 'Rocky entry, good reef structure, occasional currents'
  },
  changssouth: {
    name: 'Chang\'s South',
    exposure: 'Part of Turtle Town, moderate exposure',
    characteristics: 'Rocky shoreline entry, excellent coral, local favorite'
  },
  fivegraves: {
    name: 'Five Graves (Five Caves)',
    exposure: 'Exposed, can have surge',
    characteristics: 'Advanced spot, underwater caves, lava rock entry'
  },
  makenalandingnorth: {
    name: 'Makena Landing North',
    exposure: 'Gateway to Turtle Town',
    characteristics: 'Sandy entry, boat traffic, excellent turtle encounters'
  },
  makenalandingsouth: {
    name: 'Makena Landing South',
    exposure: 'More exposed than north side',
    characteristics: 'Rockier entry, strong currents possible, less crowded'
  },
  maluaka: {
    name: 'Maluaka Beach',
    exposure: 'Protected sandy beach',
    characteristics: 'Easy entry, turtle cleaning station nearby, great for beginners'
  },
  ahihikinau: {
    name: 'Ahihi-Kinau Marine Preserve',
    exposure: 'Protected reserve, lava rock coastline',
    characteristics: 'Pristine reef, no fishing allowed, reef-safe sunscreen only'
  }
};

const SYSTEM_PROMPT = `You are a concise snorkeling conditions reporter for Maui. Generate 1-2 sentence condition reports that are practical and safety-focused.

Rules:
- Be direct and actionable
- Include water temp and relevant tide info naturally
- Mention specific hazards when present
- Use plain language tourists can understand
- If conditions are dangerous, say so clearly
- Keep it under 50 words`;

/**
 * Generates conditions text for all spots using GPT-4o-mini
 * @param {object} params - { zones, buoyData, tideData }
 * @returns {Promise<object>} - { spotId: conditionsText, ... }
 */
export async function generateAllConditions({ zones, buoyData, tideData }) {
  const spotConditions = {};

  // Build prompts for all spots
  const prompts = [];

  for (const [spotId, spotMeta] of Object.entries(SPOTS_METADATA)) {
    // Determine which zone this spot belongs to
    let zone = null;
    let zoneName = '';
    if (['honolua', 'kapalua', 'napili'].includes(spotId)) {
      zone = zones.northwest;
      zoneName = 'Northwest';
    } else if (['blackrock', 'kahekili'].includes(spotId)) {
      zone = zones.kaanapali;
      zoneName = "Ka'anapali";
    } else {
      zone = zones.southshore;
      zoneName = 'South Shore';
    }

    const zoneScore = zone?.score ?? 5;
    const zoneNarrative = zone?.narrative ?? 'Conditions vary.';

    // Build the prompt for this spot
    const prompt = `Zone: ${zoneName} (Score: ${zoneScore}/10)
Zone Report: "${zoneNarrative}"

Spot: ${spotMeta.name}
Characteristics: ${spotMeta.characteristics}
Exposure: ${spotMeta.exposure}

Current Conditions:
- Waves: ${buoyData.waveHeightFt}
- Water Temp: ${buoyData.waterTempF}
- Swell Direction: ${buoyData.waveDirectionCompass}
- Tide: ${tideData.currentTide?.rising ? 'Rising' : 'Falling'} (${tideData.currentTide?.height || 'N/A'})
- Next High Tide: ${tideData.nextHighTide?.time || 'N/A'} (${tideData.nextHighTide?.height || 'N/A'})

Generate a concise conditions report for ${spotMeta.name}.`;

    prompts.push({ spotId, prompt });
  }

  // Call OpenAI for all spots in a single batch request
  // Using a single prompt with all spots to minimize API calls
  const batchPrompt = prompts.map((p, i) => `[SPOT ${i + 1}: ${SPOTS_METADATA[p.spotId].name}]\n${p.prompt}`).join('\n\n---\n\n');

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Generate conditions for each of these ${prompts.length} snorkeling spots. Format your response as:\n\n[SPOT 1: Name]\nConditions text here.\n\n[SPOT 2: Name]\nConditions text here.\n\n...and so on.\n\n${batchPrompt}`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const content = response.choices[0]?.message?.content || '';

    // Parse the response to extract conditions for each spot
    for (let i = 0; i < prompts.length; i++) {
      const spotId = prompts[i].spotId;
      const spotName = SPOTS_METADATA[spotId].name;

      // Try to find this spot's section in the response
      const patterns = [
        new RegExp(`\\[SPOT ${i + 1}[^\\]]*\\]\\s*([^\\[]+)`, 'i'),
        new RegExp(`${spotName.replace(/[()]/g, '\\$&')}[:\\s]*([^\\[]+)`, 'i')
      ];

      let conditions = null;
      for (const pattern of patterns) {
        const match = content.match(pattern);
        if (match && match[1]) {
          conditions = match[1].trim().split('\n')[0].trim(); // Take first line
          break;
        }
      }

      spotConditions[spotId] = conditions || `Conditions vary. Water temp ${buoyData.waterTempF}. Check current conditions before entering.`;
    }
  } catch (error) {
    console.error('Error generating conditions with LLM:', error);

    // Fallback: generate basic conditions without LLM
    for (const spotId of Object.keys(SPOTS_METADATA)) {
      spotConditions[spotId] = `Water temp ${buoyData.waterTempF}. Waves ${buoyData.waveHeightFt}. Check local conditions before snorkeling.`;
    }
  }

  return spotConditions;
}

export default generateAllConditions;
