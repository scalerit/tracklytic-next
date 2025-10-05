import type { TrackOptions, IdentifyOptions, InsightTrackOptions, InsightIncrementOptions } from 'tracklytic';

export type { TrackOptions, IdentifyOptions, InsightTrackOptions, InsightIncrementOptions };

export interface TracklyticConfig {
  token: string;
  project: string;
  disableTracking?: boolean;
}

export interface TracklyticContextValue {
  track: (options: TrackOptions) => Promise<boolean>;
  identify: (options: IdentifyOptions) => Promise<boolean>;
  insight: {
    track: (options: InsightTrackOptions) => Promise<boolean>;
    increment: (options: InsightIncrementOptions) => Promise<boolean>;
  };
  setUserId: (userId: string | null) => void;
  clearUserId: () => void;
  setDebug: (flag?: boolean) => void;
  userId: string | null;
  debug: boolean;
} 