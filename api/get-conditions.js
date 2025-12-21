// API Endpoint to serve current conditions
// Returns the latest conditions from Vercel Blob storage
// Merges manual overrides on top of generated conditions

import { list } from '@vercel/blob';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Fallback to static data if blob is unavailable
const __dirname = dirname(fileURLToPath(import.meta.url));
const staticConditions = JSON.parse(
  readFileSync(join(__dirname, '../src/data/conditions.json'), 'utf-8')
);

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

// Apply manual overrides to conditions
function applyOverrides(conditions, overrides) {
  if (!overrides?.spots || Object.keys(overrides.spots).length === 0) {
    return conditions;
  }

  const updated = JSON.parse(JSON.stringify(conditions)); // Deep clone

  for (const [zoneId, zone] of Object.entries(updated.zones || {})) {
    for (const [spotId, spot] of Object.entries(zone.spots || {})) {
      const override = overrides.spots[spotId];
      if (override) {
        if (override.score !== undefined) {
          spot.score = override.score;
        }
        if (override.conditions) {
          spot.conditions = override.conditions;
        }
        spot.hasManualOverride = true;
      }
    }
  }

  updated.manualOverrides = overrides;
  return updated;
}

export default async function handler(req, res) {
  // Set CORS headers for frontend access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');

  try {
    // Fetch conditions and overrides in parallel
    const [conditionsResult, overrides] = await Promise.all([
      (async () => {
        const { blobs } = await list({ prefix: 'conditions.json', limit: 1 });
        if (blobs.length > 0) {
          const cacheBustUrl = `${blobs[0].url}?t=${Date.now()}`;
          const response = await fetch(cacheBustUrl, { cache: 'no-store' });
          if (response.ok) {
            return { data: await response.json(), source: 'blob' };
          }
        }
        return { data: staticConditions, source: 'static' };
      })(),
      getManualOverrides()
    ]);

    // Apply manual overrides
    const conditions = applyOverrides(conditionsResult.data, overrides);

    return res.status(200).json({
      ...conditions,
      source: conditionsResult.source,
      fetchedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching conditions:', error);

    // Return static conditions on error
    return res.status(200).json({
      ...staticConditions,
      source: 'static-fallback',
      fetchedAt: new Date().toISOString(),
      error: error.message
    });
  }
}
