// Client-side exports
export { TracklyticProvider, useTracklytic } from './context';
export { TracklyticProvider as TracklyticProviderApp, SetUserIdServerComponent } from './provider';
export { TracklyticDataAttributes, useDataAttributeTracking } from './data-attributes';

// Server-side exports
export { TracklyticServer, createTracklyticServer } from './server';

// Type exports
export type {
  TrackOptions,
  IdentifyOptions,
  InsightTrackOptions,
  InsightIncrementOptions,
  TracklyticConfig,
  TracklyticContextValue
} from './types';

// Re-export the base Tracklytic client for advanced usage
export { default as Tracklytic } from 'tracklytic'; 