import { apiClient } from '@/lib/api/client';
import type { IncidentFilterValues, IncidentListResponse } from '../types';

export interface FetchIncidentsParams extends IncidentFilterValues {
  limit?: number;
}

export async function fetchIncidents(
  params: FetchIncidentsParams = {}
): Promise<IncidentListResponse> {
  const {
    cursor,
    limit = 25,
    q,
    review_status,
    lifecycle_status,
    category_id,
    flagged,
    has_media,
    removed,
    date_preset,
    created_from,
    created_to,
    near_lat,
    near_lng,
    radius_km,
    sort = 'reported_at:desc',
  } = params;

  // Build query object
  const query: Record<string, string | number | boolean | undefined> = {
    limit,
    sort,
  };

  if (cursor) query.cursor = cursor;
  if (q && q.trim()) query.q = q.trim();

  if (review_status && review_status.length > 0) {
    query.review_status = review_status.join(',');
  }

  if (lifecycle_status && lifecycle_status.length > 0) {
    query.lifecycle_status = lifecycle_status.join(',');
  }

  if (category_id && category_id.length > 0) {
    query.category_id = category_id.join(',');
  }

  if (typeof flagged === 'boolean') query.flagged = flagged;
  if (typeof has_media === 'boolean') query.has_media = has_media;
  if (typeof removed === 'boolean') query.removed = removed;

  // Date filtering logic
  const now = Date.now();
  if (date_preset === '24h') {
    query.created_from = new Date(now - 24 * 3600 * 1000).toISOString();
  } else if (date_preset === '7d') {
    query.created_from = new Date(now - 7 * 24 * 3600 * 1000).toISOString();
  } else if (date_preset === '30d') {
    query.created_from = new Date(now - 30 * 24 * 3600 * 1000).toISOString();
  } else if (date_preset === 'today') {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    query.created_from = startOfToday.toISOString();
  } else if (date_preset === 'custom') {
    if (created_from) query.created_from = created_from;
    if (created_to) query.created_to = created_to;
  }

  if (
    typeof near_lat === 'number' &&
    typeof near_lng === 'number' &&
    typeof radius_km === 'number'
  ) {
    query.near = `${near_lat},${near_lng},${radius_km}`;
  }

  const { data, error, response } = await apiClient.GET('/admin/incidents', {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: { query: query as any },
  });

  if (error || !response.ok) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorMsg = (error as any)?.error?.message || 'Failed to fetch incidents list';
    throw new Error(errorMsg);
  }

  return (
    (data as IncidentListResponse) || {
      items: [],
      next_cursor: null,
      prev_cursor: null,
      total_count: 0,
    }
  );
}
