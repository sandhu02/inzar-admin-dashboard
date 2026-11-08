'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export function IdleTimeoutTracker() {
  const router = useRouter();
  const pathname = usePathname();
  const lastActivityRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    lastActivityRef.current = Date.now();

    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((event) => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    const interval = setInterval(() => {
      const last = lastActivityRef.current ?? Date.now();
      const elapsed = Date.now() - last;
      if (elapsed >= IDLE_TIMEOUT_MS) {
        fetch('/api/auth/logout', { method: 'POST' }).finally(() => {
          const redirectUrl = `/login?error=session_expired&returnUrl=${encodeURIComponent(
            pathname
          )}`;
          router.push(redirectUrl);
          router.refresh();
        });
      }
    }, 60 * 1000);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, updateActivity);
      });
      clearInterval(interval);
    };
  }, [router, pathname]);

  return null;
}
