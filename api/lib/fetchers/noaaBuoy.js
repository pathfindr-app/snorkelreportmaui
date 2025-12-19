// NOAA Buoy 51205 (Pauwela, Maui) Data Fetcher
// Data URL: https://www.ndbc.noaa.gov/data/realtime2/51205.txt

const BUOY_URL = 'https://www.ndbc.noaa.gov/data/realtime2/51205.txt';

/**
 * Fetches and parses NOAA buoy data for wave height and water temperature
 * @returns {Promise<{waveHeight: number, waveHeightFt: string, waterTemp: number, waterTempF: string, waveDirection: string, timestamp: string}>}
 */
export async function fetchBuoyData() {
  try {
    const response = await fetch(BUOY_URL);
    if (!response.ok) {
      throw new Error(`NOAA buoy fetch failed: ${response.status}`);
    }

    const text = await response.text();
    const lines = text.trim().split('\n');

    // Skip header lines (start with #) and get the most recent data
    const dataLines = lines.filter(line => !line.startsWith('#'));
    if (dataLines.length === 0) {
      throw new Error('No data lines found in buoy response');
    }

    // Parse the most recent reading (first data line)
    const latestLine = dataLines[0];
    const columns = latestLine.trim().split(/\s+/);

    // Column indices (0-based):
    // 0: YY, 1: MM, 2: DD, 3: hh, 4: mm
    // 8: WVHT (wave height in meters)
    // 11: MWD (mean wave direction in degrees)
    // 14: WTMP (water temp in Celsius)

    const wvhtRaw = columns[8];
    const mwdRaw = columns[11];
    const wtmpRaw = columns[14];

    // Parse values, handling 'MM' (missing) values
    const waveHeightM = wvhtRaw === 'MM' ? null : parseFloat(wvhtRaw);
    const waveDirection = mwdRaw === 'MM' ? null : parseInt(mwdRaw, 10);
    const waterTempC = wtmpRaw === 'MM' ? null : parseFloat(wtmpRaw);

    // Convert units
    const waveHeightFt = waveHeightM !== null ? (waveHeightM * 3.28084).toFixed(1) : null;
    const waterTempF = waterTempC !== null ? ((waterTempC * 9/5) + 32).toFixed(0) : null;

    // Convert wave direction to compass
    const waveDirectionCompass = waveDirection !== null ? degreesToCompass(waveDirection) : null;

    // Build timestamp
    const year = columns[0];
    const month = columns[1];
    const day = columns[2];
    const hour = columns[3];
    const minute = columns[4];
    const timestamp = `${year}-${month}-${day} ${hour}:${minute} UTC`;

    return {
      waveHeight: waveHeightM,
      waveHeightFt: waveHeightFt ? `${waveHeightFt} ft` : 'unavailable',
      waterTemp: waterTempC,
      waterTempF: waterTempF ? `${waterTempF}°F` : 'unavailable',
      waveDirection: waveDirection,
      waveDirectionCompass: waveDirectionCompass || 'unavailable',
      timestamp,
      source: 'NOAA Buoy 51205'
    };
  } catch (error) {
    console.error('Error fetching buoy data:', error);
    return {
      waveHeight: null,
      waveHeightFt: 'unavailable',
      waterTemp: null,
      waterTempF: 'unavailable',
      waveDirection: null,
      waveDirectionCompass: 'unavailable',
      timestamp: null,
      source: 'NOAA Buoy 51205',
      error: error.message
    };
  }
}

/**
 * Converts degrees to 16-point compass direction
 */
function degreesToCompass(degrees) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

export default fetchBuoyData;
