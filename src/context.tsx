'use client';

import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import Tracklytic from '@scalerit/tracklytic';
import type { TracklyticContextValue, TracklyticConfig } from './types';

const TracklyticContext = createContext<TracklyticContextValue | null>(null);

export interface TracklyticProviderProps extends TracklyticConfig {
  children: React.ReactNode;
}

/** Browser usage exposes its configured token to the browser. Prefer the server entry for privileged tokens. */
export function TracklyticProvider({ children, token, project, disableTracking, baseUrl, accessToken, request }: TracklyticProviderProps) {
  const client = useMemo(() => new Tracklytic({ token, project, disableTracking, baseUrl, accessToken, request }),
    [token, project, disableTracking, baseUrl, accessToken, request]);
  const [userId, setUserId] = useState<string | null>(null);
  const [debug, setDebug] = useState(false);
  const clearUserId = useCallback(() => setUserId(null), []);
  const changeDebug = useCallback((flag = true) => setDebug(flag), []);

  const track = useCallback<TracklyticContextValue['track']>(async options => {
    try {
      return await client.track({ ...options, userId: options.userId ?? userId ?? undefined });
    } catch (error) {
      if (debug) console.error('Tracklytic: Event tracking failed');
      throw error;
    }
  }, [client, userId, debug]);

  const createEvent = useCallback<TracklyticContextValue['createEvent']>(options =>
    client.createEvent({ ...options, userId: options.userId ?? userId ?? undefined }), [client, userId]);

  const identify = useCallback<TracklyticContextValue['identify']>(options => {
    const id = options.userId ?? userId;
    if (!id) return Promise.reject(new Error('identify requires a userId. Pass it explicitly or call setUserId first.'));
    return client.identify({ ...options, userId: id });
  }, [client, userId]);

  const pipeline = useMemo<TracklyticContextValue['pipeline']>(() => ({
    ...client.pipeline,
    create: options => client.pipeline.create({ ...options, userId: options.userId ?? userId ?? undefined }),
  }), [client, userId]);

  const value = useMemo<TracklyticContextValue>(() => ({
    track, createEvent, identify, pipeline, events: client.events, profiles: client.profiles, insight: client.insight,
    setUserId, clearUserId, setDebug: changeDebug, userId, debug,
  }), [track, createEvent, identify, pipeline, client, clearUserId, changeDebug, userId, debug]);

  return <TracklyticContext.Provider value={value}>{children}</TracklyticContext.Provider>;
}

export function useTracklytic(): TracklyticContextValue {
  const context = useContext(TracklyticContext);
  if (!context) throw new Error('useTracklytic must be used within a TracklyticProvider');
  return context;
}
