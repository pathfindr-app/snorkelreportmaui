import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { scoreToColor } from '../../utils/scoreToColor';
import WeatherOverlay from './WeatherOverlay';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

// Maui center coordinates and initial view
const MAUI_CENTER = [-156.3319, 20.7984];
const INITIAL_ZOOM = 9;
const INITIAL_PITCH = 0;
const INITIAL_BEARING = 0;

const BUSINESS_ICONS = {
  pizza: { image: '/outrigger-logo.png' },
  sandwich: { image: '/808deli-logo.png' },
  boat: { image: '/aqua-adventures-logo.png' },
};

function MapView({ zones, allSpots, businesses = [], weather, userWeather, onSelectSpot, onSelectBusiness, onBackToLanding }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const businessMarkersRef = useRef([]);
  const boatMarkerRef = useRef(null);
  const boatAnimationRef = useRef(null);
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
            <div style="font-size: 14px;">
              <div style="font-weight: 600; color: #e6f4f9;">${spot.name}</div>
              <div style="font-size: 12px; color: #8dcde5;">${spot.zoneName}</div>
            </div>
          `)
          .addTo(map.current);
      });

      el.addEventListener('mouseleave', () => {
        popup.remove();
      });

      markersRef.current.push(marker);
    });
  }, [mapLoaded, allSpots, zones, onSelectSpot]);

  // Add business markers when map is loaded
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    // Clear existing business markers
    businessMarkersRef.current.forEach(marker => marker.remove());
    businessMarkersRef.current = [];

    // Add business markers (skip animated ones - they're handled separately)
    businesses.filter(b => !b.animated).forEach((business, index) => {
      const iconConfig = BUSINESS_ICONS[business.icon] || { image: null };

      // Subtle, understated marker - secondary to main content
      const el = document.createElement('div');
      el.className = 'partner-marker';
      el.innerHTML = `
        <div class="partner-ring"></div>
        <div class="partner-core">
          <img src="${iconConfig.image}" alt="${business.name}" draggable="false" />
        </div>
      `;

      el.addEventListener('click', () => {
        onSelectBusiness(business);
      });

      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat(business.coordinates)
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
          .setLngLat(business.coordinates)
          .setHTML(`
            <div style="font-size: 14px;">
              <div style="font-weight: 600; color: #e6f4f9;">${business.name}</div>
              <div style="font-size: 12px; color: #8dcde5;">Local Business</div>
            </div>
          `)
          .addTo(map.current);
      });

      el.addEventListener('mouseleave', () => {
        popup.remove();
      });

      businessMarkersRef.current.push(marker);
    });
  }, [mapLoaded, businesses, onSelectBusiness]);

  // Add animated boat marker
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    // Find animated boat business
    const boatBusiness = businesses.find(b => b.animated && b.icon === 'boat');
    if (!boatBusiness) return;

    // Clean up existing boat marker and animation
    if (boatMarkerRef.current) {
      boatMarkerRef.current.remove();
    }
    if (boatAnimationRef.current) {
      cancelAnimationFrame(boatAnimationRef.current);
    }

    // Create boat marker element with oceanic animations
    const el = document.createElement('div');
    el.className = 'boat-marker';
    const boatIcon = BUSINESS_ICONS.boat;
    el.innerHTML = `
      <div class="boat-marker-wrap">
        <div class="boat-marker-wake"></div>
        <div class="boat-marker-wake boat-marker-wake-2"></div>
        <div class="boat-marker-glow"></div>
        <div class="boat-marker-core">
          <img src="${boatIcon.image}" alt="${boatBusiness.name}" />
        </div>
      </div>
    `;

    el.addEventListener('click', () => {
      onSelectBusiness(boatBusiness);
    });

    // Start position
    const start = boatBusiness.routeStart;
    const end = boatBusiness.routeEnd;

    boatMarkerRef.current = new mapboxgl.Marker({ element: el, anchor: 'center' })
      .setLngLat(start)
      .addTo(map.current);

    // Add popup on hover
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 30,
      className: 'spot-popup',
    });

    el.addEventListener('mouseenter', () => {
      const currentPos = boatMarkerRef.current.getLngLat();
      popup
        .setLngLat([currentPos.lng, currentPos.lat])
        .setHTML(`
          <div style="font-size: 14px;">
            <div style="font-weight: 600; color: #e6f4f9;">${boatBusiness.name}</div>
            <div style="font-size: 12px; color: #8dcde5;">Snorkel Tour - Click to Book!</div>
          </div>
        `)
        .addTo(map.current);
    });

    el.addEventListener('mouseleave', () => {
      popup.remove();
    });

    // Animate boat along route (60 second round trip)
    const animationDuration = 60000;
    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = (elapsed % animationDuration) / animationDuration;

      // Ping-pong animation (go and return)
      const t = progress < 0.5
        ? progress * 2
        : 1 - (progress - 0.5) * 2;

      // Ease in-out for smoother movement
      const eased = t < 0.5
        ? 2 * t * t
        : 1 - Math.pow(-2 * t + 2, 2) / 2;

      const lng = start[0] + (end[0] - start[0]) * eased;
      const lat = start[1] + (end[1] - start[1]) * eased;

      if (boatMarkerRef.current) {
        boatMarkerRef.current.setLngLat([lng, lat]);
      }

      boatAnimationRef.current = requestAnimationFrame(animate);
    };

    boatAnimationRef.current = requestAnimationFrame(animate);

    return () => {
      if (boatAnimationRef.current) {
        cancelAnimationFrame(boatAnimationRef.current);
      }
    };
  }, [mapLoaded, businesses, onSelectBusiness]);

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
      {weather && <WeatherOverlay weather={weather} userWeather={userWeather} />}

      {/* Unified map controls */}
      <div
        className="absolute bottom-6 right-3 z-10 flex flex-col rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(15, 48, 69, 0.9) 0%, rgba(5, 21, 32, 0.95) 100%)',
          border: '1px solid rgba(0, 229, 204, 0.15)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 229, 204, 0.1)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Zoom in */}
        <button
          onClick={() => map.current?.zoomIn()}
          className="w-11 h-11 flex items-center justify-center text-glow-cyan/70 hover:text-glow-cyan hover:bg-glow-cyan/10 transition-all duration-300"
          title="Zoom in"
          style={{ borderBottom: '1px solid rgba(0, 229, 204, 0.1)' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
          </svg>
        </button>

        {/* Zoom out */}
        <button
          onClick={() => map.current?.zoomOut()}
          className="w-11 h-11 flex items-center justify-center text-glow-cyan/70 hover:text-glow-cyan hover:bg-glow-cyan/10 transition-all duration-300"
          title="Zoom out"
          style={{ borderBottom: '1px solid rgba(0, 229, 204, 0.1)' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
          </svg>
        </button>

        {/* My location */}
        {userLocation && (
          <button
            onClick={handleFlyToUser}
            className="w-11 h-11 flex items-center justify-center text-glow-cyan/70 hover:text-glow-cyan hover:bg-glow-cyan/10 transition-all duration-300"
            title="My location"
            style={{ borderBottom: '1px solid rgba(0, 229, 204, 0.1)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3" />
              <path strokeLinecap="round" d="M12 2v3m0 14v3m10-10h-3M5 12H2" />
            </svg>
          </button>
        )}

        {/* Reset view / home */}
        <button
          onClick={handleResetView}
          className="w-11 h-11 flex items-center justify-center text-glow-cyan/70 hover:text-glow-cyan hover:bg-glow-cyan/10 transition-all duration-300"
          title="Reset view"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>
      </div>

      {/* Legend */}
      <div
        className="absolute bottom-4 left-4 z-10 rounded-2xl p-4"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 48, 69, 0.9) 0%, rgba(5, 21, 32, 0.95) 100%)',
          border: '1px solid rgba(0, 229, 204, 0.15)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 229, 204, 0.1)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="text-xs text-glow-cyan/60 mb-3 font-semibold uppercase tracking-wider">Conditions</div>
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 rounded-full bg-score-green" style={{ boxShadow: '0 0 10px rgba(34, 197, 94, 0.5)' }} />
            <span className="text-xs text-ocean-200">Good (6.6-10)</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 rounded-full bg-score-yellow" style={{ boxShadow: '0 0 10px rgba(234, 179, 8, 0.4)' }} />
            <span className="text-xs text-ocean-200">Moderate (5.1-6.5)</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 rounded-full bg-score-orange" style={{ boxShadow: '0 0 10px rgba(249, 115, 22, 0.4)' }} />
            <span className="text-xs text-ocean-200">Caution (3.6-5.0)</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 rounded-full bg-score-red" style={{ boxShadow: '0 0 10px rgba(239, 68, 68, 0.4)' }} />
            <span className="text-xs text-ocean-200">Hazardous (1.0-3.5)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapView;
