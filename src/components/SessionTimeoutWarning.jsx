import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const SessionTimeoutWarning = () => {
  const { user } = useAuth();
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (!user) return;

    const checkTimeRemaining = () => {
      const sessionStart = localStorage.getItem('offly-session-start');
      if (!sessionStart) return;

      const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
      const WARNING_THRESHOLD = 30 * 60 * 1000; // 30 minutes before expiry
      
      const currentTime = new Date().getTime();
      const sessionAge = currentTime - parseInt(sessionStart);
      const remaining = SESSION_TIMEOUT - sessionAge;

      if (remaining <= WARNING_THRESHOLD && remaining > 0) {
        setTimeRemaining(remaining);
        setShowWarning(true);
      } else {
        setShowWarning(false);
      }
    };

    // Check immediately and then every minute
    checkTimeRemaining();
    const interval = setInterval(checkTimeRemaining, 60000);

    return () => clearInterval(interval);
  }, [user]);

  const formatTimeRemaining = (milliseconds) => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  if (!showWarning || !timeRemaining) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg max-w-sm">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Session Expiring Soon
          </h3>
          <p className="mt-1 text-sm text-yellow-700">
            Your session will expire in {formatTimeRemaining(timeRemaining)}. 
            You'll be automatically logged out for security.
          </p>
        </div>
        <div className="ml-auto pl-3">
          <button
            onClick={() => setShowWarning(false)}
            className="inline-flex text-yellow-400 hover:text-yellow-600"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutWarning;
