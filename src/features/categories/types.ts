export type CategoryUrgency = 'routine' | 'high';

export interface Category {
  id: string;
  slug: string;
  name: string;
  icon_key: string;
  color_hex: string;
  is_active: boolean;
  sort_order: number;
  urgency: CategoryUrgency;
  default_ttl_minutes: number;
  stale_after_minutes: number;
  resolve_flag_threshold: number;
  notify_throttle_minutes: number;
  notify_by_default: boolean;
  require_manual_review: boolean;
  safety_note?: string;
  incidents_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCategoryInput {
  slug: string;
  name: string;
  icon_key: string;
  color_hex: string;
  is_active?: boolean;
  sort_order?: number;
  urgency: CategoryUrgency;
  default_ttl_minutes: number;
  stale_after_minutes: number;
  resolve_flag_threshold: number;
  notify_throttle_minutes: number;
  notify_by_default: boolean;
  require_manual_review: boolean;
  safety_note?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  icon_key?: string;
  color_hex?: string;
  is_active?: boolean;
  sort_order?: number;
  urgency?: CategoryUrgency;
  default_ttl_minutes?: number;
  stale_after_minutes?: number;
  resolve_flag_threshold?: number;
  notify_throttle_minutes?: number;
  notify_by_default?: boolean;
  require_manual_review?: boolean;
  safety_note?: string;
}

export interface ReorderCategoryItem {
  id: string;
  sort_order: number;
}
