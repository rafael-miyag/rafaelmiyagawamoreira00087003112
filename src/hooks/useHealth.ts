import { useState, useEffect, useCallback } from 'react';
import { healthFacade, HealthStatus } from '../services/facades/HealthFacade';

export const useHealth = () => {
  const [health, setHealth] = useState<HealthStatus>({ status: 'UNKNOWN' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const subscription = healthFacade.getHealthStatus$().subscribe(status => {
      setHealth(status);
    });

    // Start periodic health checks
    healthFacade.startPeriodicCheck(30000);

    return () => {
      subscription.unsubscribe();
      healthFacade.stopPeriodicCheck();
    };
  }, []);

  const checkHealth = useCallback(async () => {
    setLoading(true);
    try {
      await healthFacade.checkHealth();
    } finally {
      setLoading(false);
    }
  }, []);

  const checkLiveness = useCallback(async () => {
    return healthFacade.checkLiveness();
  }, []);

  const checkReadiness = useCallback(async () => {
    return healthFacade.checkReadiness();
  }, []);

  return {
    health,
    loading,
    checkHealth,
    checkLiveness,
    checkReadiness,
    isUp: health.status === 'UP',
    isDown: health.status === 'DOWN',
  };
};
