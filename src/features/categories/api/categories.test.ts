import { describe, it, expect, beforeEach } from 'vitest';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  reorderCategories,
  toggleCategoryStatus,
} from './categories';
import { resetMockCategories } from '@/mocks/categories-data';

describe('Categories API Client', () => {
  beforeEach(() => {
    resetMockCategories();
  });

  it('fetches the initial category list sorted by sort_order', async () => {
    const categories = await fetchCategories();
    expect(categories.length).toBeGreaterThanOrEqual(6);
    expect(categories[0]?.slug).toBe('accident');
    expect(categories[1]?.slug).toBe('road_block');
    expect(categories[2]?.slug).toBe('fire');
  });

  it('creates a new category with full custom tunables', async () => {
    const newCategory = await createCategory({
      slug: 'earthquake',
      name: 'Earthquake & Tremors',
      icon_key: 'activity',
      color_hex: '#EF4444',
      is_active: true,
      sort_order: 10,
      urgency: 'high',
      default_ttl_minutes: 360,
      stale_after_minutes: 120,
      resolve_flag_threshold: 3,
      notify_throttle_minutes: 15,
      notify_by_default: true,
      require_manual_review: true,
      safety_note: 'Take cover under sturdy furniture. Stay clear of windows.',
    });

    expect(newCategory).toBeDefined();
    expect(newCategory.id).toContain('earthquake');
    expect(newCategory.name).toBe('Earthquake & Tremors');
    expect(newCategory.urgency).toBe('high');
    expect(newCategory.default_ttl_minutes).toBe(360);

    const list = await fetchCategories();
    expect(list.some((c) => c.slug === 'earthquake')).toBe(true);
  });

  it('fails when creating a category with an already existing slug', async () => {
    await expect(
      createCategory({
        slug: 'fire',
        name: 'Fire Duplicate',
        icon_key: 'flame',
        color_hex: '#FF6B2C',
        urgency: 'high',
        default_ttl_minutes: 120,
        stale_after_minutes: 45,
        resolve_flag_threshold: 2,
        notify_throttle_minutes: 10,
        notify_by_default: true,
        require_manual_review: true,
      })
    ).rejects.toThrow();
  });

  it('updates an existing category while preserving its slug', async () => {
    const updated = await updateCategory('cat_fire', {
      name: 'Severe Fire & Explosion',
      default_ttl_minutes: 150,
      stale_after_minutes: 50,
    });

    expect(updated.name).toBe('Severe Fire & Explosion');
    expect(updated.slug).toBe('fire'); // immutable
    expect(updated.default_ttl_minutes).toBe(150);
  });

  it('deactivates and reactivates a category', async () => {
    const deactivated = await toggleCategoryStatus('cat_accident', false);
    expect(deactivated.is_active).toBe(false);

    const reactivated = await toggleCategoryStatus('cat_accident', true);
    expect(reactivated.is_active).toBe(true);
  });

  it('reorders categories and persists new sort_order', async () => {
    const reordered = await reorderCategories([
      { id: 'cat_fire', sort_order: 1 },
      { id: 'cat_accident', sort_order: 2 },
      { id: 'cat_road_block', sort_order: 3 },
    ]);

    expect(reordered[0]?.slug).toBe('fire');
    expect(reordered[0]?.sort_order).toBe(1);

    const list = await fetchCategories();
    expect(list[0]?.slug).toBe('fire');
  });
});
