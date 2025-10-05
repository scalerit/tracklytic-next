---
description: Tracklytic client for Next.js applications
---

# Next.js

### Installation <a href="#installation" id="installation"></a>

#### Using npm <a href="#using-npm" id="using-npm"></a>

```bash
npm install tracklytic-next
```

#### Using yarn <a href="#using-yarn" id="using-yarn"></a>

```bash
yarn add tracklytic-next
```

#### Using pnpm <a href="#using-pnpm" id="using-pnpm"></a>

```bash
pnpm add tracklytic-next
```

### Usage <a href="#usage" id="usage"></a>

The usage depends on whether you are using the app directory structure or the pages directory structure.

**App Directory:**

In the app directory, you need to wrap your app with the TracklyticProvider in your root layout component:

```tsx
import { TracklyticProvider } from 'tracklytic-next';

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <TracklyticProvider 
          token='<TOKEN_NAME>' 
          project='<PROJECT_NAME>'
          disableTracking={process.env.NODE_ENV === 'development'}
        >
          {/* Your layout */}
          <main>{children}</main>
        </TracklyticProvider>
      </body>
    </html>
  );
}
```

For setting the user id in server components, use the `SetUserIdServerComponent`:

```tsx
import { SetUserIdServerComponent } from 'tracklytic-next';

export default function Page() {
  const userId: string | null = 'user-123';
  
  return (
    <>
      {/* Your page content */}
      <SetUserIdServerComponent userId={userId} />
    </>
  );
}
```

**Pages Directory:**

In the pages directory, you can wrap your app with the TracklyticProvider, similar to how you would do in a React application:

```tsx
import { TracklyticProvider } from 'tracklytic-next';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <TracklyticProvider 
      token='<TOKEN_NAME>' 
      project='<PROJECT_NAME>'
      disableTracking={process.env.NODE_ENV === 'development'}
    >
      {/* Your app content */}
      <Component {...pageProps} />
    </TracklyticProvider>
  );
}
```

### Hooks <a href="#hooks" id="hooks"></a>

The `useTracklytic` hook can be used across your client components and provides the following methods:

* `track(options: TrackOptions)`: Track custom events.
* `identify(options: IdentifyOptions)`: Identify user traits.
* `setUserId(userId: string | null)`: Set the user id for the current user. If the user is not logged in, pass null.
* `clearUserId()`: Clear the user id for the current user.
* `setDebug(flag: boolean = true)`: Set debug mode for logging.
* `insight.track(options: InsightTrackOptions)`: Track insights.
* `insight.increment(options: InsightIncrementOptions)`: Increment insight values.

**Usage:**

```tsx
"use client";
import { useTracklytic } from 'tracklytic-next';

export function Component() {
  // Get the hooks
  const { setUserId, track, identify, insight } = useTracklytic();

  // Set the user id when user logs in
  setUserId('user-123');

  // Track an event
  track({
    channel: "payments",
    event: "New Subscription",
    user_id: "user-123", // optional when set using setUserId
    icon: "💰",
    notify: true,
    tags: {
      plan: "premium",
      cycle: "monthly",
      trial: false
    }
  });

  // Identify user traits (e.g., name, email, plan, etc.)
  identify({
    user_id: "user-123", // optional when set using setUserId
    properties: {
      name: "John Doe",
      email: "john@doe.com",
      plan: "premium",
    }
  });

  // Track an insight
  insight.track({
    title: "User Count",
    value: "100",
    icon: "👨",
  });

  // Increment an insight value
  insight.increment({
    title: "User Count",
    value: 1,
    icon: "👨",
  });

  // Rest of your component
}
```

These hooks have the same usage as their counterparts in the base Tracklytic package.

### Tracking Events <a href="#tracking-events" id="tracking-events"></a>

You can also track events directly from HTML elements using data attributes. First, include the `TracklyticDataAttributes` component in your app:

```tsx
import { TracklyticDataAttributes } from 'tracklytic-next';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TracklyticProvider token='<TOKEN>' project='<PROJECT>'>
          <TracklyticDataAttributes />
          {children}
        </TracklyticProvider>
      </body>
    </html>
  );
}
```

Then you can use data attributes on any element:

```jsx
<button
  data-event="Upgraded Plan"
  data-user-id="user-123"     // optional (optional when set using setUserId)
  data-channel="billing"      // optional (defaults to "events")
  data-icon=":moneybag:"      // optional
  data-description="User upgraded to Pro plan" // optional
  data-notify="true"          // optional
  data-tag-plan="Pro"         // optional
  data-tag-period="Monthly"   // optional
  data-tag-price="9.99"       // optional
>
  Upgrade to Pro
</button>
```

In this example, when the button is clicked, an event named "Upgraded Plan" will be tracked with the specified tags.

### Server-side Usage with Next.js <a href="#server-side-usage-with-next" id="server-side-usage-with-next"></a>

For server-side usage, you can use Tracklytic from `tracklytic-next/server`. It behaves similarly to the base Tracklytic client.

