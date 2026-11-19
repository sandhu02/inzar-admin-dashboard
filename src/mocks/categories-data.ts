import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
  ReorderCategoryItem,
} from '@/features/categories/types';

export const INITIAL_MOCK_CATEGORIES: Category[] = [
  {
    id: 'cat_accident',
    slug: 'accident',
    name: 'Accident',
    color_hex: '#FFC14D',
    icon_key: 'alert-triangle',
    is_active: true,
    sort_order: 1,
    urgency: 'high',
    default_ttl_minutes: 180,
    stale_after_minutes: 60,
    resolve_flag_threshold: 3,
    notify_throttle_minutes: 15,
    notify_by_default: true,
    require_manual_review: false,
    safety_note: 'Dispatch emergency services immediately if vehicle rollover or injuries reported.',
    incidents_count: 71,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-10-15T08:30:00Z',
  },
  {
    id: 'cat_road_block',
    slug: 'road_block',
    name: 'Road Block',
    color_hex: '#E2DDD5',
    icon_key: 'shield-alert',
    is_active: true,
    sort_order: 2,
    urgency: 'routine',
    default_ttl_minutes: 240,
    stale_after_minutes: 120,
    resolve_flag_threshold: 4,
    notify_throttle_minutes: 30,
    notify_by_default: true,
    require_manual_review: false,
    safety_note: 'Verify alternative detour routes before publishing traffic warnings.',
    incidents_count: 46,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-10-12T14:20:00Z',
  },
  {
    id: 'cat_fire',
    slug: 'fire',
    name: 'Fire',
    color_hex: '#FF6B2C',
    icon_key: 'flame',
    is_active: true,
    sort_order: 3,
    urgency: 'high',
    default_ttl_minutes: 120,
    stale_after_minutes: 45,
    resolve_flag_threshold: 2,
    notify_throttle_minutes: 10,
    notify_by_default: true,
    require_manual_review: true,
    safety_note: 'Critical hazard. Do not approach active fires. Alert Margalla Fire Rescue.',
    incidents_count: 38,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-11-01T11:00:00Z',
  },
  {
    id: 'cat_flooding',
    slug: 'flooding',
    name: 'Flooding',
    color_hex: '#7CC4FF',
    icon_key: 'droplets',
    is_active: true,
    sort_order: 4,
    urgency: 'routine',
    default_ttl_minutes: 360,
    stale_after_minutes: 180,
    resolve_flag_threshold: 3,
    notify_throttle_minutes: 30,
    notify_by_default: true,
    require_manual_review: false,
    safety_note: 'Monitor water drainage channels and low-lying underpasses.',
    incidents_count: 19,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-09-20T09:45:00Z',
  },
  {
    id: 'cat_gathering',
    slug: 'gathering',
    name: 'Gathering',
    color_hex: '#A8A094',
    icon_key: 'users',
    is_active: true,
    sort_order: 5,
    urgency: 'routine',
    default_ttl_minutes: 180,
    stale_after_minutes: 90,
    resolve_flag_threshold: 4,
    notify_throttle_minutes: 20,
    notify_by_default: false,
    require_manual_review: false,
    safety_note: 'Observe public demonstration guidelines without escalating tensions.',
    incidents_count: 24,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-10-05T16:15:00Z',
  },
  {
    id: 'cat_other',
    slug: 'other',
    name: 'Other',
    color_hex: '#706B63',
    icon_key: 'help-circle',
    is_active: true,
    sort_order: 6,
    urgency: 'routine',
    default_ttl_minutes: 1440,
    stale_after_minutes: 720,
    resolve_flag_threshold: 5,
    notify_throttle_minutes: 60,
    notify_by_default: false,
    require_manual_review: true,
    safety_note: 'Requires moderator classification if uncategorized hazard.',
    incidents_count: 14,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-08-14T10:10:00Z',
  },
];

let mockCategoriesStore: Category[] = JSON.parse(
  JSON.stringify(INITIAL_MOCK_CATEGORIES)
);

export function getMockCategories(): Category[] {
  return [...mockCategoriesStore].sort((a, b) => a.sort_order - b.sort_order);
}

