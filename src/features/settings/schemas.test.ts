import { describe, it, expect } from 'vitest';
import { settingsSchema, DEFAULT_SETTINGS } from './schemas';

describe('Global Settings Schema Validation', () => {
  it('accepts the canonical DEFAULT_SETTINGS configuration', () => {
    const result = settingsSchema.safeParse(DEFAULT_SETTINGS);
    expect(result.success).toBe(true);
  });

  describe('Numeric Limits & Bounds', () => {
    it('fails when max_search_radius_km is zero or negative', () => {
      expect(
        settingsSchema.safeParse({ ...DEFAULT_SETTINGS, max_search_radius_km: 0 })
          .success
      ).toBe(false);
      expect(
        settingsSchema.safeParse({ ...DEFAULT_SETTINGS, max_search_radius_km: -10 })
          .success
      ).toBe(false);
    });

    it('fails when fuzz_distance_m is zero or negative', () => {
      expect(
        settingsSchema.safeParse({ ...DEFAULT_SETTINGS, fuzz_distance_m: 0 })
          .success
      ).toBe(false);
      expect(
        settingsSchema.safeParse({ ...DEFAULT_SETTINGS, fuzz_distance_m: -50 })
          .success
      ).toBe(false);
    });

    it('fails when max_reports_per_user_per_hour is zero or negative', () => {
      expect(
        settingsSchema.safeParse({
          ...DEFAULT_SETTINGS,
          max_reports_per_user_per_hour: 0,
        }).success
      ).toBe(false);
      expect(
        settingsSchema.safeParse({
          ...DEFAULT_SETTINGS,
          max_reports_per_user_per_hour: -1,
        }).success
      ).toBe(false);
    });

    it('fails when max_description_length is zero or negative', () => {
      expect(
        settingsSchema.safeParse({
          ...DEFAULT_SETTINGS,
          max_description_length: 0,
        }).success
      ).toBe(false);
    });

    it('fails when abuse_flag_hide_threshold is zero or negative', () => {
      expect(
        settingsSchema.safeParse({
          ...DEFAULT_SETTINGS,
          abuse_flag_hide_threshold: 0,
        }).success
      ).toBe(false);
    });

    it('fails when alert_digest_threshold is zero or negative', () => {
      expect(
        settingsSchema.safeParse({
          ...DEFAULT_SETTINGS,
          alert_digest_threshold: 0,
        }).success
      ).toBe(false);
    });

    it('fails when alert_digest_window_minutes is zero or negative', () => {
      expect(
        settingsSchema.safeParse({
          ...DEFAULT_SETTINGS,
          alert_digest_window_minutes: 0,
        }).success
      ).toBe(false);
    });

    it('allows min_account_age_minutes_to_report to be 0 or positive, fails if negative', () => {
      expect(
        settingsSchema.safeParse({
          ...DEFAULT_SETTINGS,
          min_account_age_minutes_to_report: 0,
        }).success
      ).toBe(true);
      expect(
        settingsSchema.safeParse({
          ...DEFAULT_SETTINGS,
          min_account_age_minutes_to_report: 30,
        }).success
      ).toBe(true);
      expect(
        settingsSchema.safeParse({
          ...DEFAULT_SETTINGS,
          min_account_age_minutes_to_report: -1,
        }).success
      ).toBe(false);
    });
  });

  describe('Allowed Radius Options Validation', () => {
    it('passes valid array of positive radius integers', () => {
      expect(
        settingsSchema.safeParse({
          ...DEFAULT_SETTINGS,
          allowed_radius_options_km: [1, 5, 10, 25, 50, 100],
        }).success
      ).toBe(true);
    });

    it('fails when allowed_radius_options_km is empty', () => {
      const result = settingsSchema.safeParse({
        ...DEFAULT_SETTINGS,
        allowed_radius_options_km: [],
      });
      expect(result.success).toBe(false);
    });

    it('fails when allowed_radius_options_km contains zero or negative numbers', () => {
      expect(
        settingsSchema.safeParse({
          ...DEFAULT_SETTINGS,
          allowed_radius_options_km: [5, 0, 10],
        }).success
      ).toBe(false);
      expect(
        settingsSchema.safeParse({
          ...DEFAULT_SETTINGS,
          allowed_radius_options_km: [5, -1, 10],
        }).success
      ).toBe(false);
    });
  });

  describe('Review Mode Enum Validation', () => {
    it('passes valid review_mode options', () => {
      expect(
        settingsSchema.safeParse({ ...DEFAULT_SETTINGS, review_mode: 'manual' })
          .success
      ).toBe(true);
      expect(
        settingsSchema.safeParse({
          ...DEFAULT_SETTINGS,
          review_mode: 'auto_approve',
        }).success
      ).toBe(true);
    });

    it('fails invalid review_mode values', () => {
      expect(
        settingsSchema.safeParse({
          ...DEFAULT_SETTINGS,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          review_mode: 'unsupervised' as any,
        }).success
      ).toBe(false);
    });
  });
});
