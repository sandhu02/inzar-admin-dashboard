import { describe, it, expect } from 'vitest';
import { refreshSingleFlight } from './refresh';
import { server } from '@/mocks/node';
import { http, HttpResponse } from 'msw';

describe('Single-Flight Token Refresh', () => {
  it('deduplicates concurrent refresh requests into exactly one network call', async () => {
    let networkCallCount = 0;

    // Intercept refresh endpoint with a small delay to simulate concurrent inflight requests
    server.use(
      http.post('*/auth/refresh', async () => {
        networkCallCount++;
        // Small artificial delay
        await new Promise((resolve) => setTimeout(resolve, 50));
        return HttpResponse.json({
          access_token: 'new_access_token_123',
          refresh_token: 'rotated_refresh_token_456',
          expires_in: 900,
        });
      })
    );

    const testToken = 'token_to_refresh_concurrently';

    // Fire 5 concurrent calls with the same token
    const results = await Promise.all([
      refreshSingleFlight(testToken),
      refreshSingleFlight(testToken),
      refreshSingleFlight(testToken),
      refreshSingleFlight(testToken),
      refreshSingleFlight(testToken),
    ]);

    // All 5 calls should resolve with identical rotated tokens
    expect(results).toHaveLength(5);
    results.forEach((res) => {
      expect(res.access_token).toBe('new_access_token_123');
      expect(res.refresh_token).toBe('rotated_refresh_token_456');
    });

    // CRITICAL: Exactly ONE network request was made despite 5 concurrent callers!
    expect(networkCallCount).toBe(1);
  });

  it('allows a subsequent refresh after the previous in-flight promise completes', async () => {
    let networkCallCount = 0;

    server.use(
      http.post('*/auth/refresh', async () => {
        networkCallCount++;
        return HttpResponse.json({
          access_token: `token_${networkCallCount}`,
          refresh_token: `refresh_${networkCallCount}`,
          expires_in: 900,
        });
      })
    );

    const first = await refreshSingleFlight('subsequent_token');
    expect(first.access_token).toBe('token_1');
    expect(networkCallCount).toBe(1);

    // Call again after first has resolved
    const second = await refreshSingleFlight('subsequent_token');
    expect(second.access_token).toBe('token_2');
    expect(networkCallCount).toBe(2);
  });
});
