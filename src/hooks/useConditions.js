import { useState, useEffect, useMemo } from 'react';
import staticConditionsData from '../data/conditions.json';

// GitHub raw URL for conditions data (updated daily by GitHub Actions)
const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/pathfindr-app/snorkelreportmaui/main/data/conditions.json';

// Cache duration in milliseconds (1 minute)
const CACHE_DURATION = 1 * 60 * 1000;
const CACHE_KEY = 'maui_conditions_cache';

/**
 * Hook to load and provide conditions data
 * Fetches from GitHub with fallback to static JSON
 */
export function useConditions() {
  const [conditions, setConditions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState(null);

  useEffect(() => {
    async function fetchConditions() {
      try {
        // Check cache first
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            setConditions(data);
            setDataSource('cache');
            setLoading(false);
            return;
          }
        }

        // Fetch from GitHub raw URL with cache busting
        const response = await fetch(`${GITHUB_RAW_URL}?t=${Date.now()}`, {
          cache: 'no-store'
        });
        if (response.ok) {
          const data = await response.json();
          setConditions(data);
          setDataSource('github');

          // Cache the response
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            data,
            timestamp: Date.now()
          }));
        } else {
          throw new Error('GitHub fetch failed');
        }
      } catch (err) {
        console.log('GitHub fetch failed, using static data:', err.message);
        // Fallback to static data
        setConditions(staticConditionsData);
        setDataSource('static');
        setError('Using cached data');
      } finally {
        setLoading(false);
      }
    }

    fetchConditions();
  }, []);

  // Flatten spots from all zones for easy access
  const allSpots = useMemo(() => {
    if (!conditions?.zones) return [];

    const spots = [];
    Object.entries(conditions.zones).forEach(([zoneId, zone]) => {
      Object.entries(zone.spots).forEach(([spotId, spot]) => {
        spots.push({
          ...spot,
          zoneId,
          zoneName: zone.name,
          zoneScore: zone.score,
          // Use spot score if available, otherwise inherit zone score
          effectiveScore: spot.score ?? zone.score,
        });
      });
    });
    return spots;
  }, [conditions]);

  // Get zones as array
  const zones = useMemo(() => {
    if (!conditions?.zones) return [];
    return Object.entries(conditions.zones).map(([id, zone]) => ({
      ...zone,
      id,
    }));
  }, [conditions]);

  // Get a specific spot by ID
  const getSpot = (spotId) => {
    return allSpots.find(spot => spot.id === spotId);
  };

  // Get all spots for a zone
  const getSpotsByZone = (zoneId) => {
    return allSpots.filter(spot => spot.zoneId === zoneId);
  };

  return {
    conditions,
    zones,
    allSpots,
    loading,
    error,
    getSpot,
    getSpotsByZone,
    lastUpdated: conditions?.lastUpdated,
    alerts: conditions?.alerts || [],
    marine: conditions?.marine || null,
    dataQuality: conditions?.dataQuality || null,
    dataSource,
  };
}

export default useConditions;
