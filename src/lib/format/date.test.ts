import { describe, it, expect } from 'vitest';
import { formatReportedTime, formatAge, formatUtcTooltip } from './date';

describe('Date formatting utilities', () => {
  it('formats UTC tooltip correctly', () => {
    const iso = '2026-11-08T14:23:00.000Z';
    expect(formatUtcTooltip(iso)).toBe('2026-11-08 14:23:00 UTC');
  });

  it('formats age concisely', () => {
    const now = Date.now();
    const twoMinAgo = new Date(now - 2 * 60 * 1000).toISOString();
    const fiveHoursAgo = new Date(now - 5 * 3600 * 1000).toISOString();
    const threeDaysAgo = new Date(now - 3 * 24 * 3600 * 1000).toISOString();

    expect(formatAge(twoMinAgo)).toBe('2 min');
    expect(formatAge(fiveHoursAgo)).toBe('5 h');
    expect(formatAge(threeDaysAgo)).toBe('3 d');
  });

  it('handles invalid dates gracefully', () => {
    expect(formatReportedTime('invalid-date')).toBe('-');
    expect(formatAge('invalid-date')).toBe('-');
    expect(formatUtcTooltip('invalid-date')).toBe('');
  });
});
