import { describe, it, expect, beforeEach } from 'vitest';
import { fetchSettings, updateSettings } from './settings';
import { resetMockSettings } from '@/mocks/settings-data';

describe('Global Settings API Client', () => {
  beforeEach(() => {
    resetMockSettings();
  });

  it('fetches current platform settings configuration', async () => {
    const settings = await fetchSettings();
    expect(settings).toBeDefined();
    expect(settings.max_search_radius_km).toBe(50);
    expect(settings.fuzz_distance_m).toBe(250);
    expect(settings.review_mode).toBe('manual');
    expect(settings.allowed_radius_options_km).toEqual([1, 5, 10, 25, 50]);
  });

  it('updates settings and persists new configuration with actor metadata', async () => {
    const updated = await updateSettings({
      review_mode: 'auto_approve',
      fuzz_distance_m: 300,
      max_reports_per_user_per_hour: 10,
    });

    expect(updated.review_mode).toBe('auto_approve');
    expect(updated.fuzz_distance_m).toBe(300);
    expect(updated.max_reports_per_user_per_hour).toBe(10);
    expect(updated.updated_by).toBeDefined();

    const fetched = await fetchSettings();
    expect(fetched.review_mode).toBe('auto_approve');
    expect(fetched.fuzz_distance_m).toBe(300);
  });
});
