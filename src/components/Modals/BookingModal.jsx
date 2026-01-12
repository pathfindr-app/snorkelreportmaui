import { useState, useEffect } from 'react';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/' + (import.meta.env.VITE_FORMSPREE_BOOKING_ID || 'xkowwnnz');

const ACTIVITY_OPTIONS = [
  { id: 'boat', label: 'Boat Snorkel Tour' },
  { id: 'kayak', label: 'Kayak Trip' },
  { id: 'surf', label: 'Surf Lesson' },
  { id: 'luau', label: 'Luau' },
  { id: 'other', label: 'Other' },
];

function BookingModal({ onClose, preselectedSpot }) {
  const [formData, setFormData] = useState({
    activities: [],
    partySize: '',
    ages: '',
    dates: '',
    notes: '',
    email: '',
    phone: '',
  });
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

  const handleActivityToggle = (activityId) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.includes(activityId)
        ? prev.activities.filter(id => id !== activityId)
        : [...prev.activities, activityId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const selectedActivities = formData.activities
      .map(id => ACTIVITY_OPTIONS.find(opt => opt.id === id)?.label)
      .join(', ');

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activities: selectedActivities || 'Not specified',
          partySize: formData.partySize,
          ages: formData.ages || 'Not specified',
          preferredDates: formData.dates,
          notes: formData.notes || 'None',
          email: formData.email,
          phone: formData.phone || 'Not provided',
          referredFrom: preselectedSpot ? preselectedSpot.name : 'General inquiry',
          _subject: 'Booking Inquiry: ' + (selectedActivities || 'Activity'),
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

  const inputStyles = {
    background: 'linear-gradient(135deg, rgba(10, 34, 53, 0.8) 0%, rgba(5, 21, 32, 0.9) 100%)',
    border: '1px solid rgba(0, 229, 204, 0.15)',
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
          <h2 className="text-2xl font-display text-ocean-50 mb-2">Inquiry Received!</h2>
          <p className="text-ocean-300 mb-8">We'll get back to you within 24 hours.</p>
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
        className="relative w-full max-w-lg rounded-3xl max-h-[90vh] overflow-y-auto"
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
          <h2 className="text-2xl font-display text-ocean-50">Book an Activity</h2>
          <p className="text-sm text-ocean-400 mt-2">
            {preselectedSpot ? 'Interested in ' + preselectedSpot.name + '?' : "Tell us what you're interested in"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-glow-cyan/60 uppercase tracking-wider mb-3">What interests you?</label>
            <div className="flex flex-wrap gap-2">
              {ACTIVITY_OPTIONS.map(activity => (
                <button
                  key={activity.id}
                  type="button"
                  onClick={() => handleActivityToggle(activity.id)}
                  className="px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300"
                  style={
                    formData.activities.includes(activity.id)
                      ? {
                          background: 'linear-gradient(135deg, #00e5cc 0%, #14b8a6 100%)',
                          color: '#030b12',
                          boxShadow: '0 0 20px rgba(0, 229, 204, 0.3)',
                        }
                      : {
                          ...inputStyles,
                          color: '#5eead4',
                        }
                  }
                >
                  {activity.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="partySize" className="block text-xs font-semibold text-glow-cyan/60 uppercase tracking-wider mb-2">Party Size *</label>
              <input
                id="partySize"
                type="number"
                name="partySize"
                value={formData.partySize}
                onChange={handleChange}
                required
                min="1"
                placeholder="# of people"
                autoComplete="off"
                className="w-full px-4 py-3.5 rounded-2xl text-ocean-100 placeholder-ocean-500 focus:outline-none transition-all duration-300"
                style={inputStyles}
              />
            </div>
            <div>
              <label htmlFor="ages" className="block text-xs font-semibold text-glow-cyan/60 uppercase tracking-wider mb-2">Ages</label>
              <input
                id="ages"
                type="text"
                name="ages"
                value={formData.ages}
                onChange={handleChange}
                placeholder="e.g., 2 adults, 2 kids"
                autoComplete="off"
                className="w-full px-4 py-3.5 rounded-2xl text-ocean-100 placeholder-ocean-500 focus:outline-none transition-all duration-300"
                style={inputStyles}
              />
            </div>
          </div>

          <div>
            <label htmlFor="dates" className="block text-xs font-semibold text-glow-cyan/60 uppercase tracking-wider mb-2">Preferred Dates *</label>
            <input
              id="dates"
              type="text"
              name="dates"
              value={formData.dates}
              onChange={handleChange}
              required
              placeholder="e.g., Dec 20-24, flexible mornings"
              autoComplete="off"
              className="w-full px-4 py-3.5 rounded-2xl text-ocean-100 placeholder-ocean-500 focus:outline-none transition-all duration-300"
              style={inputStyles}
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-xs font-semibold text-glow-cyan/60 uppercase tracking-wider mb-2">Additional Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              placeholder="Any special requests?"
              className="w-full px-4 py-3.5 rounded-2xl text-ocean-100 placeholder-ocean-500 focus:outline-none resize-none transition-all duration-300"
              style={inputStyles}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-glow-cyan/60 uppercase tracking-wider mb-2">Email *</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
                autoComplete="email"
                className="w-full px-4 py-3.5 rounded-2xl text-ocean-100 placeholder-ocean-500 focus:outline-none transition-all duration-300"
                style={inputStyles}
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-xs font-semibold text-glow-cyan/60 uppercase tracking-wider mb-2">Phone</label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(555) 123-4567"
                autoComplete="tel"
                className="w-full px-4 py-3.5 rounded-2xl text-ocean-100 placeholder-ocean-500 focus:outline-none transition-all duration-300"
                style={inputStyles}
              />
            </div>
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
            {submitting ? 'Submitting...' : 'Send Inquiry'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default BookingModal;
