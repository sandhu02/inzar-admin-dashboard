import type { components } from '@/lib/api/schema';

export type Incident = components['schemas']['Incident'];
export type Category = components['schemas']['Category'];
export type ReviewStatus = Incident['review_status'];
export type LifecycleStatus = Incident['lifecycle_status'];

export interface IncidentFilterValues {
  q?: string;
  review_status?: string[];
  lifecycle_status?: string[];
  category_id?: string[];
  flagged?: boolean;
  has_media?: boolean;
  removed?: boolean;
  date_preset?: 'all' | 'today' | '24h' | '7d' | '30d' | 'custom';
  created_from?: string;
  created_to?: string;
  near_lat?: number;
  near_lng?: number;
  radius_km?: number;
  sort?: string;
  cursor?: string;
  view?: string;
}

export interface SavedView {
  id: string;
  name: string;
  isDefault?: boolean;
  isSystem?: boolean;
  filters: Omit<IncidentFilterValues, 'cursor' | 'view'>;
}

export interface IncidentListResponse {
  items: Incident[];
  next_cursor?: string | null;
  prev_cursor?: string | null;
  total_count: number;
}
