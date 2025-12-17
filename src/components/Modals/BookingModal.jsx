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
          <h2 className="text-xl font-semibold text-white mb-2">Inquiry Received!</h2>
          <p className="text-ocean-300 mb-6">We'll get back to you within 24 hours.</p>
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
      <div className="relative bg-ocean-900 w-full max-w-lg rounded-xl shadow-2xl border border-ocean-700 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-ocean-400 hover:text-white z-10">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 pb-4">
          <h2 className="text-xl font-semibold text-white">Book an Activity</h2>
          <p className="text-sm text-ocean-400 mt-1">
            {preselectedSpot ? 'Interested in ' + preselectedSpot.name + '?' : "Tell us what you're interested in"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ocean-300 mb-2">What interests you?</label>
            <div className="flex flex-wrap gap-2">
              {ACTIVITY_OPTIONS.map(activity => (
                <button
                  key={activity.id}
                  type="button"
                  onClick={() => handleActivityToggle(activity.id)}
                  className={'px-4 py-2 rounded-lg text-sm font-medium transition-colors ' +
                    (formData.activities.includes(activity.id)
                      ? 'bg-ocean-500 text-ocean-950'
                      : 'bg-ocean-800 text-ocean-300 hover:bg-ocean-700 border border-ocean-600')}
                >
                  {activity.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="partySize" className="block text-sm font-medium text-ocean-300 mb-2">Party Size *</label>
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
                className="w-full px-4 py-3 bg-ocean-800 border border-ocean-600 rounded-lg text-white placeholder-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-500"
              />
            </div>
            <div>
              <label htmlFor="ages" className="block text-sm font-medium text-ocean-300 mb-2">Ages</label>
              <input
                id="ages"
                type="text"
                name="ages"
                value={formData.ages}
                onChange={handleChange}
                placeholder="e.g., 2 adults, 2 kids"
                autoComplete="off"
                className="w-full px-4 py-3 bg-ocean-800 border border-ocean-600 rounded-lg text-white placeholder-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="dates" className="block text-sm font-medium text-ocean-300 mb-2">Preferred Dates *</label>
            <input
              id="dates"
              type="text"
              name="dates"
              value={formData.dates}
              onChange={handleChange}
              required
              placeholder="e.g., Dec 20-24, flexible mornings"
              autoComplete="off"
              className="w-full px-4 py-3 bg-ocean-800 border border-ocean-600 rounded-lg text-white placeholder-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-500"
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-ocean-300 mb-2">Additional Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              placeholder="Any special requests?"
              className="w-full px-4 py-3 bg-ocean-800 border border-ocean-600 rounded-lg text-white placeholder-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ocean-300 mb-2">Email *</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
                autoComplete="email"
                className="w-full px-4 py-3 bg-ocean-800 border border-ocean-600 rounded-lg text-white placeholder-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-500"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-ocean-300 mb-2">Phone</label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(555) 123-4567"
                autoComplete="tel"
                className="w-full px-4 py-3 bg-ocean-800 border border-ocean-600 rounded-lg text-white placeholder-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-500"
              />
            </div>
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
            {submitting ? 'Submitting...' : 'Send Inquiry'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default BookingModal;
