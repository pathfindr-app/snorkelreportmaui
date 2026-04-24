import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { scoreToColor, scoreToDescription } from '../../utils/scoreToColor';
import zoneBoundaries from '../../data/zoneBoundaries.json';

const HAS_MAPBOX_TOKEN = Boolean(import.meta.env.VITE_MAPBOX_TOKEN);
if (HAS_MAPBOX_TOKEN) {
  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
}

const MAUI_CENTER = [-156.3319, 20.7984];

// Helper to get score badge class
const getScoreBadgeClass = (score) => {
  if (score >= 8) return 'excellent';
  if (score >= 6.6) return 'good';
  if (score >= 5.1) return 'moderate';
  if (score >= 3.6) return 'caution';
  return 'hazardous';
};

// Manual zone marker positions for better layout
const ZONE_POSITIONS = {
  northwest: { lng: -156.65, lat: 21.02 },
  kaanapali: { lng: -156.70, lat: 20.88 },
  southshore: { lng: -156.35, lat: 20.58 },
};

function LandingView({
  zones,
  allSpots,
  alerts,
  weather,
  onExploreMap,
  onSelectSpot,
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const userMarker = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [expandedZone, setExpandedZone] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [alertsExpanded, setAlertsExpanded] = useState(false);

  // Get spots for a specific zone
  const getZoneSpots = (zoneId) => {
    return allSpots.filter(spot => spot.zoneId === zoneId);
  };

  // Get user's geolocation
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lng: position.coords.longitude,
            lat: position.coords.latitude,
          });
        },
        (error) => {
          console.log('Geolocation error:', error.message);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!HAS_MAPBOX_TOKEN || map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: MAUI_CENTER,
      zoom: 8.25,
      pitch: 0,
      bearing: 0,
      interactive: false,
    });

    map.current.on('load', () => {
      // Add terrain
      map.current.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14,
      });
      map.current.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

      // Add sky
      map.current.addLayer({
        id: 'sky',
        type: 'sky',
        paint: {
          'sky-type': 'atmosphere',
          'sky-atmosphere-sun': [0.0, 90.0],
          'sky-atmosphere-sun-intensity': 15,
        },
      });

      // Add zone boundaries
      map.current.addSource('zones', { type: 'geojson', data: zoneBoundaries });

      map.current.addLayer({
        id: 'zone-fills',
        type: 'fill',
        source: 'zones',
        paint: {
          'fill-color': [
            'match', ['get', 'zoneId'],
            ...zones.flatMap(z => [z.id, scoreToColor(z.score)]),
            '#ffffff'
          ],
          'fill-opacity': 0.35,
        },
      });

      map.current.addLayer({
        id: 'zone-outlines',
        type: 'line',
        source: 'zones',
        paint: {
          'line-color': [
            'match', ['get', 'zoneId'],
            ...zones.flatMap(z => [z.id, scoreToColor(z.score)]),
            '#ffffff'
          ],
          'line-width': 2,
        },
      });

      setMapLoaded(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [zones]);

  // Add zone markers after map loads
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    zones.forEach(zone => {
      const position = ZONE_POSITIONS[zone.id];
      if (!position) return;

      const badgeClass = getScoreBadgeClass(zone.score);

      const el = document.createElement('div');
      el.className = 'zone-marker';
      el.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;text-align:center;pointer-events:none;">
          <div style="color:#f0fdfa;font-weight:600;font-size:12px;text-shadow:0 2px 8px rgba(0,0,0,0.9),0 0 20px rgba(0,0,0,0.5);margin-bottom:6px;white-space:nowrap;letter-spacing:0.5px;font-family:'Outfit',sans-serif;">${zone.name}</div>
          <div class="score-badge ${badgeClass}" style="font-size:18px;padding:6px 14px;border-radius:20px;">
            ${zone.score.toFixed(1)}
          </div>
        </div>
      `;

      new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([position.lng, position.lat])
        .addTo(map.current);
    });
  }, [mapLoaded, zones]);

  // Add user location marker
  useEffect(() => {
    if (!mapLoaded || !map.current || !userLocation) return;

    if (userMarker.current) {
      userMarker.current.remove();
    }

    const el = document.createElement('div');
    el.innerHTML = `
      <div style="position:relative;">
        <div style="width:18px;height:18px;background:linear-gradient(135deg, #00e5cc 0%, #14b8a6 100%);border:3px solid white;border-radius:50%;box-shadow:0 0 20px rgba(0,229,204,0.5),0 2px 8px rgba(0,0,0,0.4);"></div>
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:36px;height:36px;background:rgba(0,229,204,0.25);border-radius:50%;animation:pulse 2s infinite;"></div>
      </div>
    `;

    userMarker.current = new mapboxgl.Marker({ element: el, anchor: 'center' })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map.current);
  }, [mapLoaded, userLocation]);

  const toggleZone = (zoneId) => {
    setExpandedZone(expandedZone === zoneId ? null : zoneId);
  };

  return (
    <div className="page-shell flex h-full flex-col">
      <div className="relative flex-1 min-h-0" style={{ minHeight: '55vh' }}>
        {HAS_MAPBOX_TOKEN ? (
          <div
            ref={mapContainer}
            className="absolute inset-0"
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center px-6 text-center"
          >
            <div className="info-panel max-w-md rounded-[1.75rem] p-5">
              <p className="text-sm font-semibold text-[#f2f4ef]">Map preview disabled in local dev</p>
              <p className="mt-2 text-xs text-[#9eb0ab]">
                Add <code className="text-glow-cyan/80">VITE_MAPBOX_TOKEN</code> to
                <code className="text-glow-cyan/80"> .env.local</code> to render the interactive map.
              </p>
            </div>
          </div>
        )}

        <div className="caustics-overlay absolute inset-0" />
        <div className="map-film absolute inset-0" />

        <div
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, #071018 0%, rgba(7, 16, 24, 0.76) 42%, transparent 100%)',
          }}
        />

        {weather && (
          <div
            className="absolute right-3 top-3 overflow-hidden rounded-[1.4rem] info-panel"
            style={{ minWidth: '180px' }}
          >
            <div className="px-4 py-3 flex items-center gap-4">
              <div className="flex items-baseline">
                <span className="text-4xl font-semibold text-[#f2f4ef] font-display">
                  {weather.temp}
                </span>
                <span className="ml-0.5 text-lg text-[#8fd3ca]/60">°</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-[#dce4df] capitalize">{weather.description}</div>
                <div className="text-xs text-[#8b9e9a]">Maui, HI</div>
              </div>
            </div>

            <div className="h-px bg-white/8" />

            <div className="px-3 py-2.5 grid grid-cols-2 gap-x-4 gap-y-2">
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-[#7fa7a0]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" style={{ transform: `rotate(${weather.wind?.deg || 0}deg)` }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-4-4l4 4-4 4" />
                </svg>
                <span className="text-xs text-[#cad4cf]">{weather.wind?.speed} mph {weather.wind?.direction}</span>
              </div>

              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-[#7fa7a0]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4 0-6-3-6-6 0-3.5 6-9 6-9s6 5.5 6 9c0 3-2 6-6 6z" />
                </svg>
                <span className="text-xs text-[#cad4cf]">{weather.humidity}%</span>
              </div>

              {weather.visibility && (
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-[#7fa7a0]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="text-xs text-[#cad4cf]">{weather.visibility} mi</span>
                </div>
              )}

              {(weather.sunrise || weather.sunset) && (
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-[#d49c7c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.364-6.364l-1.414 1.414M8.05 15.95l-1.414 1.414m12.728 0l-1.414-1.414M8.05 8.05L6.636 6.636" strokeLinecap="round" />
                  </svg>
                  <span className="text-xs text-[#cad4cf]">
                    {weather.sunrise?.replace(' AM', 'a').replace(' PM', 'p')} – {weather.sunset?.replace(' AM', 'a').replace(' PM', 'p')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {userLocation && (
          <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full info-panel px-3 py-2">
            <div className="h-2 w-2 rounded-full bg-[#7fd4c8]" />
            <span className="text-xs font-medium text-[#cad4cf]">Location enabled</span>
          </div>
        )}

        {alerts && alerts.length > 0 && (
          <div className="absolute top-14 left-3 right-3 md:right-auto md:max-w-sm">
            <button
              onClick={() => setAlertsExpanded(!alertsExpanded)}
              className="w-full rounded-[1.2rem] border border-[rgba(169,95,76,0.45)] bg-[rgba(97,38,28,0.9)] px-4 py-2.5 text-sm text-white shadow-[0_18px_40px_rgba(18,8,6,0.35)] backdrop-blur-lg flex items-center justify-between"
            >
              <span className="flex items-center gap-2 font-medium">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {alerts.length} Active {alerts.length === 1 ? 'Advisory' : 'Advisories'}
              </span>
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${alertsExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {alertsExpanded && (
              <div className="info-panel mt-2 overflow-hidden rounded-[1.2rem]">
                {alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`border-b border-white/6 px-4 py-3 text-sm last:border-b-0 ${
                      alert.type === 'warning' ? 'text-[#f3b17b]' : 'text-[#e58b84]'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                      </svg>
                      {alert.message}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="absolute bottom-8 inset-x-0 flex justify-center px-4">
          <button
            onClick={onExploreMap}
            className="explore-map-btn primary-cta px-6 py-3 rounded-full flex items-center gap-2 text-sm font-semibold"
          >
            <svg className="explore-map-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Open the full snorkel map
          </button>
        </div>
      </div>

      <div className="shrink-0 page-section">
        <div className="border-b border-white/6 px-4 pb-4 pt-4">
          <div className="landing-brief">
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.24em] text-[#8eb9b0]">
                Daily Maui Snorkel Report
              </p>
              <h3 className="text-lg font-semibold leading-tight text-[#f2f4ef] sm:text-[1.4rem]">
                A cleaner read on where to snorkel well today.
              </h3>
              <p className="mt-1.5 max-w-[60ch] text-sm text-[#c2d0cb]">
                Track {zones.length} Maui zones and {allSpots.length} top snorkel spots with daily scores,
                webcams, directions, and detailed spot breakdowns.
              </p>
            </div>

            <div className="landing-brief-meta">
              <div className="text-xs text-[#aab9b5]">
                  Updated throughout the day to help visitors choose cleaner, calmer water faster.
              </div>
              <button
                onClick={onExploreMap}
                className="primary-cta rounded-full px-4 py-2.5 text-sm font-semibold"
              >
                  Explore Today&apos;s Map
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-white/6 px-4 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9eb0ab]">Today&apos;s Conditions</h2>
          <div className="flex items-center gap-1.5 text-xs text-[#7d918c]">
            <div className="h-1.5 w-1.5 rounded-full bg-[#7fd4c8]" />
            Live
          </div>
        </div>

        <div className="max-h-[35vh] overflow-y-auto">
          {zones.map(zone => {
            const spots = getZoneSpots(zone.id);
            const badgeClass = getScoreBadgeClass(zone.score);
            const isExpanded = expandedZone === zone.id;

            return (
              <div key={zone.id} className="border-b border-white/6">
                <button
                  onClick={() => toggleZone(zone.id)}
                  className="group flex w-full items-center justify-between px-4 py-4 transition-all duration-200 hover:bg-white/[0.025]"
                >
                  <div className="flex items-center gap-4">
                    <div className={`score-badge ${badgeClass} text-lg min-w-[56px] text-center`}>
                      {zone.score.toFixed(1)}
                    </div>
                    <div className="text-left">
                      <h3 className="text-base font-semibold text-[#edf2ee] transition-colors group-hover:text-[#9ed7cf]">{zone.name}</h3>
                      <p className="mt-0.5 text-xs text-[#879a95]">{spots.length} spots · {scoreToDescription(zone.score)}</p>
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 text-[#8eb9b0] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="overflow-hidden bg-[rgba(255,255,255,0.025)]">
                    <div className="border-b border-white/6 px-4 py-3 text-sm text-[#c4cfcb]">{zone.summary}</div>
                    {spots.map((spot) => {
                      const spotScore = spot.effectiveScore;
                      const spotBadgeClass = getScoreBadgeClass(spotScore);

                      return (
                        <button
                          key={spot.id}
                          onClick={() => onSelectSpot(spot)}
                          className="group flex w-full items-center justify-between border-t border-white/6 px-4 py-3.5 transition-all duration-200 hover:bg-white/[0.03]"
                        >
                          <div className="flex-1 min-w-0 text-left">
                            <span className="text-sm font-medium text-[#e7ece8] transition-colors group-hover:text-[#9ed7cf]">{spot.name}</span>
                            {spot.hazards && spot.hazards.length > 0 && (
                              <p className="mt-0.5 truncate text-xs text-[#839691]">
                                {spot.hazards.slice(0, 2).join(' · ')}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-3 ml-3">
                            <span className={`score-badge ${spotBadgeClass} text-xs`}>
                              {spotScore.toFixed(1)}
                            </span>
                            <svg className="w-4 h-4 text-[#8eb9b0] transition-all group-hover:text-[#9ed7cf]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default LandingView;
