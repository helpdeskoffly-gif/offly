import { useState, useEffect, useCallback } from 'react';
import { canUserCheckin } from '../services/database';

export const useCheckinCooldown = (userId) => {
  const [cooldownInfo, setCooldownInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);

  const checkCooldownStatus = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const result = await canUserCheckin(userId);
      if (result.success) {
        setCooldownInfo(result);
        
        // Set initial time remaining if in cooldown
        if (!result.canCheckin) {
          const totalMinutes = result.waitTimeMinutes;
          setTimeRemaining(totalMinutes * 60); // Convert to seconds
        } else {
          setTimeRemaining(null);
        }
      }
    } catch (error) {
      console.error('Error checking cooldown:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Real-time countdown timer
  useEffect(() => {
    if (!timeRemaining || timeRemaining <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Cooldown finished, refresh cooldown status
          checkCooldownStatus();
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, checkCooldownStatus]);

  // Initial load and periodic refresh
  useEffect(() => {
    if (userId) {
      checkCooldownStatus();
      
      // Refresh every 30 seconds to stay in sync
      const refreshInterval = setInterval(checkCooldownStatus, 30000);
      return () => clearInterval(refreshInterval);
    }
  }, [userId, checkCooldownStatus]);

  const formatTimeRemaining = useCallback(() => {
    if (!timeRemaining) return null;
    
    const hours = Math.floor(timeRemaining / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = timeRemaining % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }, [timeRemaining]);

  return {
    cooldownInfo,
    isLoading,
    timeRemaining,
    formatTimeRemaining: formatTimeRemaining(),
    canCheckin: cooldownInfo?.canCheckin ?? true,
    refreshCooldown: checkCooldownStatus
  };
}; 