```typescript
import { TracklyticServer } from 'tracklytic-next/server';

// Initialize TracklyticServer
const tracklytic = new TracklyticServer({
  token: '<TOKEN>',
  project: '<PROJECT_NAME>',
});

// Use it in your server-side code
// Track an event
await tracklytic.track({
  channel: "payments",
  event: "New Subscription",
  user_id: "user-123",
  icon: "💰",
  notify: true,
  tags: {
    plan: "premium",
    cycle: "monthly",
    trial: false
  }
});

// Identify a user
await tracklytic.identify({
  user_id: "user-123",
  properties: {
    name: "John Doe",
    email: "john@doe.com",
    plan: "premium",
  }
});

// Track an insight
await tracklytic.insight.track({
  title: "User Count",
  value: "100",
  icon: "👨",
});

// Increment an insight value
await tracklytic.insight.increment({
  title: "User Count",
  value: 1,
  icon: "👨",
});
```

### API Reference <a href="#api-reference" id="api-reference"></a>

#### TracklyticProvider

The main provider component that wraps your app.

**Props:**
- `token: string` - Your Tracklytic API token
- `project: string` - Your Tracklytic project name
- `disableTracking?: boolean` - Disable tracking (useful for development)
- `children: React.ReactNode` - Your app content

#### useTracklytic

A React hook that provides access to Tracklytic functionality.

**Returns:**
- `track(options: TrackOptions) => Promise<boolean>` - Track an event
- `identify(options: IdentifyOptions) => Promise<boolean>` - Identify a user
- `setUserId(userId: string | null) => void` - Set the current user ID
- `clearUserId() => void` - Clear the current user ID
- `setDebug(flag?: boolean) => void` - Enable/disable debug mode
- `insight.track(options: InsightTrackOptions) => Promise<boolean>` - Track an insight
- `insight.increment(options: InsightIncrementOptions) => Promise<boolean>` - Increment an insight
- `userId: string | null` - Current user ID
- `debug: boolean` - Debug mode status

#### TracklyticServer

Server-side client for use in server components and API routes.

**Methods:**
- `track(options: TrackOptions) => Promise<boolean>` - Track an event
- `identify(options: IdentifyOptions) => Promise<boolean>` - Identify a user
- `insight.track(options: InsightTrackOptions) => Promise<boolean>` - Track an insight
- `insight.increment(options: InsightIncrementOptions) => Promise<boolean>` - Increment an insight

#### Data Attributes

The following data attributes are supported for automatic event tracking:

- `data-event` - Event name (required)
- `data-channel` - Channel name (optional, defaults to "events")
- `data-user-id` - User ID (optional)
- `data-icon` - Event icon (optional)
- `data-description` - Event description (optional)
- `data-notify` - Send notification (optional, "true" or "false")
- `data-tag-*` - Event tags (optional, any number of tags)

### Examples <a href="#examples" id="examples"></a>

#### Basic Setup

```tsx
// app/layout.tsx
import { TracklyticProvider } from 'tracklytic-next';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TracklyticProvider 
          token={process.env.NEXT_PUBLIC_TRACKLYTIC_TOKEN!}
          project={process.env.NEXT_PUBLIC_TRACKLYTIC_PROJECT!}
        >
          {children}
        </TracklyticProvider>
      </body>
    </html>
  );
}
```

#### User Authentication

```tsx
// components/UserProvider.tsx
"use client";
import { useTracklytic } from 'tracklytic-next';
import { useEffect } from 'react';

export function UserProvider({ user }: { user: any }) {
  const { setUserId, identify } = useTracklytic();

  useEffect(() => {
    if (user) {
      setUserId(user.id);
      identify({
        user_id: user.id,
        properties: {
          name: user.name,
          email: user.email,
          plan: user.plan,
        }
      });
    } else {
      setUserId(null);
    }
  }, [user, setUserId, identify]);

  return null;
}
```

#### Event Tracking

```tsx
// components/UpgradeButton.tsx
"use client";
import { useTracklytic } from 'tracklytic-next';

export function UpgradeButton() {
  const { track } = useTracklytic();

  const handleUpgrade = async () => {
    await track({
      channel: "billing",
      event: "Plan Upgraded",
      icon: "🚀",
      notify: true,
      tags: {
        plan: "pro",
        price: "29.99"
      }
    });
  };

  return (
    <button onClick={handleUpgrade}>
      Upgrade to Pro
    </button>
  );
}
```

#### Server-side Tracking

```tsx
// app/api/webhook/route.ts
import { TracklyticServer } from 'tracklytic-next/server';

const tracklytic = new TracklyticServer({
  token: process.env.TRACKLYTIC_TOKEN!,
  project: process.env.TRACKLYTIC_PROJECT!,
});

export async function POST(request: Request) {
  const data = await request.json();
  
  // Track the webhook event
  await tracklytic.track({
    channel: "webhooks",
    event: "Payment Received",
    user_id: data.userId,
    icon: "💳",
    tags: {
      amount: data.amount,
      currency: data.currency
    }
  });

  return Response.json({ success: true });
}
``` 