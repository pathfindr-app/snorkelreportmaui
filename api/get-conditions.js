// API Endpoint to serve current conditions
// Returns conditions from data/conditions.json (updated by GitHub Actions)
// Fallback to static JSON if the data file is unavailable

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Try to load conditions from data/ directory, fallback to static
function loadConditions() {
  const dataPath = join(__dirname, '../data/conditions.json');
  const staticPath = join(__dirname, '../src/data/conditions.json');

  try {
    if (existsSync(dataPath)) {
      return {
        data: JSON.parse(readFileSync(dataPath, 'utf-8')),
        source: 'github'
      };
    }
  } catch (err) {
    console.error('Error reading data/conditions.json:', err);
  }

  // Fallback to static data
  return {
    data: JSON.parse(readFileSync(staticPath, 'utf-8')),
    source: 'static'
  };
}

export default async function handler(req, res) {
  // Set CORS headers for frontend access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');

  try {
    const { data, source } = loadConditions();

    return res.status(200).json({
      ...data,
      source,
      fetchedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching conditions:', error);

    return res.status(500).json({
      error: error.message,
      fetchedAt: new Date().toISOString()
    });
  }
}
