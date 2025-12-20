// Scraper for The Snorkel Store Maui Conditions Report
// URL: https://thesnorkelstore.com/maui-snorkeling-conditions-reports/

import * as cheerio from 'cheerio';

const SNORKEL_STORE_URL = 'https://thesnorkelstore.com/maui-snorkeling-conditions-reports/';

// Map Snorkel Store zone names to our zone IDs
const ZONE_MAPPING = {
  'northwest': 'northwest',
  'north west': 'northwest',
  'kaʻanapali': 'kaanapali',
  'kaanapali': 'kaanapali',
  "ka'anapali": 'kaanapali',
  'south shore': 'southshore',
  'south': 'southshore',
  'kihei': 'southshore',
  'wailea': 'southshore',
  'makena': 'southshore'
};

/**
 * Scrapes The Snorkel Store conditions page for zone scores and narratives
 * @returns {Promise<{zones: object, lastUpdated: string, alerts: array}>}
 */
export async function scrapeSnorkelStore() {
  try {
    const response = await fetch(SNORKEL_STORE_URL);
    if (!response.ok) {
      throw new Error(`Snorkel Store fetch failed: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const zones = {};
    const alerts = [];
    let rawContent = '';

    // Get the main content area
    // The site structure may vary, so we try multiple selectors
    const contentSelectors = [
      '.entry-content',
      '.post-content',
      'article',
      '.content',
      'main'
    ];

    let content = null;
    for (const selector of contentSelectors) {
      if ($(selector).length > 0) {
        content = $(selector).first();
        break;
      }
    }

    if (content) {
      rawContent = content.text();
    } else {
      rawContent = $('body').text();
    }

    // Extract zone scores using regex patterns
    // Looking for patterns like "Northwest: 1.5" or "Northwest - 1.5" or "Northwest 1.5/10"
    const scorePatterns = [
      /(?:northwest|north\s*west)[:\s\-–]+(\d+(?:\.\d+)?)/gi,
      /(?:ka[ʻ']?anapali)[:\s\-–]+(\d+(?:\.\d+)?)/gi,
      /(?:south\s*shore|south|kihei|wailea|makena)[:\s\-–]+(\d+(?:\.\d+)?)/gi
    ];

    const zoneNames = ['northwest', 'kaanapali', 'southshore'];

    for (let i = 0; i < scorePatterns.length; i++) {
      const pattern = scorePatterns[i];
      const matches = rawContent.matchAll(pattern);
      for (const match of matches) {
        const score = parseFloat(match[1]);
        if (score >= 0 && score <= 10) {
          zones[zoneNames[i]] = zones[zoneNames[i]] || {};
          zones[zoneNames[i]].score = score;
          break; // Take the first valid match
        }
      }
    }

    // Extract narratives/descriptions for each zone
    // Look for paragraphs or sections that mention zone names
    const paragraphs = content ? content.find('p').toArray() : $('p').toArray();

    for (const p of paragraphs) {
      const text = $(p).text().trim();
      const textLower = text.toLowerCase();

      // Check if this paragraph is about a specific zone
      if (textLower.includes('northwest') || textLower.includes('north west')) {
        zones.northwest = zones.northwest || {};
        zones.northwest.narrative = zones.northwest.narrative || extractNarrative(text);
      }
      if (textLower.includes('kaanapali') || textLower.includes("ka'anapali") || textLower.includes('kaʻanapali')) {
        zones.kaanapali = zones.kaanapali || {};
        zones.kaanapali.narrative = zones.kaanapali.narrative || extractNarrative(text);
      }
      if (textLower.includes('south shore') || textLower.includes('kihei') ||
          textLower.includes('wailea') || textLower.includes('makena')) {
        zones.southshore = zones.southshore || {};
        zones.southshore.narrative = zones.southshore.narrative || extractNarrative(text);
      }

      // Check for alerts/warnings - only extract SHORT, official-sounding alerts
      // Skip long narrative paragraphs that just mention hazards
      if (text.length < 100 && (textLower.includes('warning') || textLower.includes('advisory'))) {
        // Only add if it sounds like an official alert
        if (textLower.includes('high surf') || textLower.includes('small craft') ||
            textLower.includes('wind advisory') || textLower.includes('in effect')) {
          alerts.push({
            type: textLower.includes('warning') ? 'warning' : 'advisory',
            message: text.trim()
          });
        }
      }
    }

    // Extract the report date if available
    let lastUpdated = new Date().toISOString();
    const datePattern = /(?:december|january|february|march|april|may|june|july|august|september|october|november)\s+\d{1,2},?\s+\d{4}/gi;
    const dateMatches = rawContent.match(datePattern);
    if (dateMatches && dateMatches.length > 0) {
      try {
        const parsedDate = new Date(dateMatches[0]);
        if (!isNaN(parsedDate.getTime())) {
          lastUpdated = parsedDate.toISOString();
        }
      } catch (e) {
        // Keep default date
      }
    }

    return {
      zones,
      alerts: alerts.slice(0, 3), // Limit to 3 alerts
      lastUpdated,
      source: SNORKEL_STORE_URL,
      rawContentLength: rawContent.length
    };
  } catch (error) {
    console.error('Error scraping Snorkel Store:', error);
    return {
      zones: {},
      alerts: [],
      lastUpdated: new Date().toISOString(),
      source: SNORKEL_STORE_URL,
      error: error.message
    };
  }
}

/**
 * Extracts a clean narrative from a paragraph
 */
function extractNarrative(text) {
  // Clean up the text - remove extra whitespace, limit length
  let narrative = text.replace(/\s+/g, ' ').trim();

  // Limit to ~300 characters, ending at a sentence boundary if possible
  if (narrative.length > 300) {
    const truncated = narrative.slice(0, 300);
    const lastPeriod = truncated.lastIndexOf('.');
    if (lastPeriod > 150) {
      narrative = truncated.slice(0, lastPeriod + 1);
    } else {
      narrative = truncated + '...';
    }
  }

  return narrative;
}

export default scrapeSnorkelStore;
