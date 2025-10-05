'use client';

import { useEffect } from 'react';
import { useTracklytic } from './context';
import type { TrackOptions } from './types';

/**
 * Hook to enable data attribute tracking on elements
 * This allows tracking events directly from HTML elements using data attributes
 */
export function useDataAttributeTracking() {
  const { track, userId } = useTracklytic();

  useEffect(() => {
    const handleClick = async (event: Event) => {
      const target = event.target as HTMLElement;
      const eventName = target.getAttribute('data-event');
      
      if (!eventName) return;

      // Extract all data attributes
      const channel = target.getAttribute('data-channel') || 'events';
      const icon = target.getAttribute('data-icon') || undefined;
      const description = target.getAttribute('data-description') || undefined;
      const notify = target.getAttribute('data-notify') === 'true';
      
      // Extract user_id (use the one from context if not provided)
      const elementUserId = target.getAttribute('data-user-id');
      const finalUserId = elementUserId || userId || undefined;

      // Extract tags (all data-tag-* attributes)
      const tags: Record<string, string | number | boolean> = {};
      for (const attr of target.attributes) {
        if (attr.name.startsWith('data-tag-')) {
          const tagKey = attr.name.replace('data-tag-', '');
          const tagValue = attr.value;
          
          // Try to parse the value as number or boolean
          if (tagValue === 'true') {
            tags[tagKey] = true;
          } else if (tagValue === 'false') {
            tags[tagKey] = false;
          } else if (!isNaN(Number(tagValue))) {
            tags[tagKey] = Number(tagValue);
          } else {
            tags[tagKey] = tagValue;
          }
        }
      }

      const trackOptions: TrackOptions = {
        channel,
        event: eventName,
        user_id: finalUserId,
        icon,
        description,
        notify,
        tags: Object.keys(tags).length > 0 ? tags : undefined
      };

      try {
        await track(trackOptions);
      } catch (error) {
        console.error('Failed to track event via data attributes:', error);
      }
    };

    // Add event listener to document
    document.addEventListener('click', handleClick);

    // Cleanup
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [track, userId]);
}

/**
 * Component that enables data attribute tracking
 * Include this in your app to enable data attribute tracking
 */
export function TracklyticDataAttributes() {
  useDataAttributeTracking();
  return null;
} 