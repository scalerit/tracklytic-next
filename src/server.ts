import Tracklytic from 'tracklytic';
import type { TrackOptions, IdentifyOptions, InsightTrackOptions, InsightIncrementOptions } from './types';

/**
 * Server-side Tracklytic client for Next.js
 * Use this in server components and API routes
 */
export class TracklyticServer {
  private client: Tracklytic;

  constructor(config: { token: string; project: string; disableTracking?: boolean }) {
    this.client = new Tracklytic(config);
  }

  /**
   * Track an event
   */
  async track(options: TrackOptions): Promise<boolean> {
    return this.client.track(options);
  }

  /**
   * Identify a user
   */
  async identify(options: IdentifyOptions): Promise<boolean> {
    return this.client.identify(options);
  }

  /**
   * Get insight methods
   */
  get insight() {
    return {
      track: this.insightTrack.bind(this),
      increment: this.insightIncrement.bind(this)
    };
  }

  /**
   * Track an insight
   */
  private async insightTrack(options: InsightTrackOptions): Promise<boolean> {
    return this.client.insight.track(options);
  }

  /**
   * Increment an insight value
   */
  private async insightIncrement(options: InsightIncrementOptions): Promise<boolean> {
    return this.client.insight.increment(options);
  }
}

/**
 * Create a server-side Tracklytic instance
 */
export function createTracklyticServer(config: { token: string; project: string; disableTracking?: boolean }): TracklyticServer {
  return new TracklyticServer(config);
} 