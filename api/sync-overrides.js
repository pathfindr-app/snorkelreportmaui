// API Endpoint to sync manual overrides from GitHub
// Called by GitHub Actions when manual-overrides.json is pushed

import { put } from '@vercel/blob';

const OVERRIDES_BLOB = 'manual-overrides.json';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Auth check - require secret token
  const authToken = req.headers.authorization?.replace('Bearer ', '');
  if (authToken !== process.env.OVERRIDE_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const overrides = req.body;

    // Validate structure
    if (!overrides || typeof overrides !== 'object') {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }

    // Ensure spots object exists
    if (!overrides.spots) {
      overrides.spots = {};
    }

    // Remove comment fields before saving
    delete overrides._comment;
    delete overrides._example;

    // Update timestamp
    overrides.updatedAt = new Date().toISOString();
    overrides.syncedFrom = 'github';

    // Save to Vercel Blob
    await put(OVERRIDES_BLOB, JSON.stringify(overrides, null, 2), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json'
    });

    return res.status(200).json({
      success: true,
      message: 'Overrides synced from GitHub',
      spotCount: Object.keys(overrides.spots).length,
      updatedAt: overrides.updatedAt
    });
  } catch (error) {
    console.error('Error syncing overrides:', error);
    return res.status(500).json({ error: error.message });
  }
}
