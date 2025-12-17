import { scoreToColor, scoreToLabel, scoreToDescription } from '../../utils/scoreToColor';

function ZoneCards({ zones, allSpots, alerts, onExploreMap, onSelectSpot }) {
  // Get spots for a specific zone
  const getZoneSpots = (zoneId) => {
    return allSpots.filter(spot => spot.zoneId === zoneId);
  };

  return (
    <div className="min-h-full bg-ocean-950 px-4 py-4 pb-24">
      {/* Alerts */}
      {alerts && alerts.length > 0 && (
        <div className="mb-4">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`px-4 py-3 rounded-lg mb-2 ${
                alert.type === 'warning'
                  ? 'bg-score-orange/20 border border-score-orange/50 text-score-orange'
                  : 'bg-score-red/20 border border-score-red/50 text-score-red'
              }`}
            >
              <span className="font-medium">{alert.type === 'warning' ? '⚠️' : '🚨'}</span>{' '}
              <span className="text-sm">{alert.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Zone Cards */}
      <div className="space-y-4">
        {zones.map(zone => {
          const spots = getZoneSpots(zone.id);
          const color = scoreToColor(zone.score);

          return (
            <div
              key={zone.id}
              className="bg-ocean-900/80 rounded-xl border border-ocean-700/50 overflow-hidden"
            >
              {/* Zone header */}
              <div className="p-4 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-ocean-50">{zone.name}</h3>
                  <p className="text-sm text-ocean-400 mt-1">
                    {spots.map(s => s.name).join(', ')}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <div
                    className="text-3xl font-bold px-3 py-1 rounded-lg"
                    style={{ backgroundColor: color, color: zone.score <= 5 ? 'white' : '#071a2b' }}
                  >
                    {zone.score.toFixed(1)}
                  </div>
                  <span
                    className="text-xs mt-1 font-medium"
                    style={{ color }}
                  >
                    {scoreToDescription(zone.score)}
                  </span>
                </div>
              </div>

              {/* Zone summary */}
              <div className="px-4 pb-4">
                <p className="text-sm text-ocean-200">{zone.summary}</p>
                {zone.details && (
                  <p className="text-xs text-ocean-400 mt-1">{zone.details}</p>
                )}
              </div>

              {/* Spots list */}
              <div className="border-t border-ocean-700/50">
                {spots.map((spot, index) => {
                  const spotScore = spot.effectiveScore;
                  const spotColor = scoreToColor(spotScore);

                  return (
                    <button
                      key={spot.id}
                      onClick={() => onSelectSpot(spot)}
                      className={`w-full px-4 py-3 flex items-center justify-between hover:bg-ocean-800/50 transition-colors text-left ${
                        index !== spots.length - 1 ? 'border-b border-ocean-700/30' : ''
                      }`}
                    >
                      <div>
                        <span className="text-ocean-100 font-medium">{spot.name}</span>
                        {spot.hazards && spot.hazards.length > 0 && (
                          <p className="text-xs text-ocean-400 mt-0.5">
                            {spot.hazards.slice(0, 2).join(' • ')}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-sm font-semibold px-2 py-0.5 rounded"
                          style={{ backgroundColor: spotColor, color: spotScore <= 5 ? 'white' : '#071a2b' }}
                        >
                          {spotScore.toFixed(1)}
                        </span>
                        <svg className="w-4 h-4 text-ocean-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Fixed bottom button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-ocean-950 via-ocean-950 to-transparent">
        <button
          onClick={onExploreMap}
          className="w-full py-3 bg-ocean-600 hover:bg-ocean-500 text-ocean-50 font-semibold rounded-xl transition-colors shadow-lg"
        >
          View Interactive Map
        </button>
      </div>
    </div>
  );
}

export default ZoneCards;
