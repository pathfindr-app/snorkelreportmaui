// NOAA Tides API - Kahului Harbor, Maui (Station 1615680)
// API Docs: https://api.tidesandcurrents.noaa.gov/api/prod/

const STATION_ID = '1615680';
const BASE_URL = 'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter';

/**
 * Fetches tide predictions for today from NOAA
 * @returns {Promise<{currentTide: object, nextHighTide: object, nextLowTide: object}>}
 */
export async function fetchTideData() {
  try {
    // Get today's date in Hawaii time (UTC-10)
    const now = new Date();
    const hawaiiOffset = -10 * 60; // minutes
    const hawaiiTime = new Date(now.getTime() + (now.getTimezoneOffset() + hawaiiOffset) * 60000);

    const today = formatDate(hawaiiTime);
    const tomorrow = formatDate(new Date(hawaiiTime.getTime() + 24 * 60 * 60 * 1000));

    const url = `${BASE_URL}?station=${STATION_ID}&product=predictions&datum=MLLW&units=english&time_zone=lst_ldt&format=json&begin_date=${today}&end_date=${tomorrow}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`NOAA tides fetch failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data.predictions || data.predictions.length === 0) {
      throw new Error('No tide predictions found');
    }

    // Find high and low tides by looking for local maxima/minima
    const tides = findTideExtremes(data.predictions);

    // Get current tide level (closest to current time)
    const currentHawaiiTimeStr = formatDateTime(hawaiiTime);
    const currentTide = findClosestTide(data.predictions, currentHawaiiTimeStr);

    // Find next high and low tides after current time
    const nextHighTide = tides.highs.find(t => t.time > currentHawaiiTimeStr) || tides.highs[0];
    const nextLowTide = tides.lows.find(t => t.time > currentHawaiiTimeStr) || tides.lows[0];

    return {
      currentTide: {
        height: `${parseFloat(currentTide.v).toFixed(1)} ft`,
        time: formatTimeOnly(currentTide.t),
        rising: isRising(data.predictions, currentTide)
      },
      nextHighTide: nextHighTide ? {
        height: `${parseFloat(nextHighTide.height).toFixed(1)} ft`,
        time: formatTimeOnly(nextHighTide.time)
      } : null,
      nextLowTide: nextLowTide ? {
        height: `${parseFloat(nextLowTide.height).toFixed(1)} ft`,
        time: formatTimeOnly(nextLowTide.time)
      } : null,
      source: 'NOAA Tides Station 1615680'
    };
  } catch (error) {
    console.error('Error fetching tide data:', error);
    return {
      currentTide: null,
      nextHighTide: null,
      nextLowTide: null,
      source: 'NOAA Tides Station 1615680',
      error: error.message
    };
  }
}

/**
 * Finds high and low tide extremes in prediction data
 */
function findTideExtremes(predictions) {
  const highs = [];
  const lows = [];

  for (let i = 1; i < predictions.length - 1; i++) {
    const prev = parseFloat(predictions[i - 1].v);
    const curr = parseFloat(predictions[i].v);
    const next = parseFloat(predictions[i + 1].v);

    if (curr > prev && curr > next) {
      highs.push({ time: predictions[i].t, height: predictions[i].v });
    } else if (curr < prev && curr < next) {
      lows.push({ time: predictions[i].t, height: predictions[i].v });
    }
  }

  return { highs, lows };
}

/**
 * Finds the prediction closest to the given time
 */
function findClosestTide(predictions, targetTime) {
  let closest = predictions[0];
  let minDiff = Infinity;

  for (const pred of predictions) {
    const diff = Math.abs(new Date(pred.t).getTime() - new Date(targetTime).getTime());
    if (diff < minDiff) {
      minDiff = diff;
      closest = pred;
    }
  }

  return closest;
}

/**
 * Determines if the tide is rising at the given prediction point
 */
function isRising(predictions, currentPred) {
  const idx = predictions.findIndex(p => p.t === currentPred.t);
  if (idx < predictions.length - 1) {
    const curr = parseFloat(predictions[idx].v);
    const next = parseFloat(predictions[idx + 1].v);
    return next > curr;
  }
  return false;
}

/**
 * Formats a date as YYYYMMDD
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Formats a date as YYYY-MM-DD HH:MM
 */
function formatDateTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * Extracts time from YYYY-MM-DD HH:MM format
 */
function formatTimeOnly(dateTimeStr) {
  const parts = dateTimeStr.split(' ');
  if (parts.length === 2) {
    const [hours, minutes] = parts[1].split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  }
  return dateTimeStr;
}

export default fetchTideData;
