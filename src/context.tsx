'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import Tracklytic from 'tracklytic';
import type { TracklyticContextValue, TracklyticConfig } from './types';

const TracklyticContext = createContext<TracklyticContextValue | null>(null);

interface TracklyticProviderProps extends TracklyticConfig {
  children: React.ReactNode;
}

export function TracklyticProvider({ 
  children, 
  token, 
  project, 
  disableTracking = false 
}: TracklyticProviderProps) {
  const [client] = useState(() => new Tracklytic({ token, project, disableTracking }));
  const [userId, setUserIdState] = useState<string | null>(null);
  const [debug, setDebugState] = useState(false);

  const setUserId = useCallback((newUserId: string | null) => {
    setUserIdState(newUserId);
    if (debug) {
      console.log('Tracklytic: User ID set to', newUserId);
    }
  }, [debug]);

  const clearUserId = useCallback(() => {
    setUserIdState(null);
    if (debug) {
      console.log('Tracklytic: User ID cleared');
    }
  }, [debug]);

  const setDebug = useCallback((flag: boolean = true) => {
    setDebugState(flag);
    if (flag) {
      console.log('Tracklytic: Debug mode enabled');
    }
  }, []);

  const track = useCallback(async (options: Parameters<TracklyticContextValue['track']>[0]) => {
    try {
      // Automatically add user_id if not provided and we have one set
      const trackOptions = userId && !options.user_id 
        ? { ...options, user_id: userId }
        : options;

      if (debug) {
        console.log('Tracklytic: Tracking event', trackOptions);
      }

      const result = await client.track(trackOptions);
      
      if (debug) {
        console.log('Tracklytic: Event tracked successfully', result);
      }
      
      return result;
    } catch (error) {
      if (debug) {
        console.error('Tracklytic: Error tracking event', error);
      }
      throw error;
    }
  }, [client, userId, debug]);

  const identify = useCallback(async (options: Parameters<TracklyticContextValue['identify']>[0]) => {
    try {
      // Automatically add user_id if not provided and we have one set
      const identifyOptions = userId && !options.user_id 
        ? { ...options, user_id: userId }
        : options;

      if (debug) {
        console.log('Tracklytic: Identifying user', identifyOptions);
      }

      const result = await client.identify(identifyOptions);
      
      if (debug) {
        console.log('Tracklytic: User identified successfully', result);
      }
      
      return result;
    } catch (error) {
      if (debug) {
        console.error('Tracklytic: Error identifying user', error);
      }
      throw error;
    }
  }, [client, userId, debug]);

  const insight = {
    track: useCallback(async (options: Parameters<TracklyticContextValue['insight']['track']>[0]) => {
      try {
        if (debug) {
          console.log('Tracklytic: Tracking insight', options);
        }

        const result = await client.insight.track(options);
        
        if (debug) {
          console.log('Tracklytic: Insight tracked successfully', result);
        }
        
        return result;
      } catch (error) {
        if (debug) {
          console.error('Tracklytic: Error tracking insight', error);
        }
        throw error;
      }
    }, [client, debug]),

    increment: useCallback(async (options: Parameters<TracklyticContextValue['insight']['increment']>[0]) => {
      try {
        if (debug) {
          console.log('Tracklytic: Incrementing insight', options);
        }

        const result = await client.insight.increment(options);
        
        if (debug) {
          console.log('Tracklytic: Insight incremented successfully', result);
        }
        
        return result;
      } catch (error) {
        if (debug) {
          console.error('Tracklytic: Error incrementing insight', error);
        }
        throw error;
      }
    }, [client, debug])
  };

  const contextValue: TracklyticContextValue = {
    track,
    identify,
    insight,
    setUserId,
    clearUserId,
    setDebug,
    userId,
    debug
  };

  return (
    <TracklyticContext.Provider value={contextValue}>
      {children}
    </TracklyticContext.Provider>
  );
}

export function useTracklytic(): TracklyticContextValue {
  const context = useContext(TracklyticContext);
  if (!context) {
    throw new Error('useTracklytic must be used within a TracklyticProvider');
  }
  return context;
} 