// Example usage of tracklytic-next

// 1. App Directory Setup (app/layout.tsx)
import { TracklyticProvider, TracklyticDataAttributes } from 'tracklytic-next';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TracklyticProvider 
          token={process.env.NEXT_PUBLIC_TRACKLYTIC_TOKEN!}
          project={process.env.NEXT_PUBLIC_TRACKLYTIC_PROJECT!}
          disableTracking={process.env.NODE_ENV === 'development'}
        >
          <TracklyticDataAttributes />
          {children}
        </TracklyticProvider>
      </body>
    </html>
  );
}

// 2. Client Component with Hook Usage
"use client";
import { useTracklytic } from 'tracklytic-next';

export function UserDashboard() {
  const { track, identify, setUserId, insight } = useTracklytic();

  const handleUserLogin = (user: any) => {
    setUserId(user.id);
    identify({
      user_id: user.id,
      properties: {
        name: user.name,
        email: user.email,
        plan: user.plan,
      }
    });
  };

  const handlePurchase = async () => {
    await track({
      channel: "ecommerce",
      event: "Purchase Completed",
      icon: "🛒",
      notify: true,
      tags: {
        product: "premium_plan",
        price: "29.99",
        currency: "USD"
      }
    });
  };

  const updateUserCount = async () => {
    await insight.increment({
      title: "Active Users",
      value: 1,
      icon: "👥"
    });
  };

  return (
    <div>
      <button onClick={handlePurchase}>Buy Premium Plan</button>
      <button onClick={updateUserCount}>Update User Count</button>
    </div>
  );
}

// 3. Data Attribute Tracking
export function UpgradeButton() {
  return (
    <button
      data-event="Plan Upgraded"
      data-channel="billing"
      data-icon="🚀"
      data-description="User upgraded to Pro plan"
      data-notify="true"
      data-tag-plan="Pro"
      data-tag-price="29.99"
      data-tag-period="Monthly"
    >
      Upgrade to Pro
    </button>
  );
}

// 4. Server Component for Setting User ID
import { SetUserIdServerComponent } from 'tracklytic-next';

export function UserProfile({ user }: { user: any }) {
  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <SetUserIdServerComponent userId={user.id} />
    </div>
  );
}

// 5. Server-side Usage (app/api/webhook/route.ts)
import { TracklyticServer } from 'tracklytic-next/server';

const tracklytic = new TracklyticServer({
  token: process.env.TRACKLYTIC_TOKEN!,
  project: process.env.TRACKLYTIC_PROJECT!,
});

export async function POST(request: Request) {
  const data = await request.json();
  
  await tracklytic.track({
    channel: "webhooks",
    event: "Payment Received",
    user_id: data.userId,
    icon: "💳",
    tags: {
      amount: data.amount,
      currency: data.currency,
      provider: data.provider
    }
  });

  return Response.json({ success: true });
}

// 6. Pages Directory Setup (_app.tsx)
import { TracklyticProvider } from 'tracklytic-next';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <TracklyticProvider 
      token={process.env.NEXT_PUBLIC_TRACKLYTIC_TOKEN!}
      project={process.env.NEXT_PUBLIC_TRACKLYTIC_PROJECT!}
    >
      <Component {...pageProps} />
    </TracklyticProvider>
  );
} 