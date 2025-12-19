import { useEffect } from 'react';
import { scoreToColor, scoreToLabel, scoreToDescription } from '../../utils/scoreToColor';
import { getGoogleMapsUrl, getAppleMapsUrl, getGoogleMapsDirectionsUrl, getAppleMapsDirectionsUrl } from '../../utils/mapsLinks';

function SpotModal({ spot, onClose, onBooking }) {
  const score = spot.effectiveScore;
  const color = scoreToColor(score);

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
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal content */}
      <div className="relative bg-ocean-900 w-full max-w-lg rounded-xl shadow-2xl border border-ocean-700 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-ocean-400 hover:text-ocean-200 transition-colors z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header with score */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between gap-4 pr-8">
            <div>
              <h2 className="text-xl font-semibold text-ocean-50">{spot.name}</h2>
              <p className="text-sm text-ocean-400 mt-1">{spot.zoneName} Zone</p>
            </div>
            <div className="flex flex-col items-end">
              <div
                className="text-2xl font-bold px-3 py-1 rounded-lg"
                style={{ backgroundColor: color, color: score <= 5 ? 'white' : '#071a2b' }}
              >
                {score.toFixed(1)}
              </div>
              <span className="text-xs mt-1" style={{ color }}>{scoreToLabel(score)}</span>
            </div>
          </div>
        </div>

        {/* Conditions */}
        <div className="px-6 pb-4">
          <h3 className="text-sm font-medium text-ocean-300 mb-2">Today's Conditions</h3>
          <p className="text-ocean-100">{spot.conditions}</p>
        </div>

        {/* Hazards */}
        {spot.hazards && spot.hazards.length > 0 && (
          <div className="px-6 pb-4">
            <h3 className="text-sm font-medium text-ocean-300 mb-2">Hazards</h3>
            <div className="flex flex-wrap gap-2">
              {spot.hazards.map((hazard, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-score-red/20 text-score-red text-sm rounded-full border border-score-red/30"
                >
                  {hazard}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="px-6 pb-4">
          <h3 className="text-sm font-medium text-ocean-300 mb-3">Get Directions</h3>
          <div className="grid grid-cols-2 gap-3">
            <a
              href={getGoogleMapsDirectionsUrl(spot)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-ocean-800 hover:bg-ocean-700 text-ocean-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              Google Maps
            </a>
            <a
              href={getAppleMapsDirectionsUrl(spot)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-ocean-800 hover:bg-ocean-700 text-ocean-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              Apple Maps
            </a>
          </div>
        </div>

        {/* Webcam links */}
        {spot.webcam && (
          <div className="px-6 pb-4">
            <h3 className="text-sm font-medium text-ocean-300 mb-3">Live Webcam</h3>
            <div className={`grid gap-3 ${Array.isArray(spot.webcam) && spot.webcam.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {(Array.isArray(spot.webcam) ? spot.webcam : [spot.webcam]).map((url, index) => (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-ocean-800 hover:bg-ocean-700 text-ocean-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {Array.isArray(spot.webcam) && spot.webcam.length > 1 ? `Cam ${index + 1}` : 'Watch Live'}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Coordinates display */}
        <div className="px-6 pb-4">
          <p className="text-xs text-ocean-500">
            Coordinates: {spot.coordinates[1].toFixed(4)}, {spot.coordinates[0].toFixed(4)}
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-ocean-700/50" />

        {/* Action buttons */}
        <div className="p-6 pt-4">
          {spot.hasProvider && (
            <button
              onClick={onBooking}
              className="w-full py-3 bg-ocean-500 hover:bg-ocean-400 text-ocean-950 font-semibold rounded-lg transition-colors mb-3"
            >
              Book a Tour Here
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full py-3 bg-ocean-800 hover:bg-ocean-700 text-ocean-200 font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default SpotModal;
