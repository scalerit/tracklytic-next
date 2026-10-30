# Tracklytic for Next.js

TypeScript integration for events, profiles, insights and pipelines. The SDK uses the current Tracklytic `/v1` API through the `tracklytic` client. Events use `logLevel` and optional `badge`; event icons and emoji fields are no longer supported.

This source uses the official JavaScript SDK 2.0.0 [GitHub release package](https://github.com/scalerit/tracklytic-js/releases/tag/v2.0.0). The dependency is pinned to its public release tarball, and the lockfile verifies its integrity. Installation requires no GitLab credentials. The npm registry publication of `tracklytic@2.0.0` is still pending; once available, replace the release URL with the matching registry version and regenerate the lockfile. The Next.js 2.0.0 release package is available from GitHub. Its npm registry publication is pending.


## Server integration (recommended)

Keep the API token in a server environment variable. Import the separate server entry in Route Handlers, Server Actions or Server Components:

```typescript
import { TracklyticServer } from 'tracklytic-next/server';

const tracklytic = new TracklyticServer({
  token: process.env.TRACKLYTIC_TOKEN!,
  project: 'my-project',
});

await tracklytic.track({
  channel: 'payments',
  event: 'Payment received',
  userId: 'user-123',
  logLevel: 'info',
  badge: { title: 'Paid', color: 'success' },
  tags: { amount: 29.99, currency: 'EUR' },
  timestamp: Date.now(),
});
```

`track()` retains its boolean success result. Use `createEvent()` to receive the response body, especially the generated ID when sending a pipeline. Normal events return `{}`; pipeline creation returns its ID, derived status and pipeline state.

## Pipelines

```typescript
const pipeline = await tracklytic.pipeline.create({
  channel: 'deployments',
  event: 'Production deployment',
  steps: [
    { id: 'build', name: 'Build', stage: 'Build' },
    { id: 'deploy', name: 'Deploy', stage: 'Deploy', requires: ['build'] },
  ],
  pipeline: { timeout: 1800, timeoutAlert: { logLevel: 'failed', notify: true } },
});

// Disabled tracking returns undefined and makes no request.
if (pipeline) {
  await tracklytic.pipeline.update(pipeline.id, { id: 'build', status: 'running' });
  await tracklytic.pipeline.update(pipeline.id, { id: 'build', status: 'success' });
  await tracklytic.pipeline.update(pipeline.id, { id: 'deploy', status: 'running' });
  await tracklytic.pipeline.update(pipeline.id, { id: 'deploy', status: 'success' });
}
```

A stage groups steps visually. Dependencies use `requires`. Tracklytic records the state; your CI or worker performs the actual work. Step statuses: `waiting`, `running`, `success`, `failed`, `skipped`, `cancelled`.

The server client inherits the full JavaScript SDK API, including `events`, `profiles`, `insight`, `pipeline.updateAsUser()` and `pipeline.executeAction()`. Reading and managing existing data and executing actions require a separate user access JWT:

```typescript
const userClient = new TracklyticServer({
  token: process.env.TRACKLYTIC_TOKEN!,
  project: 'my-project',
  accessToken: userAccessToken,
});
```

Create a client per authenticated request when using a user's access token. Never store different users' tokens in one shared instance. `baseUrl` supports another API host; `request` supports a custom fetch implementation. HTTP failures reject the promise; errors are not silently converted to success.

## Client provider and hook

The browser provider exposes its configured credentials to the browser. Use it only when that exposure is intentional. For private tokens, call your own authenticated server endpoint instead. Do not pass a private API token or user access token from the layout into this provider.

```tsx
// app/providers.tsx
'use client';

import { TracklyticProvider } from 'tracklytic-next';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TracklyticProvider token="intentionally-browser-visible-token" project="my-project">
      {children}
    </TracklyticProvider>
  );
}
```

Wrap `children` in the provider in the App Router layout or Pages Router `_app`. `TracklyticProviderApp` is an alias for the same provider.

```tsx
'use client';

import { useTracklytic } from 'tracklytic-next';

export function UpgradeButton() {
  const { track, identify, setUserId, pipeline, insight } = useTracklytic();

  async function upgrade() {
    setUserId('user-123');
    // Pass explicitly when tracking immediately after setUserId: state updates on the next render.
    await identify({ userId: 'user-123', properties: { plan: 'pro' } });
    await track({ channel: 'billing', event: 'Plan upgraded', userId: 'user-123', logLevel: 'info' });
    await insight.increment({ title: 'Upgrades', value: 1 });
  }

  return <button onClick={upgrade}>Upgrade</button>;
}
```

The hook exposes `track`, `createEvent`, `identify`, `pipeline`, `events`, `profiles`, `insight`, `userId`, `setUserId`, `clearUserId`, `debug` and `setDebug`. The current `userId` is added to events, pipeline creation and identify calls when omitted. An identify call without an explicit or contextual ID rejects before sending. Changing provider configuration recreates the base client.

`SetUserId` is a Client Component that synchronizes an ID supplied by a Server Component with the surrounding provider. The older name `SetUserIdServerComponent` remains as a deprecated alias.

## Data attributes

Mount `<TracklyticDataAttributes />` once inside the provider. Clicks on nested child elements also resolve to the nearest `data-event` element.

```tsx
<button
  data-event="Plan upgraded"
  data-channel="billing"
  data-log-level="info"
  data-tag-plan="pro"
  data-tag-price="29.99"
>
  <span>Upgrade</span>
</button>
```

Supported attributes: `data-event`, `data-channel`, `data-user-id`, `data-description`, `data-log-level`, `data-notify` and `data-tag-*`. `data-icon` has been removed. Omitting `data-notify` preserves the API's notification default; explicit `true` and `false` override it. Tag values parse finite numbers and booleans; other values remain strings.

## Source and mirrors

GitLab remains the source repository. [GitHub](https://github.com/scalerit/tracklytic-next) is a push mirror; make changes through the GitLab repository.

## Verification

A normal install verifies the SDK against the official public release package:

```sh
npm ci
npm test
```

`npm test` builds the SDK and runs its HTTP-contract and React-provider tests. The JavaScript release tarball contains compiled code, so no sibling checkout or local override is needed.

To test unreleased changes from a sibling `tl_js` checkout instead:

```sh
npm run test:local-sdk
```

This optional script builds and packs the sibling SDK into a temporary directory, installs this package from the lockfile, verifies it with that temporary package, and restores the declared public release dependency afterward. It changes neither package manifests nor lockfiles.
