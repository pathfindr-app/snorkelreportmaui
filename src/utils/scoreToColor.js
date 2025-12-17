/**
 * Converts a score (1-10) to its corresponding color
 *
 * Score ranges:
 * - 1.0 - 3.5: Red (Hazardous)
 * - 3.6 - 5.0: Orange (Caution)
 * - 5.1 - 6.5: Yellow (Moderate)
 * - 6.6 - 10.0: Green (Good)
 */

const SCORE_COLORS = {
  red: '#ef4444',
  orange: '#f97316',
  yellow: '#eab308',
  green: '#22c55e',
};

export function scoreToColor(score) {
  if (score <= 3.5) return SCORE_COLORS.red;
  if (score <= 5.0) return SCORE_COLORS.orange;
  if (score <= 6.5) return SCORE_COLORS.yellow;
  return SCORE_COLORS.green;
}

export function scoreToLabel(score) {
  if (score <= 3.5) return 'Hazardous';
  if (score <= 5.0) return 'Caution';
  if (score <= 6.5) return 'Moderate';
  return 'Good';
}

export function scoreToDescription(score) {
  if (score <= 3.5) return 'Hazardous conditions';
  if (score <= 5.0) return 'Use caution';
  if (score <= 6.5) return 'Moderate conditions';
  return 'Good conditions';
}

export function getScoreColorClass(score) {
  if (score <= 3.5) return 'bg-score-red';
  if (score <= 5.0) return 'bg-score-orange';
  if (score <= 6.5) return 'bg-score-yellow';
  return 'bg-score-green';
}

export function getScoreTextClass(score) {
  if (score <= 3.5) return 'text-score-red';
  if (score <= 5.0) return 'text-score-orange';
  if (score <= 6.5) return 'text-score-yellow';
  return 'text-score-green';
}

export default scoreToColor;
