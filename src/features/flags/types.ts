import type { components } from '@/lib/api/schema';

export type Incident = components['schemas']['Incident'];
export type Category = components['schemas']['Category'];

export type FlagType = 'incorrect' | 'abuse' | 'resolved' | 'other';
export type FlagStatus = 'pending' | 'reviewed' | 'dismissed';

export interface IncidentFlagItem {
  id: string;
  incident_id: string;
  type: FlagType;
  reason: string;
  created_at: string;
  flagger_count: number;
  status: FlagStatus;
  notes?: string;
}

export interface FlagGroup {
  incident_id: string;
  incident_title: string;
  incident_description: string;
  incident_thumbnail_url: string | null;
  category: Category;
  review_status: string;
  lifecycle_status: string;
  place_label: string;
  reported_at: string;
  flags_count: number;
  distinct_flaggers_count: number;
  flags: IncidentFlagItem[];
}

export interface FlagsResponse {
  items: FlagGroup[];
  total_count: number;
  awaiting_count: number;
  distinct_incidents_count: number;
}

export interface FlagFilterValues {
  type?: 'all' | FlagType;
  status?: 'all' | FlagStatus;
  category_id?: string;
  q?: string;
}
