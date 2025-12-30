// DEPRECATED: Manual overrides are now baked into conditions.json by GitHub Actions
// Edit manual-overrides.json in the repo, and they'll be applied during the next update

export default async function handler(req, res) {
  return res.status(200).json({
    success: false,
    message: 'This endpoint is deprecated. Manual overrides are now applied during the GitHub Actions update.',
    instructions: 'Edit manual-overrides.json in the repository to add overrides.',
    timestamp: new Date().toISOString()
  });
}
