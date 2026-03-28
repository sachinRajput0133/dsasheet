'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { setCredentials, clearCredentials } from '@/lib/store/authSlice';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const PUBLIC_PATHS = ['/login', '/signup'];

/**
 * On every page load this component:
 * 1. Checks if we already have an accessToken in Redux (in-memory, still alive)
 * 2. If not, attempts a silent token refresh using the HTTP-only refresh cookie
 * 3. If successful → populates the Redux store so all RTK Query calls include the Bearer header
 * 4. If the refresh fails → clears state (user must log in again)
 */
export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const tokenInStore = useAppSelector((s) => s.auth.accessToken);
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const [ready, setReady] = useState(!!tokenInStore || isPublic);

  useEffect(() => {
    // Skip refresh on public pages — no point trying if user is on login/signup
    if (isPublic) {
      setReady(true);
      return;
    }

    // Already hydrated (e.g., user just logged in in this same session)
    if (tokenInStore) {
      setReady(true);
      return;
    }

    // Try silent refresh using the HTTP-only cookie
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
          method: 'POST',
          credentials: 'include', // sends the HTTP-only refreshToken cookie
        });

        if (res.ok) {
          const json = await res.json();
          const { accessToken } = json.data;

          // Fetch the user profile with the fresh token
          const meRes = await fetch(`${API_URL}/api/v1/auth/me`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            credentials: 'include',
          });

          if (meRes.ok) {
            const meJson = await meRes.json();
            dispatch(setCredentials({ user: meJson.data, accessToken }));
            // Persist for middleware (route guard)
            document.cookie = `accessToken=${accessToken}; path=/; max-age=900; SameSite=Strict`;
          } else {
            dispatch(clearCredentials());
          }
        } else {
          dispatch(clearCredentials());
          // Remove stale cookie so middleware redirects to login
          document.cookie = 'accessToken=; path=/; max-age=0';
        }
      } catch {
        // Network error — don't block render, middleware will redirect if needed
        dispatch(clearCredentials());
      } finally {
        setReady(true);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Show a minimal full-screen spinner until we know the auth state
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600" />
          <p className="text-sm text-gray-500">Loading…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
