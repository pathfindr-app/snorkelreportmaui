import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { scoreToColor, scoreToLabel } from '../../utils/scoreToColor';
import zoneBoundaries from '../../data/zoneBoundaries.json';
import ZoneCards from '../Mobile/ZoneCards';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

// Maui center coordinates and initial view
const MAUI_CENTER = [-156.3319, 20.7984];
const INITIAL_ZOOM = 9.2;
const INITIAL_PITCH = 45;
const INITIAL_BEARING = 0;

function LandingView({ zones, allSpots, alerts, weather, onExploreMap, onSelectSpot }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle responsive
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize map
  useEffect(() => {
    if (map.current || isMobile) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: MAUI_CENTER,
      zoom: INITIAL_ZOOM,
      pitch: INITIAL_PITCH,
      bearing: INITIAL_BEARING,
      interactive: false, // Landing view is non-interactive
    });

    map.current.on('load', () => {
      // Add terrain for 3D effect
      map.current.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14,
      });

      map.current.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

      // Add sky layer for atmosphere
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
      map.current.addSource('zones', {
        type: 'geojson',
        data: zoneBoundaries,
      });

      // Zone fill layer
      map.current.addLayer({
        id: 'zone-fills',
        type: 'fill',
        source: 'zones',
        paint: {
          'fill-color': [
            'match',
            ['get', 'zoneId'],
            ...zones.flatMap(zone => [zone.id, scoreToColor(zone.score)]),
            '#ffffff',
          ],
          'fill-opacity': 0.3,
        },
      });

      // Zone outline layer
      map.current.addLayer({
        id: 'zone-outlines',
        type: 'line',
        source: 'zones',
        paint: {
          'line-color': [
            'match',
            ['get', 'zoneId'],
            ...zones.flatMap(zone => [zone.id, scoreToColor(zone.score)]),
            '#ffffff',
          ],
          'line-width': 3,
          'line-opacity': 0.9,
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
  }, [zones, isMobile]);

  // Add zone labels when map is loaded
  useEffect(() => {
    if (!mapLoaded || !map.current || isMobile) return;

    // Add zone score markers
    zones.forEach(zone => {
      // Calculate zone center from boundary
      const feature = zoneBoundaries.features.find(f => f.properties.zoneId === zone.id);
      if (!feature) return;

      const coords = feature.geometry.coordinates[0];
      const centerLng = coords.reduce((sum, c) => sum + c[0], 0) / coords.length;
      const centerLat = coords.reduce((sum, c) => sum + c[1], 0) / coords.length;

      // Create marker element
      const el = document.createElement('div');
      el.className = 'zone-score-marker';
      el.innerHTML = `
        <div class="flex flex-col items-center">
          <div class="text-sm font-medium text-white text-shadow mb-1">${zone.name}</div>
          <div class="px-2 py-1 rounded-md text-white font-bold text-lg" style="background-color: ${scoreToColor(zone.score)}">
            ${zone.score.toFixed(1)}
          </div>
        </div>
      `;

      new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([centerLng, centerLat])
        .addTo(map.current);
    });
  }, [mapLoaded, zones, isMobile]);

  // Mobile view - show ZoneCards
  if (isMobile) {
    return (
      <ZoneCards
        zones={zones}
        allSpots={allSpots}
        alerts={alerts}
        onExploreMap={onExploreMap}
        onSelectSpot={onSelectSpot}
      />
    );
  }

  // Desktop view - show map with zone overlays
  return (
    <div className="relative h-full w-full">
      {/* Map container */}
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Alerts banner */}
      {alerts && alerts.length > 0 && (
        <div className="absolute top-4 left-4 right-4 z-10">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`px-4 py-2 rounded-lg mb-2 ${
                alert.type === 'warning'
                  ? 'bg-score-orange/90 text-white'
                  : 'bg-score-red/90 text-white'
              }`}
            >
              <span className="font-medium">{alert.type === 'warning' ? '⚠️' : '🚨'}</span>{' '}
              {alert.message}
            </div>
          ))}
        </div>
      )}

      {/* Explore button */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <button
          onClick={onExploreMap}
          className="px-8 py-3 bg-ocean-800/90 hover:bg-ocean-700/90 text-ocean-50 font-medium rounded-lg border border-ocean-500/50 backdrop-blur-sm transition-all hover:scale-105 shadow-lg"
        >
          Explore the Map
        </button>
      </div>

      {/* Weather display (optional) */}
      {weather && (
        <div className="absolute top-4 right-4 z-10 glass px-4 py-3 rounded-lg">
          <div className="text-ocean-50 text-sm">
            <div className="font-medium">{weather.temp}°F</div>
            <div className="text-ocean-300 text-xs">
              Wind: {weather.wind?.speed} mph {weather.wind?.direction}
            </div>
          </div>
        </div>
      )}

      {/* Bottom action links */}
      <div className="absolute bottom-8 left-4 right-4 flex justify-between z-10 pointer-events-none">
        <div className="pointer-events-auto">
          {/* Space for future links */}
        </div>
        <div className="pointer-events-auto">
          {/* Space for future links */}
        </div>
      </div>
    </div>
  );
}

export default LandingView;
