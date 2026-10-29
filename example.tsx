'use client';

// Browser example only. Private API tokens belong in the server integration documented in README.md.
import { TracklyticProvider, TracklyticDataAttributes, useTracklytic, SetUserId } from './src';

function Dashboard() {
  const { track, identify, insight } = useTracklytic();

  async function upgrade() {
    await identify({ properties: { plan: 'pro' } });
    await track({
      channel: 'billing',
      event: 'Plan upgraded',
      logLevel: 'info',
      badge: { title: 'Pro', color: 'success' },
      tags: { price: 29.99, currency: 'EUR' },
    });
    await insight.increment({ title: 'Upgrades', value: 1 });
  }

  return (
    <div>
      <button onClick={upgrade}>Upgrade plan</button>
      <button data-event="Help opened" data-channel="support" data-log-level="info">
        <span>Open help</span>
      </button>
    </div>
  );
}

export default function Example({ browserToken, userId }: { browserToken: string; userId: string }) {
  return (
    <TracklyticProvider token={browserToken} project="my-project">
      <SetUserId userId={userId} />
      <TracklyticDataAttributes />
      <Dashboard />
    </TracklyticProvider>
  );
}
