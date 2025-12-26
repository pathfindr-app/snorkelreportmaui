import { useState, useEffect } from 'react';

// Maalaea Harbor coordinates (default location)
const MAALAEA_HARBOR = { lat: 20.7903, lon: -156.5089, name: 'Maalaea Harbor' };
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const CACHE_KEY = 'maui_weather_cache';
const USER_LOCATION_CACHE_KEY = 'maui_user_weather_cache';

/**
 * Hook to fetch and cache OpenWeatherMap data
 * Supports both default (Maalaea Harbor) and user location
 */
export function useWeather() {
  const [weather, setWeather] = useState(null);
  const [userWeather, setUserWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationPermission, setLocationPermission] = useState('prompt'); // 'prompt', 'granted', 'denied'

  // Fetch weather for given coordinates
  const fetchWeatherForCoords = async (coords, cacheKey) => {
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    if (!apiKey) {
      throw new Error('Weather API key not configured');
    }

    // Check cache first (also verify locationName exists to handle old cache format)
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION && data.locationName) {
        return data;
      }
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${apiKey}&units=imperial`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Weather API request failed');
    }

    const data = await response.json();

    const weatherData = {
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      wind: {
        speed: Math.round(data.wind.speed),
        deg: data.wind.deg,
        direction: getWindDirection(data.wind.deg),
      },
      description: data.weather[0]?.description || '',
      icon: data.weather[0]?.icon || '',
      visibility: data.visibility ? Math.round(data.visibility / 1609.34) : null,
      sunrise: formatHawaiiTime(data.sys.sunrise),
      sunset: formatHawaiiTime(data.sys.sunset),
      locationName: coords.name || data.name || 'Unknown',
      isUserLocation: !!coords.isUserLocation,
    };

    // Cache the result
    localStorage.setItem(cacheKey, JSON.stringify({
      data: weatherData,
      timestamp: Date.now(),
    }));

    return weatherData;
  };

  // Request user location
  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationPermission('denied');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setLocationPermission('granted');
        try {
          const userCoords = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            isUserLocation: true,
          };

          // Reverse geocode to get city name
          const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
          if (apiKey) {
            try {
              const geoUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${userCoords.lat}&lon=${userCoords.lon}&limit=1&appid=${apiKey}`;
              const geoResponse = await fetch(geoUrl);
              if (geoResponse.ok) {
                const geoData = await geoResponse.json();
                if (geoData.length > 0) {
                  userCoords.name = geoData[0].name || 'Your Location';
                }
              }
            } catch (geoErr) {
              console.log('Reverse geocode failed, using default name');
              userCoords.name = 'Your Location';
            }
          }

          const userWeatherData = await fetchWeatherForCoords(userCoords, USER_LOCATION_CACHE_KEY);
          setUserWeather(userWeatherData);
        } catch (err) {
          console.error('Failed to fetch user location weather:', err);
        }
      },
      (err) => {
        console.log('Location permission denied or error:', err.message);
        setLocationPermission('denied');
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  useEffect(() => {
    const init = async () => {
      try {
        // Always fetch default Maalaea Harbor weather
        const defaultWeather = await fetchWeatherForCoords(MAALAEA_HARBOR, CACHE_KEY);
        setWeather(defaultWeather);

        // Check if we have cached user weather
        const cachedUserWeather = localStorage.getItem(USER_LOCATION_CACHE_KEY);
        if (cachedUserWeather) {
          const { data, timestamp } = JSON.parse(cachedUserWeather);
          if (Date.now() - timestamp < CACHE_DURATION) {
            setUserWeather(data);
            setLocationPermission('granted');
          }
        }

        // Request user location (browser will prompt if needed)
        requestUserLocation();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  return {
    weather,           // Default Maalaea Harbor weather
    userWeather,       // User's location weather (if available)
    loading,
    error,
    locationPermission,
    requestUserLocation, // Allow manual re-request
  };
}

/**
 * Format Unix timestamp to Hawaii time (HH:MM AM/PM)
 */
function formatHawaiiTime(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000);
  return date.toLocaleTimeString('en-US', {
    timeZone: 'Pacific/Honolulu',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Convert wind degrees to cardinal direction
 */
function getWindDirection(deg) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
}

export default useWeather;
