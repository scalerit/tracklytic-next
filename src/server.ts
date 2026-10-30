import Tracklytic from '@scalerit/tracklytic';
import type { TracklyticConfig } from './types';

/** Server-only entry point for Route Handlers, Server Actions and Server Components. */
export class TracklyticServer extends Tracklytic {}

export function createTracklyticServer(config: TracklyticConfig): TracklyticServer {
  return new TracklyticServer(config);
}

export type * from './types';
export { HTTPResponseError } from '@scalerit/tracklytic';
