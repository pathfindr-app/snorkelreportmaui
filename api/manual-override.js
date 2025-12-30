// DEPRECATED: Manual overrides are now managed via manual-overrides.json in the repository
// Edit the file directly and push to GitHub - changes are applied during the next conditions update

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET - Return current overrides from file
  if (req.method === 'GET') {
    try {
      const overridesPath = join(__dirname, '../manual-overrides.json');
      if (existsSync(overridesPath)) {
        const overrides = JSON.parse(readFileSync(overridesPath, 'utf-8'));
        return res.status(200).json(overrides);
      }
      return res.status(200).json({ spots: {}, updatedAt: null });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // POST/DELETE - No longer supported via API
  return res.status(200).json({
    success: false,
    message: 'POST/DELETE are deprecated. Edit manual-overrides.json in the repository instead.',
    instructions: 'Push changes to GitHub and they will be applied during the next conditions update.',
    timestamp: new Date().toISOString()
  });
}
