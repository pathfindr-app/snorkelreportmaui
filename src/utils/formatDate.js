/**
 * Date formatting utilities for Hawaii time zone
 */

const HAWAII_TIMEZONE = 'Pacific/Honolulu';

/**
 * Format ISO date string to display format
 * Example: "2025-12-16T07:02:00-10:00" -> "Tuesday, December 16, 2025 - 7:02 AM"
 */
export function formatLastUpdated(isoString) {
  const date = new Date(isoString);

  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: HAWAII_TIMEZONE,
  };

  return date.toLocaleString('en-US', options);
}

/**
 * Format to short date for mobile
 * Example: "Dec 16, 2025 - 7:02 AM"
 */
export function formatShortDate(isoString) {
  const date = new Date(isoString);

  const options = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: HAWAII_TIMEZONE,
  };

  return date.toLocaleString('en-US', options);
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
}

export default formatLastUpdated;
