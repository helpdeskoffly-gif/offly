import { useState } from "react";

// Hook to manage notification state
export function useProfileCompletionNotification() {
  const [showNotification, setShowNotification] = useState(false);
  const [dismissedAt, setDismissedAt] = useState(null);

  // Check if notification should be shown
  const checkShouldShow = (userProfile) => {
    // Don't show if profile is completed
    if (userProfile?.profileCompleted) {
      setShowNotification(false);
      return;
    }

    // Don't show if recently dismissed (within 1 hour)
    if (dismissedAt && Date.now() - dismissedAt < 60 * 60 * 1000) {
      setShowNotification(false);
      return;
    }

    // Don't show if userProfile is null/undefined (still loading)
    if (!userProfile) {
      setShowNotification(false);
      return;
    }

    // Show notification if profile is not completed and hasn't been dismissed recently
    // Only show once, not repeatedly
    if (!userProfile?.profileCompleted && !userProfile?.profileSkipped && !showNotification) {
      setShowNotification(true);
    }
  };

  const handleDismiss = () => {
    setShowNotification(false);
    setDismissedAt(Date.now());
  };

  const handleRemindLater = () => {
    setShowNotification(false);
    setDismissedAt(Date.now());
    // Set a reminder for later (you could store this in localStorage or database)
    setTimeout(() => {
      setShowNotification(true);
    }, 30 * 60 * 1000); // Remind after 30 minutes
  };

  const handleComplete = () => {
    setShowNotification(false);
  };

  return {
    showNotification,
    checkShouldShow,
    handleDismiss,
    handleRemindLater,
    handleComplete,
  };
}
