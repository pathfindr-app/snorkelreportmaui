import { useEffect } from 'react';
import { getGoogleMapsDirectionsUrl, getAppleMapsDirectionsUrl } from '../../utils/mapsLinks';

const ICON_MAP = {
  pizza: { image: '/outrigger-logo.png' },
  sandwich: { image: '/808deli-logo.png' },
  boat: { image: '/aqua-adventures-logo.png' },
};

function BusinessModal({ business, onClose, onBooking }) {
  const iconConfig = ICON_MAP[business.icon] || { image: null };

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
      document.body.style.overflow = '';
    };
  }, []);

  // Create a spot-like object for directions
  const locationForDirections = {
    name: business.name,
    coordinates: business.coordinates,
  };

  const buttonStyles = {
    background: 'linear-gradient(135deg, rgba(10, 34, 53, 0.8) 0%, rgba(5, 21, 32, 0.9) 100%)',
    border: '1px solid rgba(0, 229, 204, 0.15)',
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-md"
        style={{ background: 'rgba(3, 11, 18, 0.85)' }}
        onClick={onClose}
      />

      {/* Modal content */}
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

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-ocean-400 hover:text-glow-cyan hover:bg-glow-cyan/10 transition-all duration-300 z-10"
          style={{ border: '1px solid rgba(0, 229, 204, 0.2)' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between gap-4 pr-10">
            <div>
              <h2 className="text-2xl font-display text-ocean-50">{business.name}</h2>
              {business.hours && (
                <p className="text-sm text-glow-cyan/70 mt-1.5 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {business.hours}
                </p>
              )}
            </div>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 253, 250, 0.9) 100%)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 229, 204, 0.15)',
              }}
            >
              <img src={iconConfig.image} alt={business.name} className="w-11 h-11 object-cover rounded-xl" />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="px-6 pb-5">
          <h3 className="text-xs font-semibold text-glow-cyan/60 uppercase tracking-wider mb-2">About</h3>
          <p className="text-ocean-200 text-sm leading-relaxed">{business.description}</p>
        </div>

        {/* Signature dish */}
        {business.signature && (
          <div className="px-6 pb-5">
            <h3 className="text-xs font-semibold text-coral-warm/80 uppercase tracking-wider mb-2">Must Try</h3>
            <div
              className="p-4 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 126, 103, 0.08) 0%, rgba(253, 164, 175, 0.04) 100%)',
                border: '1px solid rgba(255, 126, 103, 0.15)',
              }}
            >
              <p className="text-ocean-100 italic text-sm">{business.signature}</p>
            </div>
          </div>
        )}

        {/* Highlights */}
        {business.highlights && business.highlights.length > 0 && (
          <div className="px-6 pb-5">
            <h3 className="text-xs font-semibold text-glow-cyan/60 uppercase tracking-wider mb-3">Highlights</h3>
            <div className="flex flex-wrap gap-2">
              {business.highlights.map((highlight, index) => (
                <span
                  key={index}
                  className="px-4 py-1.5 text-sm rounded-full font-medium"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 229, 204, 0.1) 0%, rgba(20, 184, 166, 0.05) 100%)',
                    border: '1px solid rgba(0, 229, 204, 0.2)',
                    color: '#5eead4',
                  }}
                >
                  {highlight}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="px-6 pb-5">
          <h3 className="text-xs font-semibold text-glow-cyan/60 uppercase tracking-wider mb-3">Get Directions</h3>
          <div className="grid grid-cols-2 gap-3">
            <a
              href={getGoogleMapsDirectionsUrl(locationForDirections)}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl transition-all duration-300"
              style={buttonStyles}
            >
              <svg className="w-5 h-5 text-glow-cyan/70 group-hover:text-glow-cyan transition-colors" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span className="text-ocean-200 group-hover:text-ocean-50 transition-colors text-sm font-medium">Google Maps</span>
            </a>
            <a
              href={getAppleMapsDirectionsUrl(locationForDirections)}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl transition-all duration-300"
              style={buttonStyles}
            >
              <svg className="w-5 h-5 text-glow-cyan/70 group-hover:text-glow-cyan transition-colors" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span className="text-ocean-200 group-hover:text-ocean-50 transition-colors text-sm font-medium">Apple Maps</span>
            </a>
          </div>
        </div>

        {/* Contact info */}
        {(business.phone || business.website) && (
          <div className="px-6 pb-5">
            <h3 className="text-xs font-semibold text-glow-cyan/60 uppercase tracking-wider mb-3">Contact</h3>
            <div className="grid grid-cols-2 gap-3">
              {business.phone && (
                <a
                  href={`tel:${business.phone}`}
                  className="group flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl transition-all duration-300"
                  style={buttonStyles}
                >
                  <svg className="w-5 h-5 text-glow-cyan/70 group-hover:text-glow-cyan transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-ocean-200 group-hover:text-ocean-50 transition-colors text-sm font-medium">Call</span>
                </a>
              )}
              {business.website && (
                <a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl transition-all duration-300"
                  style={buttonStyles}
                >
                  <svg className="w-5 h-5 text-glow-cyan/70 group-hover:text-glow-cyan transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <span className="text-ocean-200 group-hover:text-ocean-50 transition-colors text-sm font-medium">Website</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Coordinates display */}
        <div className="px-6 pb-4">
          <p className="text-xs text-ocean-500 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            {business.coordinates[1].toFixed(4)}, {business.coordinates[0].toFixed(4)}
          </p>
        </div>

        {/* Divider with glow */}
        <div className="mx-6 h-px bg-gradient-to-r from-transparent via-glow-cyan/20 to-transparent" />

        {/* Action buttons */}
        <div className="p-6">
          {business.bookable && (
            <button
              onClick={onBooking}
              className="glow-btn w-full py-4 rounded-2xl text-base font-semibold mb-3"
            >
              Book This Tour
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl text-ocean-300 font-medium transition-all duration-300 hover:text-ocean-100 hover:bg-ocean-800/50"
            style={{ border: '1px solid rgba(94, 234, 212, 0.15)' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default BusinessModal;
