import { useEffect } from 'react';
import { scoreToColor, scoreToLabel, scoreToDescription } from '../../utils/scoreToColor';
import { getGoogleMapsDirectionsUrl, getAppleMapsDirectionsUrl } from '../../utils/mapsLinks';

// Helper to get score badge class
const getScoreBadgeClass = (score) => {
  if (score >= 8) return 'excellent';
  if (score >= 6.6) return 'good';
  if (score >= 5.1) return 'moderate';
  if (score >= 3.6) return 'caution';
  return 'hazardous';
};

function SpotModal({ spot, onClose, onBooking }) {
  const score = spot.effectiveScore;
  const badgeClass = getScoreBadgeClass(score);

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

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      {/* Backdrop with blur */}
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

        {/* Header with score */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between gap-4 pr-10">
            <div>
              <h2 className="text-2xl font-display text-ocean-50">{spot.name}</h2>
              <p className="text-sm text-glow-cyan/70 mt-1.5 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {spot.zoneName} Zone
              </p>
            </div>
            <div className="flex flex-col items-end">
              <div className={`score-badge ${badgeClass} text-2xl`}>
                {score.toFixed(1)}
              </div>
              <span className="text-xs mt-2 text-ocean-300">{scoreToLabel(score)}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        {spot.description && (
          <div className="px-6 pb-5">
            <h3 className="text-xs font-semibold text-glow-cyan/60 uppercase tracking-wider mb-2">About This Spot</h3>
            <p className="text-ocean-200 text-sm leading-relaxed">{spot.description}</p>
          </div>
        )}

        {/* Conditions */}
        <div className="px-6 pb-5">
          <h3 className="text-xs font-semibold text-glow-cyan/60 uppercase tracking-wider mb-2">Today's Conditions</h3>
          <div
            className="p-4 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 229, 204, 0.08) 0%, rgba(20, 184, 166, 0.04) 100%)',
              border: '1px solid rgba(0, 229, 204, 0.15)',
            }}
          >
            <p className="text-ocean-100 text-sm leading-relaxed">{spot.conditions}</p>
          </div>
        </div>

        {/* Hazards */}
        {spot.hazards && spot.hazards.length > 0 && (
          <div className="px-6 pb-5">
            <h3 className="text-xs font-semibold text-coral-warm/80 uppercase tracking-wider mb-3">Hazards</h3>
            <div className="flex flex-wrap gap-2">
              {spot.hazards.map((hazard, index) => (
                <span
                  key={index}
                  className="px-4 py-1.5 text-sm rounded-full font-medium"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 126, 103, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%)',
                    border: '1px solid rgba(255, 126, 103, 0.3)',
                    color: '#ff7e67',
                  }}
                >
                  {hazard}
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
              href={getGoogleMapsDirectionsUrl(spot)}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(10, 34, 53, 0.8) 0%, rgba(5, 21, 32, 0.9) 100%)',
                border: '1px solid rgba(0, 229, 204, 0.15)',
              }}
            >
              <svg className="w-5 h-5 text-glow-cyan/70 group-hover:text-glow-cyan transition-colors" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span className="text-ocean-200 group-hover:text-ocean-50 transition-colors text-sm font-medium">Google Maps</span>
            </a>
            <a
              href={getAppleMapsDirectionsUrl(spot)}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(10, 34, 53, 0.8) 0%, rgba(5, 21, 32, 0.9) 100%)',
                border: '1px solid rgba(0, 229, 204, 0.15)',
              }}
            >
              <svg className="w-5 h-5 text-glow-cyan/70 group-hover:text-glow-cyan transition-colors" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span className="text-ocean-200 group-hover:text-ocean-50 transition-colors text-sm font-medium">Apple Maps</span>
            </a>
          </div>
        </div>

        {/* Webcam links */}
        {spot.webcam && (
          <div className="px-6 pb-5">
            <h3 className="text-xs font-semibold text-glow-cyan/60 uppercase tracking-wider mb-3">Live Webcam</h3>
            <div className={`grid gap-3 ${Array.isArray(spot.webcam) && spot.webcam.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {(Array.isArray(spot.webcam) ? spot.webcam : [spot.webcam]).map((url, index) => (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, rgba(10, 34, 53, 0.8) 0%, rgba(5, 21, 32, 0.9) 100%)',
                    border: '1px solid rgba(0, 229, 204, 0.15)',
                  }}
                >
                  <svg className="w-5 h-5 text-glow-cyan/70 group-hover:text-glow-cyan transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="text-ocean-200 group-hover:text-ocean-50 transition-colors text-sm font-medium">
                    {Array.isArray(spot.webcam) && spot.webcam.length > 1 ? `Cam ${index + 1}` : 'Watch Live'}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Coordinates display */}
        <div className="px-6 pb-4">
          <p className="text-xs text-ocean-500 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            {spot.coordinates[1].toFixed(4)}, {spot.coordinates[0].toFixed(4)}
          </p>
        </div>

        {/* Divider with glow */}
        <div className="mx-6 h-px bg-gradient-to-r from-transparent via-glow-cyan/20 to-transparent" />

        {/* Action buttons */}
        <div className="p-6">
          {spot.hasProvider && (
            <button
              onClick={onBooking}
              className="glow-btn w-full py-4 rounded-2xl text-base font-semibold mb-3"
            >
              Book a Tour Here
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

export default SpotModal;
