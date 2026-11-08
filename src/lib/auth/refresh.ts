import { env } from '@/lib/env';

export interface RefreshResult {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

// In-flight refresh promises map to guarantee single-flight rotation per refresh token
const inFlightRefreshes = new Map<string, Promise<RefreshResult>>();

/**
 * Executes a single-flight token refresh against the backend /auth/refresh endpoint.
 * Concurrent requests sharing the same refresh_token will await the identical promise.
 */
export async function refreshSingleFlight(refreshToken: string): Promise<RefreshResult> {
  const existing = inFlightRefreshes.get(refreshToken);
  if (existing) {
    return existing;
  }

  const refreshPromise = (async () => {
    try {
      const url = `${env.API_BASE_URL}/auth/refresh`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData?.error?.message || `Token refresh failed with status ${res.status}`
        );
      }

      const data = (await res.json()) as RefreshResult;
      return data;
    } finally {
      // Clean up in-flight cache once finished
      inFlightRefreshes.delete(refreshToken);
    }
  })();

  inFlightRefreshes.set(refreshToken, refreshPromise);
  return refreshPromise;
}

export function getActiveInFlightCount(): number {
  return inFlightRefreshes.size;
}
