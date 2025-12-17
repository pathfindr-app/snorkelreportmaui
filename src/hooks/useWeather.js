import { useState, useEffect } from 'react';

const MAUI_COORDS = { lat: 20.7984, lon: -156.3319 };
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const CACHE_KEY = 'maui_weather_cache';

/**
 * Hook to fetch and cache OpenWeatherMap data
 */
export function useWeather() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      // Check cache first
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setWeather(data);
          setLoading(false);
          return;
        }
      }

      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
      if (!apiKey) {
        setError('Weather API key not configured');
        setLoading(false);
        return;
      }

      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${MAUI_COORDS.lat}&lon=${MAUI_COORDS.lon}&appid=${apiKey}&units=imperial`;

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
          visibility: data.visibility ? Math.round(data.visibility / 1609.34) : null, // Convert to miles
        };

        // Cache the result
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: weatherData,
          timestamp: Date.now(),
        }));

        setWeather(weatherData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  return { weather, loading, error };
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
