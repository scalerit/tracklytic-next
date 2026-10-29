'use client';

export { TracklyticProvider, useTracklytic } from './context';
export type { TracklyticProviderProps } from './context';
export { TracklyticProvider as TracklyticProviderApp, SetUserId, SetUserIdServerComponent } from './provider';
export { TracklyticDataAttributes, useDataAttributeTracking } from './data-attributes';
// Retained for existing consumers; server code should import tracklytic-next/server.
export { TracklyticServer, createTracklyticServer } from './server';
export type * from './types';
export { default as Tracklytic, HTTPResponseError } from 'tracklytic';
