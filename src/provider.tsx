'use client';

import { useEffect } from 'react';
import { useTracklytic } from './context';

/** App Router uses the same children-wrapping provider as the Pages Router. */
export { TracklyticProvider } from './context';

/** A client component that synchronizes a server-provided user ID with the surrounding provider. */
export function SetUserId({ userId }: { userId: string | null }) {
  const { setUserId } = useTracklytic();
  useEffect(() => { setUserId(userId); }, [userId, setUserId]);
  return null;
}

/** @deprecated This is a Client Component. Use SetUserId instead. */
export const SetUserIdServerComponent = SetUserId;
