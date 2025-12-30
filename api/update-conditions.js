// DEPRECATED: Conditions are now updated via GitHub Actions
// See: .github/workflows/update-snorkel-conditions.yml
// This endpoint is kept for backwards compatibility but does not update conditions

export const config = {
  maxDuration: 60
};

export default async function handler(req, res) {
  return res.status(200).json({
    success: false,
    message: 'This endpoint is deprecated. Conditions are now updated via GitHub Actions at 8:05am HST daily.',
    note: 'See .github/workflows/update-snorkel-conditions.yml for the new update mechanism.',
    timestamp: new Date().toISOString()
  });
}
