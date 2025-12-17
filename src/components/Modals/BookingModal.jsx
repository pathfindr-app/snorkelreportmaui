import { useState, useEffect } from 'react';

const FORMSPREE_ENDPOINT = `https://formspree.io/f/${import.meta.env.VITE_FORMSPREE_BOOKING_ID}`;

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activities: selectedActivities || 'Not specified',
          partySize: formData.partySize,
          ages: formData.ages || 'Not specified',
          preferredDates: formData.dates,
          notes: formData.notes || 'None',
          email: formData.email,
          phone: formData.phone || 'Not provided',
          referredFrom: preselectedSpot ? preselectedSpot.name : 'General inquiry',
          _subject: `Booking Inquiry: ${selectedActivities || 'Activity'}`,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        throw new Error('Failed to submit inquiry');
      }
    } catch (err) {
      setError('Failed to submit inquiry. Please try again.');
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
          <h2 className="text-xl font-semibold text-ocean-50 mb-2">Inquiry Received!</h2>
          <p className="text-ocean-300 mb-6">We'll get back to you within 24 hours with availability and pricing.</p>
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
          <h2 className="text-xl font-semibold text-ocean-50">Book an Activity</h2>
          <p className="text-sm text-ocean-400 mt-1">
            {preselectedSpot
              ? `Interested in ${preselectedSpot.name}? Let us help you plan!`
              : "Tell us what you're interested in and we'll find the best options"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6">
          {/* Activity selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-ocean-300 mb-2">
              What interests you?
            </label>
            <div className="flex flex-wrap gap-2">
              {ACTIVITY_OPTIONS.map(activity => (
                <button
                  key={activity.id}
                  type="button"
                  onClick={() => handleActivityToggle(activity.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.activities.includes(activity.id)
                      ? 'bg-ocean-500 text-ocean-950'
                      : 'bg-ocean-800 text-ocean-300 hover:bg-ocean-700'
                  }`}
                >
                  {activity.label}
                </button>
              ))}
            </div>
          </div>

          {/* Party size */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-ocean-300 mb-2">
              Party Size *
            </label>
            <input
              type="number"
              name="partySize"
              value={formData.partySize}
              onChange={handleChange}
              required
              min="1"
              placeholder="Number of people"
              className="w-full px-4 py-3 bg-ocean-800 border border-ocean-700 rounded-lg text-ocean-100 placeholder-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
            />
          </div>

          {/* Ages */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-ocean-300 mb-2">
              Ages of Participants
            </label>
            <input
              type="text"
              name="ages"
              value={formData.ages}
              onChange={handleChange}
              placeholder="e.g., 2 adults, 2 kids (8 and 12)"
              className="w-full px-4 py-3 bg-ocean-800 border border-ocean-700 rounded-lg text-ocean-100 placeholder-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
            />
          </div>

          {/* Preferred dates */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-ocean-300 mb-2">
              Preferred Dates *
            </label>
            <input
              type="text"
              name="dates"
              value={formData.dates}
              onChange={handleChange}
              required
              placeholder="e.g., Dec 20-24, flexible mornings"
              className="w-full px-4 py-3 bg-ocean-800 border border-ocean-700 rounded-lg text-ocean-100 placeholder-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
            />
          </div>

          {/* Additional notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-ocean-300 mb-2">
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Any special requests or questions?"
              className="w-full px-4 py-3 bg-ocean-800 border border-ocean-700 rounded-lg text-ocean-100 placeholder-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Contact info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-ocean-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-ocean-800 border border-ocean-700 rounded-lg text-ocean-100 placeholder-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ocean-300 mb-2">
                Phone (optional)
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(555) 123-4567"
                className="w-full px-4 py-3 bg-ocean-800 border border-ocean-700 rounded-lg text-ocean-100 placeholder-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
              />
            </div>
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
            {submitting ? 'Submitting...' : 'Send Inquiry'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default BookingModal;
