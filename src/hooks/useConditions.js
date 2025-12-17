import { useState, useEffect, useMemo } from 'react';
import conditionsData from '../data/conditions.json';

/**
 * Hook to load and provide conditions data
 * Currently loads from static JSON, can be extended for API calls
 */
export function useConditions() {
  const [conditions, setConditions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      setConditions(conditionsData);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
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
  };
}

export default useConditions;
