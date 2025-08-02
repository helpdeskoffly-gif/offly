import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../hooks/useAuth';

const PointsContext = createContext();

export const PointsProvider = ({ children }) => {
  const { user } = useAuth();
  const [points, setPoints] = useState(0);

  const fetchUserPoints = useCallback(async () => {
    if (!user) return;
    
    try {
      // First try to get from users table (which should have synced points)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('points')
        .eq('id', user.id)
        .single();

      if (userData && !userError) {
        console.log('✅ Points from users table:', userData.points);
        setPoints(userData.points || 0);
        return;
      }

      // Fallback: calculate from user_points table
      const { data: pointsData, error: pointsError } = await supabase
        .from('user_points')
        .select('total_earned, total_spent')
        .eq('user_id', user.id)
        .single();

      if (pointsData && !pointsError) {
        const calculatedPoints = (pointsData.total_earned || 0) - (pointsData.total_spent || 0);
        console.log('✅ Calculated points from user_points:', calculatedPoints);
        setPoints(calculatedPoints);
        
        // Sync to users table
        await supabase
          .from('users')
          .update({ points: calculatedPoints })
          .eq('id', user.id);
      } else {
        console.log('⚠️ No points data found, setting to 0');
        setPoints(0);
      }
    } catch (error) {
      console.error('❌ Error fetching user points:', error);
      setPoints(0);
    }
  }, [user]);

  useEffect(() => {
    fetchUserPoints();
  }, [fetchUserPoints]);

  // Expose fetchUserPoints globally for other components to use
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.fetchUserPoints = fetchUserPoints;
    }
  }, [fetchUserPoints]);

  const updatePoints = (newPoints) => {
    setPoints(newPoints);
  };

  const contextValue = useMemo(() => ({
    points,
    updatePoints,
    fetchUserPoints
  }), [points, fetchUserPoints]);

  return (
    <PointsContext.Provider value={contextValue}>
      {children}
    </PointsContext.Provider>
  );
};

export const usePoints = () => useContext(PointsContext);