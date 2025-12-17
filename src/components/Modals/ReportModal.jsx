import { useState, useEffect } from 'react';

const FORMSPREE_ENDPOINT = `https://formspree.io/f/${import.meta.env.VITE_FORMSPREE_REPORT_ID}`;

function ReportModal({ allSpots, onClose }) {
  const [formData, setFormData] = useState({
    spot: '',
    conditions: '',
    email: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spot: formData.spot,
          conditions: formData.conditions,
          email: formData.email || 'Not provided',
          _subject: `Snorkel Report: ${formData.spot}`,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        throw new Error('Failed to submit report');
      }
    } catch (err) {
      setError('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Success state
  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div className="absolute inset-0 bg-ocean-950/80 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-ocean-900 w-full sm:w-auto sm:min-w-[400px] sm:max-w-lg sm:rounded-xl rounded-t-xl p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-score-green/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-score-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-ocean-50 mb-2">Thank You!</h2>
          <p className="text-ocean-300 mb-6">Your report has been submitted. We appreciate your help keeping conditions up to date.</p>
          <button
            onClick={onClose}
            className="w-full py-3 bg-ocean-600 hover:bg-ocean-500 text-ocean-50 font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-ocean-950/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal content */}
      <div className="relative bg-ocean-900 w-full sm:w-auto sm:min-w-[400px] sm:max-w-lg sm:rounded-xl rounded-t-xl max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-ocean-400 hover:text-ocean-200 transition-colors z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="p-6 pb-4">
          <h2 className="text-xl font-semibold text-ocean-50">Submit a Conditions Report</h2>
          <p className="text-sm text-ocean-400 mt-1">Help fellow snorkelers by sharing what you observed</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6">
          {/* Spot selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-ocean-300 mb-2">
              Spot Visited *
            </label>
            <select
              name="spot"
              value={formData.spot}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-ocean-800 border border-ocean-700 rounded-lg text-ocean-100 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
            >
              <option value="">Select a spot</option>
              {allSpots.map(spot => (
                <option key={spot.id} value={spot.name}>
                  {spot.name} ({spot.zoneName})
                </option>
              ))}
            </select>
          </div>

          {/* Conditions notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-ocean-300 mb-2">
              Conditions Notes *
            </label>
            <textarea
              name="conditions"
              value={formData.conditions}
              onChange={handleChange}
              required
              rows={4}
              placeholder="What did you see? Weather, water clarity, waves, marine life, etc."
              className="w-full px-4 py-3 bg-ocean-800 border border-ocean-700 rounded-lg text-ocean-100 placeholder-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Email (optional) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-ocean-300 mb-2">
              Email (optional)
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className="w-full px-4 py-3 bg-ocean-800 border border-ocean-700 rounded-lg text-ocean-100 placeholder-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
            />
            <p className="text-xs text-ocean-500 mt-1">In case we have follow-up questions</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-score-red/20 border border-score-red/50 rounded-lg text-score-red text-sm">
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-ocean-500 hover:bg-ocean-400 disabled:bg-ocean-700 disabled:cursor-not-allowed text-ocean-950 font-semibold rounded-lg transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ReportModal;
