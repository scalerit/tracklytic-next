'use client';

import { useEffect } from 'react';
import { useTracklytic } from './context';
import type { TrackOptions, LogLevel } from './types';

const logLevels: LogLevel[] = ['info', 'warning', 'failed', 'critical'];

/** Extract current event fields from a data-event element. Missing notify preserves API defaults. */
export function eventFromElement(target: Element, userId: string | null = null): TrackOptions | undefined {
  const event = target.getAttribute('data-event');
  if (!event) return undefined;
  const tags: Record<string, string | number | boolean> = {};
  for (const attribute of Array.from(target.attributes)) {
    if (!attribute.name.startsWith('data-tag-')) continue;
    const key = attribute.name.slice('data-tag-'.length);
    if (!key) continue;
    const value = attribute.value;
    const number = Number(value);
    const parsed = value === 'true' ? true : value === 'false' ? false
      : value.trim() !== '' && Number.isFinite(number) ? number : value;
    Object.defineProperty(tags, key, { value: parsed, enumerable: true });
  }
  const level = target.getAttribute('data-log-level');
  const notify = target.getAttribute('data-notify');
  return {
    channel: target.getAttribute('data-channel') || 'events', event,
    userId: target.getAttribute('data-user-id') || userId || undefined,
    description: target.getAttribute('data-description') || undefined,
    logLevel: level && logLevels.includes(level as LogLevel) ? level as LogLevel : undefined,
    notify: notify === 'true' ? true : notify === 'false' ? false : undefined,
    tags: Object.keys(tags).length ? tags : undefined,
  };
}

/** Delegated tracking also handles clicks on children of a data-event element. */
export function useDataAttributeTracking() {
  const { track, userId } = useTracklytic();
  useEffect(() => {
    const handleClick = (event: Event) => {
      if (!(event.target instanceof Element)) return;
      const target = event.target.closest('[data-event]');
      if (!target) return;
      const options = eventFromElement(target, userId);
      if (options) void track(options).catch(() => {
        console.error('Tracklytic: Data attribute event tracking failed');
      });
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [track, userId]);
}

export function TracklyticDataAttributes() {
  useDataAttributeTracking();
  return null;
}
