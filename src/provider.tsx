'use client';

import { useEffect } from 'react';
import { useTracklytic } from './context';

interface TracklyticProviderProps {
  token: string;
  project: string;
  disableTracking?: boolean;
}

/**
 * Provider component for App Directory structure
 * This should be placed in the head element of your root layout
 */
export function TracklyticProvider({ token, project, disableTracking = false }: TracklyticProviderProps) {
  const { setDebug } = useTracklytic();

  useEffect(() => {
    // Initialize the provider with the given configuration
    // This will be handled by the context provider
    if (process.env.NODE_ENV === 'development') {
      setDebug(true);
    }
  }, [setDebug]);

  // This component doesn't render anything visible
  return null;
}

/**
 * Server component for setting user ID in App Directory
 * This should be used in server components where you need to set the user ID
 */
export function SetUserIdServerComponent({ userId }: { userId: string | null }) {
  const { setUserId } = useTracklytic();

  useEffect(() => {
    setUserId(userId);
  }, [userId, setUserId]);

  // This component doesn't render anything visible
  return null;
} 