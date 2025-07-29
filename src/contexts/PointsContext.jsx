import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../hooks/useAuth';

const PointsContext = createContext();

export const PointsProvider = ({ children }) => {
  const { user } = useAuth();
  const [points, setPoints] = useState(0);

  const fetchUserPoints = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('user_points')
      .select('total_points')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setPoints(data.total_points);
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