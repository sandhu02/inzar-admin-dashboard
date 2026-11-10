import type { components } from '@/lib/api/schema';

export type Incident = components['schemas']['Incident'];
export type Category = components['schemas']['Category'];
export type ReviewStatus = Incident['review_status'];
export type LifecycleStatus = Incident['lifecycle_status'];

export type IncidentActionType =
  | 'approve'
  | 'reject'
  | 'mark_false'
  | 'remove'
  | 'restore'
  | 'resolve'
  | 're_review';

export type BulkActionType = 'approve' | 'reject' | 'mark_false' | 'remove';

export interface BulkActionFailure {
  id: string;
  error: {
    code: string;
    message: string;
  };
}

export interface BulkActionResponse {
  succeeded: string[];
  failed: BulkActionFailure[];
}

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

export interface TimelineEvent {
  id: string;
  type: 'submitted' | 'ai_reviewed' | 'flagged' | 'decision' | 'resolved' | 'updated';
  title: string;
  description?: string;
  timestamp: string;
  actor?: string;
  notes?: string;
}

export interface IncidentFlag {
  id: string;
  type: 'incorrect' | 'abuse' | 'resolved' | 'other';
  reason: string;
  created_at: string;
  flagger_count?: number;
  status: 'pending' | 'reviewed' | 'dismissed';
}

export interface ReporterProfile {
  id: string;
  display_name: string;
  email: string;
  trust_score: number;
  account_created_at: string;
  incidents_count: number;
  flags_received_count: number;
}

export interface IncidentDetail extends Incident {
  media_urls?: string[];
  exact_location?: {
    lat: number;
    lng: number;
  } | null;
  reporter?: ReporterProfile | null;
  timeline?: TimelineEvent[];
  flags?: IncidentFlag[];
  published_at?: string | null;
  expires_at?: string | null;
  resolved_at?: string | null;
  last_confirmed_at?: string | null;
  verification_label?: string;
  review_reason?: string | null;
}
