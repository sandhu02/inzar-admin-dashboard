import { describe, it, expect } from 'vitest';
import {
  categorySchema,
  categoryUpdateSchema,
  hexColorRegex,
  slugRegex,
} from './schemas';

describe('Category Schema Validation', () => {
  const validCategory = {
    slug: 'landslide',
    name: 'Landslide',
    icon_key: 'mountain',
    color_hex: '#FF6B2C',
    is_active: true,
    sort_order: 7,
    urgency: 'high' as const,
    default_ttl_minutes: 180,
    stale_after_minutes: 60,
    resolve_flag_threshold: 3,
    notify_throttle_minutes: 15,
    notify_by_default: true,
    require_manual_review: false,
    safety_note: 'Watch for falling rocks and road instability.',
  };

  describe('Overall Category Schema', () => {
    it('accepts a fully valid category', () => {
      const result = categorySchema.safeParse(validCategory);
      expect(result.success).toBe(true);
    });

    it('accepts valid category without optional safety note', () => {
      const copy = { ...validCategory };
      delete (copy as { safety_note?: string }).safety_note;
      const result = categorySchema.safeParse(copy);
      expect(result.success).toBe(true);
    });
  });

  describe('Hex Color Validation', () => {
    it('passes valid 6-character hex colors', () => {
      expect(hexColorRegex.test('#FF6B2C')).toBe(true);
      expect(hexColorRegex.test('#ffffff')).toBe(true);
      expect(hexColorRegex.test('#000000')).toBe(true);
      expect(hexColorRegex.test('#1A2B3C')).toBe(true);
    });

    it('passes valid 3-character hex colors', () => {
      expect(hexColorRegex.test('#fff')).toBe(true);
      expect(hexColorRegex.test('#000')).toBe(true);
      expect(hexColorRegex.test('#F60')).toBe(true);
    });

    it('fails invalid hex color strings', () => {
      expect(hexColorRegex.test('FF6B2C')).toBe(false); // missing #
      expect(hexColorRegex.test('#GGG')).toBe(false); // non-hex
      expect(hexColorRegex.test('#12')).toBe(false); // 2 chars
      expect(hexColorRegex.test('#12345')).toBe(false); // 5 chars
      expect(hexColorRegex.test('#1234567')).toBe(false); // 7 chars
      expect(hexColorRegex.test('rgb(255, 0, 0)')).toBe(false);

      const invalidResult = categorySchema.safeParse({
        ...validCategory,
        color_hex: 'invalid-color',
      });
      expect(invalidResult.success).toBe(false);
      if (!invalidResult.success) {
        expect(invalidResult.error.issues[0]?.path).toContain('color_hex');
      }
    });
  });

  describe('Slug Validation', () => {
    it('passes valid lowercase alphanumeric slugs with hyphens and underscores', () => {
      expect(slugRegex.test('accident')).toBe(true);
      expect(slugRegex.test('road_block')).toBe(true);
      expect(slugRegex.test('traffic-delay-2026')).toBe(true);
      expect(slugRegex.test('fire_hazard_1')).toBe(true);
    });

    it('fails invalid slugs with spaces, uppercase, or special characters', () => {
      expect(slugRegex.test('Road Block')).toBe(false); // space
      expect(slugRegex.test('Accident')).toBe(false); // uppercase
      expect(slugRegex.test('fire@danger')).toBe(false); // special char
      expect(slugRegex.test('flood#1')).toBe(false); // hash

      const invalidSlugResult = categorySchema.safeParse({
        ...validCategory,
        slug: 'Invalid Slug!',
      });
      expect(invalidSlugResult.success).toBe(false);
      if (!invalidSlugResult.success) {
        expect(invalidSlugResult.error.issues[0]?.path).toContain('slug');
      }
    });

    it('fails slugs shorter than 2 characters', () => {
      const invalidShortSlug = categorySchema.safeParse({
        ...validCategory,
        slug: 'a',
      });
      expect(invalidShortSlug.success).toBe(false);
    });
  });

  describe('TTL and Stale Refinement Rule', () => {
    it('passes when stale_after_minutes is strictly less than default_ttl_minutes', () => {
      const result = categorySchema.safeParse({
        ...validCategory,
        default_ttl_minutes: 120,
        stale_after_minutes: 60,
      });
      expect(result.success).toBe(true);
    });

    it('fails when stale_after_minutes equals default_ttl_minutes', () => {
      const result = categorySchema.safeParse({
        ...validCategory,
        default_ttl_minutes: 120,
        stale_after_minutes: 120,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          'Stale after minutes must be less than default TTL'
        );
        expect(result.error.issues[0]?.path).toContain('stale_after_minutes');
      }
    });

    it('fails when stale_after_minutes is greater than default_ttl_minutes', () => {
      const result = categorySchema.safeParse({
        ...validCategory,
        default_ttl_minutes: 120,
        stale_after_minutes: 180,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          'Stale after minutes must be less than default TTL'
        );
      }
    });
  });

  describe('Positive Number Validations', () => {
    it('fails when default_ttl_minutes is zero or negative', () => {
      const zeroTtl = categorySchema.safeParse({
        ...validCategory,
        default_ttl_minutes: 0,
      });
      expect(zeroTtl.success).toBe(false);

      const negativeTtl = categorySchema.safeParse({
        ...validCategory,
        default_ttl_minutes: -10,
      });
      expect(negativeTtl.success).toBe(false);
    });

    it('fails when stale_after_minutes is zero or negative', () => {
      const zeroStale = categorySchema.safeParse({
        ...validCategory,
        stale_after_minutes: 0,
      });
      expect(zeroStale.success).toBe(false);

      const negativeStale = categorySchema.safeParse({
        ...validCategory,
        stale_after_minutes: -5,
      });
      expect(negativeStale.success).toBe(false);
    });

    it('fails when resolve_flag_threshold is zero or negative', () => {
      const zeroThreshold = categorySchema.safeParse({
        ...validCategory,
        resolve_flag_threshold: 0,
      });
      expect(zeroThreshold.success).toBe(false);

      const negativeThreshold = categorySchema.safeParse({
        ...validCategory,
        resolve_flag_threshold: -1,
      });
      expect(negativeThreshold.success).toBe(false);
    });

    it('passes when notify_throttle_minutes is 0 or positive, fails if negative', () => {
      const zeroThrottle = categorySchema.safeParse({
        ...validCategory,
        notify_throttle_minutes: 0,
      });
      expect(zeroThrottle.success).toBe(true);

      const negativeThrottle = categorySchema.safeParse({
        ...validCategory,
        notify_throttle_minutes: -1,
      });
      expect(negativeThrottle.success).toBe(false);
    });
  });

  describe('Category Update Schema (Immutable Slug)', () => {
    it('validates category update data without requiring slug', () => {
      const updateData = {
        name: 'Rockfall & Landslide',
        icon_key: 'mountain',
        color_hex: '#FF6B2C',
        is_active: true,
        sort_order: 8,
        urgency: 'high' as const,
        default_ttl_minutes: 240,
        stale_after_minutes: 120,
        resolve_flag_threshold: 4,
        notify_throttle_minutes: 20,
        notify_by_default: true,
        require_manual_review: true,
      };

      const result = categoryUpdateSchema.safeParse(updateData);
      expect(result.success).toBe(true);
    });

    it('enforces stale_after_minutes < default_ttl_minutes on updates', () => {
      const invalidUpdate = {
        name: 'Landslide',
        icon_key: 'mountain',
        color_hex: '#FF6B2C',
        is_active: true,
        sort_order: 8,
        urgency: 'high' as const,
        default_ttl_minutes: 100,
        stale_after_minutes: 100,
        resolve_flag_threshold: 4,
        notify_throttle_minutes: 20,
        notify_by_default: true,
        require_manual_review: true,
      };

      const result = categoryUpdateSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });
  });
});
