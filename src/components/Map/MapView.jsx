import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { scoreToColor } from '../../utils/scoreToColor';
import zoneBoundaries from '../../data/zoneBoundaries.json';
import WeatherOverlay from './WeatherOverlay';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

// Maui center coordinates and initial view
const MAUI_CENTER = [-156.3319, 20.7984];
const INITIAL_ZOOM = 10;
const INITIAL_PITCH = 0;
const INITIAL_BEARING = 0;

function MapView({ zones, allSpots, weather, onSelectSpot, onBackToLanding }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [watchId, setWatchId] = useState(null);

  // Watch user's geolocation
  useEffect(() => {
    if ('geolocation' in navigator) {
      const id = navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation({
            lng: position.coords.longitude,
            lat: position.coords.latitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          console.log('Geolocation error:', error.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
      setWatchId(id);

      return () => {
        navigator.geolocation.clearWatch(id);
      };
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: MAUI_CENTER,
      zoom: INITIAL_ZOOM,
      pitch: INITIAL_PITCH,
      bearing: INITIAL_BEARING,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

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
          'fill-opacity': 0.2,
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
          'line-width': 2,
          'line-opacity': 0.8,
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

  // Add spot markers when map is loaded
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add spot markers
    allSpots.forEach(spot => {
      const color = scoreToColor(spot.effectiveScore);

      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'spot-marker cursor-pointer';
      el.innerHTML = `
        <div class="relative group">
          <div class="w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110" style="background-color: ${color}; border: 2px solid rgba(255,255,255,0.8);">
            <span class="text-xs font-bold" style="color: ${spot.effectiveScore <= 5 ? 'white' : '#071a2b'}">
              ${spot.effectiveScore.toFixed(1)}
            </span>
          </div>
          <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent" style="border-top-color: ${color}"></div>
        </div>
      `;

      el.addEventListener('click', () => {
        onSelectSpot(spot);
      });

      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat(spot.coordinates)
        .addTo(map.current);

      // Add popup on hover
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 25,
        className: 'spot-popup',
      });

      el.addEventListener('mouseenter', () => {
        popup
          .setLngLat(spot.coordinates)
          .setHTML(`
            <div class="text-sm">
              <div class="font-semibold">${spot.name}</div>
              <div class="text-ocean-300 text-xs">${spot.zoneName}</div>
            </div>
          `)
          .addTo(map.current);
      });

      el.addEventListener('mouseleave', () => {
        popup.remove();
      });

      markersRef.current.push(marker);
    });

    // Add zone labels
    zones.forEach(zone => {
      const feature = zoneBoundaries.features.find(f => f.properties.zoneId === zone.id);
      if (!feature) return;

      const coords = feature.geometry.coordinates[0];
      const centerLng = coords.reduce((sum, c) => sum + c[0], 0) / coords.length;
      const centerLat = coords.reduce((sum, c) => sum + c[1], 0) / coords.length;

      const el = document.createElement('div');
      el.className = 'zone-label pointer-events-none';
      el.innerHTML = `
        <div class="px-2 py-1 rounded text-xs font-medium text-white/80 text-shadow">
          ${zone.name}
        </div>
      `;

      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([centerLng, centerLat + 0.02])
        .addTo(map.current);

      markersRef.current.push(marker);
    });
  }, [mapLoaded, allSpots, zones, onSelectSpot]);

  // Add/update user location marker
  useEffect(() => {
    if (!mapLoaded || !map.current || !userLocation) return;

    // Remove existing marker
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    // Create user location marker with pulsing effect
    const el = document.createElement('div');
    el.className = 'user-location-marker';
    el.innerHTML = `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;width:40px;height:40px;background:rgba(59,130,246,0.2);border-radius:50%;animation:pulse 2s ease-out infinite;"></div>
        <div style="width:18px;height:18px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.4);position:relative;z-index:1;"></div>
      </div>
    `;

    userMarkerRef.current = new mapboxgl.Marker({ element: el, anchor: 'center' })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map.current);
  }, [mapLoaded, userLocation]);

  // Reset view handler
  const handleResetView = () => {
    if (map.current) {
      map.current.flyTo({
        center: MAUI_CENTER,
        zoom: INITIAL_ZOOM,
        pitch: INITIAL_PITCH,
        bearing: INITIAL_BEARING,
        duration: 1500,
      });
    }
  };

  // Fly to user location
  const handleFlyToUser = () => {
    if (map.current && userLocation) {
      map.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 14,
        pitch: 45,
        duration: 1500,
      });
    }
  };

  return (
    <div className="h-full w-full relative">
      {/* Map container */}
      <div ref={mapContainer} className="absolute inset-0" style={{ width: '100%', height: '100%' }} />

      {/* Weather overlay */}
      {weather && <WeatherOverlay weather={weather} />}

      {/* Map control buttons */}
      <div className="absolute bottom-24 right-4 z-10 flex flex-col gap-2">
        {/* Fly to user location */}
        {userLocation && (
          <button
            onClick={handleFlyToUser}
            className="p-2 bg-ocean-900/90 hover:bg-ocean-800/90 text-ocean-200 rounded-lg backdrop-blur-sm transition-colors shadow-lg"
            title="Go to my location"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        )}
        {/* Reset view */}
        <button
          onClick={handleResetView}
          className="p-2 bg-ocean-900/90 hover:bg-ocean-800/90 text-ocean-200 rounded-lg backdrop-blur-sm transition-colors shadow-lg"
          title="Reset View"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 glass rounded-lg p-3">
        <div className="text-xs text-ocean-300 mb-2 font-medium">Conditions</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-score-green"></div>
            <span className="text-xs text-ocean-200">Good (6.6-10)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-score-yellow"></div>
            <span className="text-xs text-ocean-200">Moderate (5.1-6.5)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-score-orange"></div>
            <span className="text-xs text-ocean-200">Caution (3.6-5.0)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-score-red"></div>
            <span className="text-xs text-ocean-200">Hazardous (1.0-3.5)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapView;
