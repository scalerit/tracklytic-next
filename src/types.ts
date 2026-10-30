import type Tracklytic from '@scalerit/tracklytic';
import type { ClientOptions, IdentifyOptions } from '@scalerit/tracklytic';

export type * from '@scalerit/tracklytic';
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
