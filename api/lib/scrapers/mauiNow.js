// Scraper for Maui Now Weather Page
// URL: https://mauinow.com/weather/

import * as cheerio from 'cheerio';

const MAUI_NOW_URL = 'https://mauinow.com/weather/';

/**
 * Scrapes Maui Now weather page for local conditions and advisories
 * @returns {Promise<{advisories: array, surfConditions: object, windConditions: string}>}
 */
export async function scrapeMauiNow() {
  try {
    const response = await fetch(MAUI_NOW_URL);
    if (!response.ok) {
      throw new Error(`Maui Now fetch failed: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const rawContent = $('body').text().toLowerCase();

    const result = {
      advisories: [],
      surfConditions: {
        north: 'unknown',
        south: 'unknown',
        west: 'unknown',
        east: 'unknown',
        overall: 'moderate'
      },
      windConditions: 'light',
      swellDirection: null,
      source: MAUI_NOW_URL
    };

    // Check for active advisories
    if (rawContent.includes('high surf warning') && !rawContent.includes('cancelled')) {
      result.advisories.push({ type: 'warning', message: 'High Surf Warning in effect' });
    }
    if (rawContent.includes('high surf advisory') && !rawContent.includes('cancelled')) {
      result.advisories.push({ type: 'advisory', message: 'High Surf Advisory in effect' });
    }
    if (rawContent.includes('small craft advisory') && !rawContent.includes('cancelled')) {
      result.advisories.push({ type: 'advisory', message: 'Small Craft Advisory - choppy conditions' });
    }

    // Determine swell direction from content
    if (rawContent.includes('north swell') || rawContent.includes('northerly swell') ||
        rawContent.includes('northwest swell') || rawContent.includes('north northwest swell')) {
      result.swellDirection = 'north';
      result.surfConditions.north = 'elevated';
      result.surfConditions.west = 'elevated';
    }
    if (rawContent.includes('south swell') || rawContent.includes('southerly swell')) {
      result.swellDirection = 'south';
      result.surfConditions.south = 'elevated';
    }
    if (rawContent.includes('east swell') || rawContent.includes('easterly swell')) {
      result.swellDirection = 'east';
      result.surfConditions.east = 'elevated';
    }

    // Check for calm/flat conditions
    if (rawContent.includes('flat') || rawContent.includes('calm') || rawContent.includes('light swell')) {
      result.surfConditions.overall = 'calm';
    }

    // Check for rough conditions
    if (rawContent.includes('advisory levels') || rawContent.includes('elevated') ||
        rawContent.includes('rough') || rawContent.includes('hazardous')) {
      result.surfConditions.overall = 'rough';
    }

    // Wind conditions
    if (rawContent.includes('light wind') || rawContent.includes('winds around 10')) {
      result.windConditions = 'light';
    } else if (rawContent.includes('breezy') || rawContent.includes('winds 15') || rawContent.includes('winds 20')) {
      result.windConditions = 'breezy';
    } else if (rawContent.includes('windy') || rawContent.includes('strong wind') || rawContent.includes('winds 25')) {
      result.windConditions = 'windy';
    }

    // Trade winds check
    if (rawContent.includes('trade wind') || rawContent.includes('trades')) {
      if (rawContent.includes('light trade') || rawContent.includes('weak trade')) {
        result.windConditions = 'light trades';
      } else if (rawContent.includes('moderate trade')) {
        result.windConditions = 'moderate trades';
      } else if (rawContent.includes('strong trade') || rawContent.includes('breezy trade')) {
        result.windConditions = 'strong trades';
      }
    }

    return result;
  } catch (error) {
    console.error('Error scraping Maui Now:', error);
    return {
      advisories: [],
      surfConditions: {
        north: 'unknown',
        south: 'unknown',
        west: 'unknown',
        east: 'unknown',
        overall: 'unknown'
      },
      windConditions: 'unknown',
      swellDirection: null,
      source: MAUI_NOW_URL,
      error: error.message
    };
  }
}

export default scrapeMauiNow;
