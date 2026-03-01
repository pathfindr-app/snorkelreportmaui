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
  onPrivateExperienceClick,
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
    <div className="h-full flex flex-col" style={{ background: 'linear-gradient(180deg, #030b12 0%, #051520 100%)' }}>
      {/* Map Section */}
      <div className="relative flex-1 min-h-0" style={{ minHeight: '55vh' }}>
        {/* Map container */}
        {HAS_MAPBOX_TOKEN ? (
          <div
            ref={mapContainer}
            className="absolute inset-0"
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center px-6 text-center"
            style={{
              background:
                'radial-gradient(circle at 20% 20%, rgba(0, 229, 204, 0.08) 0%, transparent 45%), radial-gradient(circle at 80% 80%, rgba(255, 126, 103, 0.08) 0%, transparent 45%), linear-gradient(180deg, #051520 0%, #030b12 100%)',
            }}
          >
            <div
              className="max-w-md rounded-2xl p-5"
              style={{
                background: 'linear-gradient(135deg, rgba(10, 34, 53, 0.8) 0%, rgba(5, 21, 32, 0.9) 100%)',
                border: '1px solid rgba(0, 229, 204, 0.18)',
              }}
            >
              <p className="text-sm text-ocean-100 font-semibold">Map Preview Disabled in Local Dev</p>
              <p className="text-xs text-ocean-400 mt-2">
                Add <code className="text-glow-cyan/80">VITE_MAPBOX_TOKEN</code> to
                <code className="text-glow-cyan/80"> .env.local</code> to render the interactive map.
              </p>
            </div>
          </div>
        )}

        {/* Caustics overlay effect */}
        <div className="caustics-overlay absolute inset-0" />

        {/* Gradient overlay at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, #030b12 0%, rgba(3, 11, 18, 0.8) 40%, transparent 100%)',
          }}
        />

        {/* Weather Card */}
        {weather && (
          <div
            className="absolute top-3 right-3 glow-card rounded-2xl overflow-hidden"
            style={{ minWidth: '180px' }}
          >
            {/* Main temp section */}
            <div className="px-4 py-3 flex items-center gap-4">
              <div className="flex items-baseline">
                <span className="text-4xl font-semibold text-ocean-50 font-display">
                  {weather.temp}
                </span>
                <span className="text-lg text-glow-cyan/50 ml-0.5">°</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-ocean-200 capitalize">{weather.description}</div>
                <div className="text-xs text-ocean-500">Maui, HI</div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-ocean-700/30" />

            {/* Stats grid */}
            <div className="px-3 py-2.5 grid grid-cols-2 gap-x-4 gap-y-2">
              {/* Wind */}
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-ocean-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" style={{ transform: `rotate(${weather.wind?.deg || 0}deg)` }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-4-4l4 4-4 4" />
                </svg>
                <span className="text-xs text-ocean-300">{weather.wind?.speed} mph {weather.wind?.direction}</span>
              </div>

              {/* Humidity */}
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-ocean-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4 0-6-3-6-6 0-3.5 6-9 6-9s6 5.5 6 9c0 3-2 6-6 6z" />
                </svg>
                <span className="text-xs text-ocean-300">{weather.humidity}%</span>
              </div>

              {/* Visibility */}
              {weather.visibility && (
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-ocean-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="text-xs text-ocean-300">{weather.visibility} mi</span>
                </div>
              )}

              {/* Sun times */}
              {(weather.sunrise || weather.sunset) && (
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-coral-warm/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.364-6.364l-1.414 1.414M8.05 15.95l-1.414 1.414m12.728 0l-1.414-1.414M8.05 8.05L6.636 6.636" strokeLinecap="round" />
                  </svg>
                  <span className="text-xs text-ocean-300">
                    {weather.sunrise?.replace(' AM', 'a').replace(' PM', 'p')} – {weather.sunset?.replace(' AM', 'a').replace(' PM', 'p')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* User location indicator */}
        {userLocation && (
          <div className="absolute top-3 left-3 glow-card px-3 py-2 rounded-xl flex items-center gap-2">
            <div className="w-2 h-2 bg-glow-cyan rounded-full" />
            <span className="text-ocean-300 text-xs font-medium">Location enabled</span>
          </div>
        )}

        {/* Alerts - Collapsible */}
        {alerts && alerts.length > 0 && (
          <div className="absolute top-14 left-3 right-3 md:right-auto md:max-w-sm">
            <button
              onClick={() => setAlertsExpanded(!alertsExpanded)}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm backdrop-blur-lg text-white"
              style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.9) 0%, rgba(220, 38, 38, 0.85) 100%)',
                boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)',
              }}
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
              <div className="mt-2 glow-card rounded-xl overflow-hidden">
                {alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`px-4 py-3 text-sm border-b border-ocean-700/30 last:border-b-0 ${
                      alert.type === 'warning' ? 'text-score-orange' : 'text-score-red'
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

        {/* Explore map button */}
        <button
          onClick={onExploreMap}
          className="explore-map-btn absolute bottom-8 left-1/2 -translate-x-1/2 glow-btn px-6 py-3 rounded-full flex items-center gap-2 text-sm font-semibold"
        >
          <svg className="explore-map-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Tap Here to Explore Full Map
        </button>
      </div>

      {/* Zone Accordions */}
      <div className="shrink-0" style={{ background: 'linear-gradient(180deg, #030b12 0%, #051520 100%)' }}>
        <div className="px-4 pt-4 pb-3 border-b border-glow-cyan/10">
          <div
            className="relative overflow-hidden rounded-2xl p-4 sm:p-5"
            style={{
              background: 'linear-gradient(135deg, rgba(5, 35, 52, 0.92) 0%, rgba(9, 31, 44, 0.95) 100%)',
              border: '1px solid rgba(0, 229, 204, 0.22)',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.35), 0 0 30px rgba(0, 229, 204, 0.1)',
            }}
          >
            <div className="absolute inset-0 pointer-events-none shimmer-bg opacity-40" />

            <div className="relative">
              <p className="text-[11px] uppercase tracking-[0.2em] text-glow-cyan/70 mb-2">
                Featured Private Service
              </p>
              <h3 className="text-lg sm:text-xl text-ocean-50 font-semibold leading-tight">
                Kyle&apos;s Private Ocean Sessions
              </h3>
              <p className="text-sm text-ocean-200 mt-1.5">
                Every website photo is shot by Kyle. 11-year Maui guide, PADI Divemaster, one group
                per session, never mixed bookings.
              </p>

              <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-xs text-ocean-300">
                  South Side from $135/person · West Side from $160/person
                </div>
                <button
                  onClick={onPrivateExperienceClick}
                  className="glow-btn px-4 py-2.5 rounded-full text-sm font-semibold"
                >
                  Book Your Private Session
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 flex items-center justify-between border-b border-glow-cyan/10">
          <h2 className="text-sm font-semibold text-ocean-300 tracking-wide uppercase">Today's Conditions</h2>
          <div className="flex items-center gap-1.5 text-xs text-ocean-500">
            <div className="w-1.5 h-1.5 rounded-full bg-glow-cyan" />
            Live
          </div>
        </div>

        <div className="max-h-[35vh] overflow-y-auto">
          {zones.map(zone => {
            const spots = getZoneSpots(zone.id);
            const badgeClass = getScoreBadgeClass(zone.score);
            const isExpanded = expandedZone === zone.id;

            return (
              <div key={zone.id} className="border-b border-ocean-800/50">
                {/* Zone header - clickable */}
                <button
                  onClick={() => toggleZone(zone.id)}
                  className="w-full px-4 py-4 flex items-center justify-between hover:bg-ocean-800/30 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`score-badge ${badgeClass} text-lg min-w-[56px] text-center`}>
                      {zone.score.toFixed(1)}
                    </div>
                    <div className="text-left">
                      <h3 className="text-base font-semibold text-ocean-50 group-hover:text-glow-cyan transition-colors">{zone.name}</h3>
                      <p className="text-xs text-ocean-400 mt-0.5">{spots.length} spots · {scoreToDescription(zone.score)}</p>
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 text-glow-cyan/50 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Expanded spots */}
                {isExpanded && (
                  <div
                    className="overflow-hidden"
                    style={{ background: 'linear-gradient(180deg, rgba(10, 34, 53, 0.5) 0%, rgba(5, 21, 32, 0.5) 100%)' }}
                  >
                    <div className="px-4 py-3 text-sm text-ocean-300 border-b border-ocean-800/30">{zone.summary}</div>
                    {spots.map((spot) => {
                      const spotScore = spot.effectiveScore;
                      const spotBadgeClass = getScoreBadgeClass(spotScore);

                      return (
                        <button
                          key={spot.id}
                          onClick={() => onSelectSpot(spot)}
                          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-glow-cyan/5 transition-all duration-200 border-t border-ocean-800/20 group"
                        >
                          <div className="flex-1 min-w-0 text-left">
                            <span className="text-sm text-ocean-100 group-hover:text-glow-cyan transition-colors font-medium">{spot.name}</span>
                            {spot.hazards && spot.hazards.length > 0 && (
                              <p className="text-xs text-ocean-500 truncate mt-0.5">
                                {spot.hazards.slice(0, 2).join(' · ')}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-3 ml-3">
                            <span className={`score-badge ${spotBadgeClass} text-xs`}>
                              {spotScore.toFixed(1)}
                            </span>
                            <svg className="w-4 h-4 text-glow-cyan/40 group-hover:text-glow-cyan transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
