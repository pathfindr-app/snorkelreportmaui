// API Endpoint to serve current conditions
// Returns the latest conditions from Vercel Blob storage

import { list } from '@vercel/blob';

// Fallback to static data if blob is unavailable
import staticConditions from '../src/data/conditions.json' assert { type: 'json' };

export default async function handler(req, res) {
  // Set CORS headers for frontend access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');

  try {
    // Try to fetch from Vercel Blob
    const { blobs } = await list({
      prefix: 'conditions.json',
      limit: 1
    });

    if (blobs.length > 0) {
      const blobUrl = blobs[0].url;
      const response = await fetch(blobUrl);

      if (response.ok) {
        const conditions = await response.json();

        return res.status(200).json({
          ...conditions,
          source: 'blob',
          fetchedAt: new Date().toISOString()
        });
      }
    }

    // Fallback to static conditions
    console.log('Blob not found, using static conditions');
    return res.status(200).json({
      ...staticConditions,
      source: 'static',
      fetchedAt: new Date().toISOString(),
      dataQuality: {
        snorkelStore: 'stale',
        noaaBuoy: 'unavailable',
        noaaTides: 'unavailable',
        note: 'Using cached static data'
      }
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