export function getMockCategory(idOrSlug: string): Category | null {
  return (
    mockCategoriesStore.find(
      (c) => c.id === idOrSlug || c.slug === idOrSlug
    ) || null
  );
}

export function createMockCategory(
  input: CreateCategoryInput
): { category?: Category; error?: { code: string; message: string } } {
  const existing = mockCategoriesStore.find((c) => c.slug === input.slug);
  if (existing) {
    return {
      error: {
        code: 'SLUG_CONFLICT',
        message: `Category with slug "${input.slug}" already exists.`,
      },
    };
  }

  const maxOrder = mockCategoriesStore.reduce(
    (max, c) => Math.max(max, c.sort_order),
    0
  );

  const newCategory: Category = {
    id: `cat_${input.slug.toLowerCase().replace(/[^a-z0-9_]/g, '_')}`,
    slug: input.slug,
    name: input.name,
    icon_key: input.icon_key,
    color_hex: input.color_hex,
    is_active: input.is_active ?? true,
    sort_order: input.sort_order ?? maxOrder + 1,
    urgency: input.urgency,
    default_ttl_minutes: input.default_ttl_minutes,
    stale_after_minutes: input.stale_after_minutes,
    resolve_flag_threshold: input.resolve_flag_threshold,
    notify_throttle_minutes: input.notify_throttle_minutes,
    notify_by_default: input.notify_by_default,
    require_manual_review: input.require_manual_review,
    safety_note: input.safety_note,
    incidents_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  mockCategoriesStore.push(newCategory);
  return { category: newCategory };
}

export function updateMockCategory(
  id: string,
  input: UpdateCategoryInput
): { category?: Category; error?: { code: string; message: string } } {
  const index = mockCategoriesStore.findIndex((c) => c.id === id);
  if (index === -1) {
    return {
      error: {
        code: 'NOT_FOUND',
        message: `Category with ID "${id}" was not found.`,
      },
    };
  }

  const current = mockCategoriesStore[index]!;
  const updated: Category = {
    ...current,
    name: input.name ?? current.name,
    icon_key: input.icon_key ?? current.icon_key,
    color_hex: input.color_hex ?? current.color_hex,
    is_active: input.is_active !== undefined ? input.is_active : current.is_active,
    sort_order: input.sort_order !== undefined ? input.sort_order : current.sort_order,
    urgency: input.urgency ?? current.urgency,
    default_ttl_minutes:
      input.default_ttl_minutes !== undefined
        ? input.default_ttl_minutes
        : current.default_ttl_minutes,
    stale_after_minutes:
      input.stale_after_minutes !== undefined
        ? input.stale_after_minutes
        : current.stale_after_minutes,
    resolve_flag_threshold:
      input.resolve_flag_threshold !== undefined
        ? input.resolve_flag_threshold
        : current.resolve_flag_threshold,
    notify_throttle_minutes:
      input.notify_throttle_minutes !== undefined
        ? input.notify_throttle_minutes
        : current.notify_throttle_minutes,
    notify_by_default:
      input.notify_by_default !== undefined
        ? input.notify_by_default
        : current.notify_by_default,
    require_manual_review:
      input.require_manual_review !== undefined
        ? input.require_manual_review
        : current.require_manual_review,
    safety_note:
      input.safety_note !== undefined ? input.safety_note : current.safety_note,
    updated_at: new Date().toISOString(),
  };

  mockCategoriesStore[index] = updated;
  return { category: updated };
}

export function reorderMockCategories(
  items: ReorderCategoryItem[]
): Category[] {
  const orderMap = new Map<string, number>();
  items.forEach((item) => orderMap.set(item.id, item.sort_order));

  mockCategoriesStore = mockCategoriesStore.map((cat) => {
    if (orderMap.has(cat.id)) {
      return { ...cat, sort_order: orderMap.get(cat.id)! };
    }
    return cat;
  });

  return getMockCategories();
}

export function resetMockCategories(): void {
  mockCategoriesStore = JSON.parse(JSON.stringify(INITIAL_MOCK_CATEGORIES));
}
