import type Tracklytic from 'tracklytic';
import type { ClientOptions, IdentifyOptions } from 'tracklytic';

export type * from 'tracklytic';
export type TracklyticConfig = ClientOptions;
export type ContextIdentifyOptions = Omit<IdentifyOptions, 'userId'> & { userId?: string };

export interface TracklyticContextValue {
  track: Tracklytic['track'];
  createEvent: Tracklytic['createEvent'];
  identify: (options: ContextIdentifyOptions) => ReturnType<Tracklytic['identify']>;
  pipeline: Tracklytic['pipeline'];
  events: Tracklytic['events'];
  profiles: Tracklytic['profiles'];
  insight: Tracklytic['insight'];
  setUserId: (userId: string | null) => void;
  clearUserId: () => void;
  setDebug: (flag?: boolean) => void;
  userId: string | null;
  debug: boolean;
}
