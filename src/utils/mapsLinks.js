/**
 * Generate navigation URLs for Google Maps and Apple Maps
 *
 * Behavior:
 * - Desktop: Opens in new browser tab
 * - iOS: Apple Maps link opens native app
 * - Android: Google Maps link opens native app
 */

/**
 * Generate Google Maps search URL
 * @param {Object} spot - Spot object with name and coordinates
 * @returns {string} Google Maps URL
 */
export function getGoogleMapsUrl(spot) {
  const [lng, lat] = spot.coordinates;
  const encodedName = encodeURIComponent(spot.name + ', Maui, Hawaii');
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${encodedName}`;
}

/**
 * Generate Apple Maps URL
 * @param {Object} spot - Spot object with name and coordinates
 * @returns {string} Apple Maps URL
 */
export function getAppleMapsUrl(spot) {
  const [lng, lat] = spot.coordinates;
  const encodedName = encodeURIComponent(spot.name);
  return `https://maps.apple.com/?q=${encodedName}&ll=${lat},${lng}&z=15`;
}

/**
 * Generate directions URL for Google Maps
 * @param {Object} spot - Spot object with coordinates
 * @returns {string} Google Maps directions URL
 */
export function getGoogleMapsDirectionsUrl(spot) {
  const [lng, lat] = spot.coordinates;
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

/**
 * Generate directions URL for Apple Maps
 * @param {Object} spot - Spot object with coordinates
 * @returns {string} Apple Maps directions URL
 */
export function getAppleMapsDirectionsUrl(spot) {
  const [lng, lat] = spot.coordinates;
  const encodedName = encodeURIComponent(spot.name);
  return `https://maps.apple.com/?daddr=${lat},${lng}&dirflg=d&t=m`;
}

export default { getGoogleMapsUrl, getAppleMapsUrl };
