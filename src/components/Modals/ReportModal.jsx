import { useState, useEffect } from 'react';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/' + (import.meta.env.VITE_FORMSPREE_REPORT_ID || 'xpqaazzr');

function ReportModal({ allSpots, onClose }) {
  const [formData, setFormData] = useState({ spot: '', conditions: '', email: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleEscape = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spot: formData.spot,
          conditions: formData.conditions,
          email: formData.email || 'Not provided',
          _subject: 'Snorkel Report: ' + formData.spot,
        }),
      });
      if (response.ok) setSubmitted(true);
      else throw new Error('Failed');
    } catch {
      setError('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-ocean-900 w-full max-w-md rounded-xl p-6 text-center shadow-2xl border border-ocean-700" onClick={e => e.stopPropagation()}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-score-green/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-score-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Thank You!</h2>
          <p className="text-ocean-300 mb-6">Your report has been submitted.</p>
          <button onClick={onClose} className="w-full py-3 bg-ocean-600 hover:bg-ocean-500 text-white font-medium rounded-lg">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-ocean-900 w-full max-w-md rounded-xl shadow-2xl border border-ocean-700 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-ocean-400 hover:text-white z-10">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 pb-4">
          <h2 className="text-xl font-semibold text-white">Submit a Conditions Report</h2>
          <p className="text-sm text-ocean-400 mt-1">Help fellow snorkelers by sharing what you observed</p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          <div>
            <label htmlFor="spot" className="block text-sm font-medium text-ocean-300 mb-2">Spot Visited *</label>
            <select
              id="spot"
              name="spot"
              value={formData.spot}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-ocean-800 border border-ocean-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-ocean-500"
            >
              <option value="">Select a spot</option>
              {allSpots.map(spot => (
                <option key={spot.id} value={spot.name}>{spot.name} ({spot.zoneName})</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="conditions" className="block text-sm font-medium text-ocean-300 mb-2">Conditions Notes *</label>
            <textarea
              id="conditions"
              name="conditions"
              value={formData.conditions}
              onChange={handleChange}
              required
              rows={4}
              placeholder="What did you see? Weather, water clarity, waves, marine life, etc."
              className="w-full px-4 py-3 bg-ocean-800 border border-ocean-600 rounded-lg text-white placeholder-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-500 resize-none"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ocean-300 mb-2">Email (optional)</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              autoComplete="email"
              className="w-full px-4 py-3 bg-ocean-800 border border-ocean-600 rounded-lg text-white placeholder-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-500"
            />
            <p className="text-xs text-ocean-500 mt-1">In case we have follow-up questions</p>
          </div>

          {error && (
            <div className="p-3 bg-score-red/20 border border-score-red/50 rounded-lg text-score-red text-sm">
              {error}
            </div>
          )}

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
