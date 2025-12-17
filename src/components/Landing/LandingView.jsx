import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { scoreToColor, scoreToDescription } from '../../utils/scoreToColor';
import zoneBoundaries from '../../data/zoneBoundaries.json';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const MAUI_CENTER = [-156.3319, 20.7984];

function LandingView({ zones, allSpots, alerts, weather, onExploreMap, onSelectSpot }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const userMarker = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [expandedZone, setExpandedZone] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

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
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: MAUI_CENTER,
      zoom: 9.5,
      pitch: 45,
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
      const feature = zoneBoundaries.features.find(f => f.properties.zoneId === zone.id);
      if (!feature) return;

      const coords = feature.geometry.coordinates[0];
      const centerLng = coords.reduce((sum, c) => sum + c[0], 0) / coords.length;
      const centerLat = coords.reduce((sum, c) => sum + c[1], 0) / coords.length;
      const color = scoreToColor(zone.score);
      const textColor = zone.score <= 5 ? 'white' : '#071a2b';

      const el = document.createElement('div');
      el.className = 'zone-marker';
      el.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;text-align:center;pointer-events:none;">
          <div style="color:white;font-weight:600;font-size:12px;text-shadow:0 1px 4px rgba(0,0,0,0.9);margin-bottom:3px;white-space:nowrap;">${zone.name}</div>
          <div style="background:${color};color:${textColor};font-weight:700;font-size:18px;padding:6px 12px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.5);">
            ${zone.score.toFixed(1)}
          </div>
        </div>
      `;

      new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([centerLng, centerLat])
        .addTo(map.current);
    });
  }, [mapLoaded, zones]);

  // Add user location marker
  useEffect(() => {
    if (!mapLoaded || !map.current || !userLocation) return;

    // Remove existing marker
    if (userMarker.current) {
      userMarker.current.remove();
    }

    // Create user location marker
    const el = document.createElement('div');
    el.innerHTML = `
      <div style="position:relative;">
        <div style="width:16px;height:16px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:32px;height:32px;background:rgba(59,130,246,0.3);border-radius:50%;animation:pulse 2s infinite;"></div>
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
    <div className="h-full bg-ocean-950 flex flex-col">
      {/* Map Section - Takes most of the screen */}
      <div className="relative flex-1 min-h-0" style={{ minHeight: '55vh' }}>
        {/* Map container */}
        <div
          ref={mapContainer}
          className="absolute inset-0"
          style={{ width: '100%', height: '100%' }}
        />

        {/* Gradient overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-ocean-950 to-transparent pointer-events-none" />

        {/* Weather badge */}
        {weather && (
          <div className="absolute top-3 right-3 bg-ocean-900/80 backdrop-blur-sm px-3 py-2 rounded-lg">
            <div className="text-ocean-50 font-semibold">{weather.temp}°F</div>
            <div className="text-ocean-400 text-xs">{weather.wind?.speed} mph {weather.wind?.direction}</div>
          </div>
        )}

        {/* User location indicator */}
        {userLocation && (
          <div className="absolute top-3 left-3 bg-ocean-900/80 backdrop-blur-sm px-3 py-2 rounded-lg flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-ocean-200 text-xs">Location enabled</span>
          </div>
        )}

        {/* Alerts */}
        {alerts && alerts.length > 0 && (
          <div className="absolute top-14 left-3 right-3 md:right-auto md:max-w-sm">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`px-3 py-2 rounded-lg mb-2 text-sm backdrop-blur-sm ${
                  alert.type === 'warning'
                    ? 'bg-score-orange/90 text-white'
                    : 'bg-score-red/90 text-white'
                }`}
              >
                {alert.type === 'warning' ? '⚠️' : '🚨'} {alert.message}
              </div>
            ))}
          </div>
        )}

        {/* Tap to explore */}
        <button
          onClick={onExploreMap}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-ocean-800/80 backdrop-blur-sm text-ocean-100 text-sm px-4 py-2 rounded-full border border-ocean-600/50 hover:bg-ocean-700/80 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
          Tap to explore full map
        </button>
      </div>

      {/* Zone Accordions */}
      <div className="shrink-0 bg-ocean-950">
        <div className="px-3 py-2 border-b border-ocean-800">
          <h2 className="text-sm font-medium text-ocean-400">Today's Conditions</h2>
        </div>

        <div className="max-h-[35vh] overflow-y-auto">
          {zones.map(zone => {
            const spots = getZoneSpots(zone.id);
            const color = scoreToColor(zone.score);
            const isExpanded = expandedZone === zone.id;

            return (
              <div key={zone.id} className="border-b border-ocean-800/50">
                {/* Zone header - clickable */}
                <button
                  onClick={() => toggleZone(zone.id)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-ocean-900/50 active:bg-ocean-900 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="text-lg font-bold px-2.5 py-0.5 rounded-md min-w-[52px] text-center"
                      style={{ backgroundColor: color, color: zone.score <= 5 ? 'white' : '#071a2b' }}
                    >
                      {zone.score.toFixed(1)}
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm font-semibold text-ocean-50">{zone.name}</h3>
                      <p className="text-xs text-ocean-500">{spots.length} spots • {scoreToDescription(zone.score)}</p>
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 text-ocean-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Expanded spots */}
                {isExpanded && (
                  <div className="bg-ocean-900/30">
                    <div className="px-4 py-2 text-xs text-ocean-400">{zone.summary}</div>
                    {spots.map((spot) => {
                      const spotScore = spot.effectiveScore;
                      const spotColor = scoreToColor(spotScore);

                      return (
                        <button
                          key={spot.id}
                          onClick={() => onSelectSpot(spot)}
                          className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-ocean-800/40 active:bg-ocean-800/60 transition-colors border-t border-ocean-800/30"
                        >
                          <div className="flex-1 min-w-0 text-left">
                            <span className="text-sm text-ocean-100">{spot.name}</span>
                            {spot.hazards && spot.hazards.length > 0 && (
                              <p className="text-xs text-ocean-500 truncate">
                                {spot.hazards.slice(0, 2).join(' • ')}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            <span
                              className="text-xs font-semibold px-2 py-0.5 rounded"
                              style={{ backgroundColor: spotColor, color: spotScore <= 5 ? 'white' : '#071a2b' }}
                            >
                              {spotScore.toFixed(1)}
                            </span>
                            <svg className="w-4 h-4 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
