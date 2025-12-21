// API Endpoint to manually override spot scores and conditions
// POST: Set override for a spot
// GET: Get all current overrides
// DELETE: Remove override for a spot

import { put, list } from '@vercel/blob';

const OVERRIDES_BLOB = 'manual-overrides.json';

async function getOverrides() {
  try {
    const { blobs } = await list({ prefix: OVERRIDES_BLOB, limit: 1 });
    if (blobs.length > 0) {
      const response = await fetch(`${blobs[0].url}?t=${Date.now()}`, { cache: 'no-store' });
      if (response.ok) {
        return await response.json();
      }
    }
  } catch (err) {
    console.error('Error fetching overrides:', err);
  }
  return { spots: {}, updatedAt: null };
}

async function saveOverrides(overrides) {
  overrides.updatedAt = new Date().toISOString();
  await put(OVERRIDES_BLOB, JSON.stringify(overrides, null, 2), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json'
  });
  return overrides;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Simple auth check - require a secret token
  const authToken = req.headers.authorization?.replace('Bearer ', '');
  if (req.method !== 'GET' && authToken !== process.env.OVERRIDE_SECRET) {
    return res.status(401).json({ error: 'Unauthorized. Set OVERRIDE_SECRET env var and pass as Bearer token.' });
  }

  try {
    // GET - Return current overrides
    if (req.method === 'GET') {
      const overrides = await getOverrides();
      return res.status(200).json(overrides);
    }

    // POST - Set override for a spot
    if (req.method === 'POST') {
      const { spotId, score, conditions, note } = req.body;

      if (!spotId) {
        return res.status(400).json({ error: 'spotId is required' });
      }

      if (score === undefined && !conditions) {
        return res.status(400).json({ error: 'At least one of score or conditions is required' });
      }

      const overrides = await getOverrides();

      overrides.spots[spotId] = {
        ...(overrides.spots[spotId] || {}),
        ...(score !== undefined && { score }),
        ...(conditions && { conditions }),
        ...(note && { note }),
        updatedAt: new Date().toISOString()
      };

      await saveOverrides(overrides);

      return res.status(200).json({
        success: true,
        message: `Override set for ${spotId}`,
        override: overrides.spots[spotId]
      });
    }

    // DELETE - Remove override for a spot
    if (req.method === 'DELETE') {
      const { spotId } = req.body;

      if (!spotId) {
        return res.status(400).json({ error: 'spotId is required' });
      }

      const overrides = await getOverrides();

      if (overrides.spots[spotId]) {
        delete overrides.spots[spotId];
        await saveOverrides(overrides);
      }

      return res.status(200).json({
        success: true,
        message: `Override removed for ${spotId}`
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in manual-override:', error);
    return res.status(500).json({ error: error.message });
  }
}
