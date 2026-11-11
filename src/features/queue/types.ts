import type { components } from '@/lib/api/schema';
import type { IncidentFlag } from '../incidents/types';

export type Incident = components['schemas']['Incident'];
export type Category = components['schemas']['Category'];

export interface QueueItem extends Incident {
  media_urls?: string[];
  verification_label?: string;
  flags?: IncidentFlag[];
}

export interface QueueStats {
  queue_size: number;
  oldest_item_age_minutes: number;
  oldest_reported_at: string | null;
}

export interface QueueResponse {
  items: QueueItem[];
  queue_size: number;
  oldest_item_age_minutes: number;
  oldest_reported_at: string | null;
}

export interface QueueFilters {
  category_id?: string;
}

export type QueueActionType = 'approve' | 'reject' | 'mark_false';
