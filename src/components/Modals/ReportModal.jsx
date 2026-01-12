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
        <div
          className="absolute inset-0 backdrop-blur-md"
          style={{ background: 'rgba(3, 11, 18, 0.85)' }}
          onClick={onClose}
        />
        <div
          className="relative w-full max-w-md rounded-3xl p-8 text-center"
          style={{
            background: 'linear-gradient(180deg, rgba(15, 48, 69, 0.95) 0%, rgba(5, 21, 32, 0.98) 100%)',
            border: '1px solid rgba(0, 229, 204, 0.2)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px rgba(0, 229, 204, 0.15)',
          }}
          onClick={e => e.stopPropagation()}
        >
          <div
            className="w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.1) 100%)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              boxShadow: '0 0 30px rgba(34, 197, 94, 0.2)',
            }}
          >
            <svg className="w-10 h-10 text-score-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-display text-ocean-50 mb-2">Thank You!</h2>
          <p className="text-ocean-300 mb-8">Your report has been submitted successfully.</p>
          <button
            onClick={onClose}
            className="glow-btn w-full py-4 rounded-2xl font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div
        className="absolute inset-0 backdrop-blur-md"
        style={{ background: 'rgba(3, 11, 18, 0.85)' }}
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-md rounded-3xl max-h-[90vh] overflow-y-auto"
        style={{
          background: 'linear-gradient(180deg, rgba(15, 48, 69, 0.95) 0%, rgba(5, 21, 32, 0.98) 100%)',
          border: '1px solid rgba(0, 229, 204, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px rgba(0, 229, 204, 0.15)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-glow-cyan/50 to-transparent" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-ocean-400 hover:text-glow-cyan hover:bg-glow-cyan/10 transition-all duration-300 z-10"
          style={{ border: '1px solid rgba(0, 229, 204, 0.2)' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 pb-4">
          <h2 className="text-2xl font-display text-ocean-50">Submit Report</h2>
          <p className="text-sm text-ocean-400 mt-2">Help fellow snorkelers by sharing what you observed</p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
          <div>
            <label htmlFor="spot" className="block text-xs font-semibold text-glow-cyan/60 uppercase tracking-wider mb-2">Spot Visited *</label>
            <select
              id="spot"
              name="spot"
              value={formData.spot}
              onChange={handleChange}
              required
              className="w-full px-4 py-3.5 rounded-2xl text-ocean-100 focus:outline-none transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(10, 34, 53, 0.8) 0%, rgba(5, 21, 32, 0.9) 100%)',
                border: '1px solid rgba(0, 229, 204, 0.15)',
              }}
            >
              <option value="">Select a spot</option>
              {allSpots.map(spot => (
                <option key={spot.id} value={spot.name}>{spot.name} ({spot.zoneName})</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="conditions" className="block text-xs font-semibold text-glow-cyan/60 uppercase tracking-wider mb-2">Conditions Notes *</label>
            <textarea
              id="conditions"
              name="conditions"
              value={formData.conditions}
              onChange={handleChange}
              required
              rows={4}
              placeholder="What did you see? Weather, water clarity, waves, marine life, etc."
              className="w-full px-4 py-3.5 rounded-2xl text-ocean-100 placeholder-ocean-500 focus:outline-none resize-none transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(10, 34, 53, 0.8) 0%, rgba(5, 21, 32, 0.9) 100%)',
                border: '1px solid rgba(0, 229, 204, 0.15)',
              }}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-glow-cyan/60 uppercase tracking-wider mb-2">Email (optional)</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              autoComplete="email"
              className="w-full px-4 py-3.5 rounded-2xl text-ocean-100 placeholder-ocean-500 focus:outline-none transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(10, 34, 53, 0.8) 0%, rgba(5, 21, 32, 0.9) 100%)',
                border: '1px solid rgba(0, 229, 204, 0.15)',
              }}
            />
            <p className="text-xs text-ocean-500 mt-2">In case we have follow-up questions</p>
          </div>

          {error && (
            <div
              className="p-4 rounded-2xl text-coral-warm text-sm"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 126, 103, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%)',
                border: '1px solid rgba(255, 126, 103, 0.3)',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="glow-btn w-full py-4 rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ReportModal;
