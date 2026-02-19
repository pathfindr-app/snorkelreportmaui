import { useEffect, useState } from 'react';

const FORMSPREE_PRIVATE_ENDPOINT =
  'https://formspree.io/f/' +
  (import.meta.env.VITE_FORMSPREE_PRIVATE_ID || import.meta.env.VITE_FORMSPREE_BOOKING_ID || 'xkowwnnz');

const GALLERY_IMAGES = Array.from({ length: 24 }, (_, index) => {
  const imageNumber = String(index + 1).padStart(2, '0');
  return {
    src: `/private-gallery/kyle-${imageNumber}.jpg`,
    alt: `Kyle private ocean session photo ${index + 1}`,
    label: `Photo ${imageNumber}`,
  };
});

const EXPERIENCE_OPTIONS = [
  'Beginner friendly',
  'Comfortable snorkeler',
  'Certified diver',
  'Mixed-level group',
];

function PrivateExperienceModal({ onClose }) {
  const [missingImages, setMissingImages] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    groupSize: '',
    preferredArea: 'south-side',
    preferredDates: '',
    experienceLevel: 'Beginner friendly',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageError = (src) => {
    setMissingImages((prev) => {
      if (prev[src]) return prev;
      return { ...prev, [src]: true };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(FORMSPREE_PRIVATE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: "Kyle's Private Ocean Sessions",
          privateExperience: 'One booking at a time. Never mixed groups.',
          pricing: 'South side from $135/person, West side from $160/person',
          guideCredentials: '11 years guiding in Maui, PADI Divemaster, website creator and photographer',
          name: formData.name,
          email: formData.email,
          phone: formData.phone || 'Not provided',
          groupSize: formData.groupSize,
          preferredArea: formData.preferredArea,
          preferredDates: formData.preferredDates,
          experienceLevel: formData.experienceLevel,
          notes: formData.notes || 'None',
          source: 'Private Experience Modal',
          _subject: 'Private Session Inquiry for Kyle',
        }),
      });

      if (!response.ok) throw new Error('Failed');
      setSubmitted(true);
    } catch {
      setError('Failed to submit. Please call or text Kyle at 808-250-7337.');
    } finally {
      setSubmitting(false);
    }
  };

  const galleryImageCount = GALLERY_IMAGES.length;
  const loadedImageCount = galleryImageCount - Object.keys(missingImages).length;

  const inputStyles = {
    background: 'linear-gradient(135deg, rgba(10, 34, 53, 0.8) 0%, rgba(5, 21, 32, 0.9) 100%)',
    border: '1px solid rgba(0, 229, 204, 0.15)',
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
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
          onClick={(event) => event.stopPropagation()}
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

          <h2 className="text-2xl font-display text-ocean-50 mb-2">Inquiry Received</h2>
          <p className="text-ocean-300 mb-4">Kyle will follow up with your private session options.</p>
          <a href="tel:+18082507337" className="inline-block text-glow-cyan font-semibold mb-8 hover:text-ocean-50 transition-colors">
            Call Kyle now: 808-250-7337
          </a>

          <button onClick={onClose} className="glow-btn w-full py-4 rounded-2xl font-semibold">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 backdrop-blur-md"
        style={{ background: 'rgba(3, 11, 18, 0.85)' }}
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-5xl rounded-3xl max-h-[92vh] overflow-y-auto"
        style={{
          background: 'linear-gradient(180deg, rgba(15, 48, 69, 0.95) 0%, rgba(5, 21, 32, 0.98) 100%)',
          border: '1px solid rgba(0, 229, 204, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px rgba(0, 229, 204, 0.15)',
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-glow-cyan/50 to-transparent" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-ocean-400 hover:text-glow-cyan hover:bg-glow-cyan/10 transition-all duration-300 z-10"
          style={{ border: '1px solid rgba(0, 229, 204, 0.2)' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 sm:p-8 pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-glow-cyan/70 mb-2">
            Private Snorkel, Scuba & Underwater Photography
          </p>
          <h2 className="text-3xl sm:text-4xl font-display text-ocean-50 leading-tight">
            Kyle&apos;s Private Ocean Sessions
          </h2>
          <p className="text-ocean-200 mt-3 max-w-3xl">
            Book a private snorkel or scuba dive with an experienced guide, professional underwater
            photographer, and the creator of this website.
          </p>

          <div className="grid sm:grid-cols-3 gap-3 mt-5">
            <div className="rounded-2xl px-4 py-3" style={inputStyles}>
              <p className="text-[11px] uppercase tracking-wider text-ocean-400">Proof</p>
              <p className="text-sm text-ocean-100 mt-1">Every photo on this website was shot by Kyle</p>
            </div>
            <div className="rounded-2xl px-4 py-3" style={inputStyles}>
              <p className="text-[11px] uppercase tracking-wider text-ocean-400">Experience</p>
              <p className="text-sm text-ocean-100 mt-1">11 years guiding Maui waters + PADI Divemaster</p>
            </div>
            <div className="rounded-2xl px-4 py-3" style={inputStyles}>
              <p className="text-[11px] uppercase tracking-wider text-ocean-400">Guarantee</p>
              <p className="text-sm text-ocean-100 mt-1">One booking at a time. No mixed groups, ever.</p>
            </div>
          </div>
        </div>

        <div className="px-6 sm:px-8 pb-6">
          <div
            className="rounded-2xl p-5"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 126, 103, 0.08) 0%, rgba(253, 164, 175, 0.05) 100%)',
              border: '1px solid rgba(255, 126, 103, 0.22)',
            }}
          >
            <h3 className="text-lg font-semibold text-ocean-50 mb-1">Private Means Private</h3>
            <p className="text-ocean-200 text-sm">
              You are not booking a seat on a shared trip. Each session is reserved for your party only,
              whether you are a couple, family, or small group of friends.
            </p>
          </div>
        </div>

        <div className="px-6 sm:px-8 pb-6 grid md:grid-cols-2 gap-4">
          <div
            className="rounded-2xl p-5"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 229, 204, 0.1) 0%, rgba(20, 184, 166, 0.07) 100%)',
              border: '1px solid rgba(0, 229, 204, 0.2)',
            }}
          >
            <p className="text-xs uppercase tracking-wider text-glow-cyan/70">South Side Spots</p>
            <p className="text-3xl font-display text-ocean-50 mt-1">$135</p>
            <p className="text-sm text-ocean-300 mt-1">Starting price per person</p>
          </div>

          <div
            className="rounded-2xl p-5"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 229, 204, 0.1) 0%, rgba(20, 184, 166, 0.07) 100%)',
              border: '1px solid rgba(0, 229, 204, 0.2)',
            }}
          >
            <p className="text-xs uppercase tracking-wider text-glow-cyan/70">West Side Spots</p>
            <p className="text-3xl font-display text-ocean-50 mt-1">$160</p>
            <p className="text-sm text-ocean-300 mt-1">Starting price per person</p>
          </div>
        </div>

        <div className="px-6 sm:px-8 pb-6">
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1.5 rounded-full text-xs text-ocean-100" style={inputStyles}>Couples</span>
            <span className="px-3 py-1.5 rounded-full text-xs text-ocean-100" style={inputStyles}>Small Groups</span>
            <span className="px-3 py-1.5 rounded-full text-xs text-ocean-100" style={inputStyles}>Beginners Welcome</span>
            <span className="px-3 py-1.5 rounded-full text-xs text-ocean-100" style={inputStyles}>Experienced Divers</span>
            <span className="px-3 py-1.5 rounded-full text-xs text-ocean-100" style={inputStyles}>Pro Photo Coverage</span>
          </div>
        </div>

        <div className="px-6 sm:px-8 pb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="tel:+18082507337"
              className="glow-btn flex-1 py-3.5 rounded-2xl text-center font-semibold"
            >
              Call Kyle: 808-250-7337
            </a>
            <a
              href="sms:+18082507337"
              className="glow-btn-outline flex-1 py-3.5 rounded-2xl text-center font-semibold"
            >
              Text Kyle
            </a>
          </div>
        </div>

        <div className="px-6 sm:px-8 pb-6">
          <div className="flex items-center justify-between gap-4 mb-3">
            <h3 className="text-xl font-semibold text-ocean-50">Photo Gallery</h3>
            <span className="text-xs text-ocean-400">
              {loadedImageCount}/{galleryImageCount} loaded
            </span>
          </div>

          <p className="text-xs text-ocean-500 mb-4">
            Add images to <code className="text-glow-cyan/70">/public/private-gallery/kyle-01.jpg</code> through
            <code className="text-glow-cyan/70"> /public/private-gallery/kyle-24.jpg</code>.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {GALLERY_IMAGES.map((image) => (
              <div
                key={image.src}
                className="rounded-2xl overflow-hidden border border-glow-cyan/15"
                style={{ background: 'linear-gradient(135deg, rgba(10, 34, 53, 0.8) 0%, rgba(5, 21, 32, 0.85) 100%)' }}
              >
                {!missingImages[image.src] ? (
                  <img
                    src={image.src}
                    alt={image.alt}
                    loading="lazy"
                    className="w-full aspect-[4/5] object-cover"
                    onError={() => handleImageError(image.src)}
                  />
                ) : (
                  <div className="w-full aspect-[4/5] p-3 flex flex-col items-center justify-center text-center">
                    <p className="text-xs text-ocean-400">Upload</p>
                    <p className="text-sm text-glow-cyan mt-1">{image.label}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mx-6 sm:mx-8 h-px bg-gradient-to-r from-transparent via-glow-cyan/20 to-transparent" />

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          <h3 className="text-xl font-semibold text-ocean-50">Send Private Session Inquiry</h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-glow-cyan/60 uppercase tracking-wider mb-2">
                Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3.5 rounded-2xl text-ocean-100 placeholder-ocean-500 focus:outline-none"
                style={inputStyles}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-glow-cyan/60 uppercase tracking-wider mb-2">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3.5 rounded-2xl text-ocean-100 placeholder-ocean-500 focus:outline-none"
                style={inputStyles}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="phone" className="block text-xs font-semibold text-glow-cyan/60 uppercase tracking-wider mb-2">
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(808) 250-7337"
                className="w-full px-4 py-3.5 rounded-2xl text-ocean-100 placeholder-ocean-500 focus:outline-none"
                style={inputStyles}
              />
            </div>

            <div>
              <label htmlFor="groupSize" className="block text-xs font-semibold text-glow-cyan/60 uppercase tracking-wider mb-2">
                Group Size *
              </label>
              <input
                id="groupSize"
                name="groupSize"
                type="number"
                min="1"
                value={formData.groupSize}
                onChange={handleChange}
                required
                className="w-full px-4 py-3.5 rounded-2xl text-ocean-100 placeholder-ocean-500 focus:outline-none"
                style={inputStyles}
              />
            </div>

            <div>
              <label htmlFor="preferredArea" className="block text-xs font-semibold text-glow-cyan/60 uppercase tracking-wider mb-2">
                Preferred Side
              </label>
              <select
                id="preferredArea"
                name="preferredArea"
                value={formData.preferredArea}
                onChange={handleChange}
                className="w-full px-4 py-3.5 rounded-2xl text-ocean-100 focus:outline-none"
                style={inputStyles}
              >
                <option value="south-side">South Side</option>
                <option value="west-side">West Side</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="preferredDates" className="block text-xs font-semibold text-glow-cyan/60 uppercase tracking-wider mb-2">
                Preferred Dates *
              </label>
              <input
                id="preferredDates"
                name="preferredDates"
                type="text"
                value={formData.preferredDates}
                onChange={handleChange}
                required
                placeholder="e.g., Mar 12-15 mornings"
                className="w-full px-4 py-3.5 rounded-2xl text-ocean-100 placeholder-ocean-500 focus:outline-none"
                style={inputStyles}
              />
            </div>

            <div>
              <label htmlFor="experienceLevel" className="block text-xs font-semibold text-glow-cyan/60 uppercase tracking-wider mb-2">
                Experience Level
              </label>
              <select
                id="experienceLevel"
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                className="w-full px-4 py-3.5 rounded-2xl text-ocean-100 focus:outline-none"
                style={inputStyles}
              >
                {EXPERIENCE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-xs font-semibold text-glow-cyan/60 uppercase tracking-wider mb-2">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              placeholder="Tell Kyle what you want captured and your comfort level in the water."
              className="w-full px-4 py-3.5 rounded-2xl text-ocean-100 placeholder-ocean-500 focus:outline-none resize-none"
              style={inputStyles}
            />
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
            {submitting ? 'Submitting...' : 'Book Your Private Session'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PrivateExperienceModal;
