import { apiClient } from '@/lib/api/client';
import { env } from '@/lib/env';
import type {
  IncidentFilterValues,
  IncidentListResponse,
  IncidentDetail,
  ReporterProfile,
  IncidentActionType,
  BulkActionType,
  BulkActionResponse,
} from '../types';

function getEndpointUrl(endpoint: string) {
  if (typeof window === 'undefined' || process.env.NODE_ENV === 'test') {
    return `${env.API_BASE_URL}${endpoint}`;
  }
  return `/api/proxy${endpoint}`;
}

function getRequestHeaders() {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (process.env.NODE_ENV === 'test') {
    headers['Authorization'] = 'Bearer mock_jwt_access_admin_token';
  }
  return headers;
}

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

export async function fetchIncidentDetail(id: string): Promise<IncidentDetail> {
  const res = await fetch(getEndpointUrl(`/admin/incidents/${encodeURIComponent(id)}`), {
    headers: getRequestHeaders(),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.error?.message || `Failed to fetch incident ${id}`);
  }

  return res.json();
}

export async function revealReporter(
  id: string,
  reason: string
): Promise<ReporterProfile> {
  const res = await fetch(
    getEndpointUrl(`/admin/incidents/${encodeURIComponent(id)}/reveal-reporter`),
    {
      method: 'POST',
      headers: getRequestHeaders(),
      body: JSON.stringify({ reason }),
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.error?.message || 'Failed to reveal reporter identity');
  }

  const data = await res.json();
  return data.reporter || data;
}

export async function revealExactLocation(
  id: string,
  reason: string
): Promise<{ lat: number; lng: number }> {
  const res = await fetch(
    getEndpointUrl(`/admin/incidents/${encodeURIComponent(id)}/reveal-location`),
    {
      method: 'POST',
      headers: getRequestHeaders(),
      body: JSON.stringify({ reason }),
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.error?.message || 'Failed to reveal exact location');
  }

  const data = await res.json();
  return data.exact_location || data;
}

export async function performIncidentAction(
  id: string,
  action: IncidentActionType,
  reason: string,
  notes?: string
): Promise<IncidentDetail> {
  const res = await fetch(
    getEndpointUrl(`/admin/incidents/${encodeURIComponent(id)}/${action}`),
    {
      method: 'POST',
      headers: getRequestHeaders(),
      body: JSON.stringify({ reason, notes }),
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.error?.message || `Failed to perform action "${action}"`);
  }

  return res.json();
}

export async function performBulkIncidentAction(
  ids: string[],
  action: BulkActionType,
  reason: string
): Promise<BulkActionResponse> {
  const res = await fetch(getEndpointUrl('/admin/incidents/bulk'), {
    method: 'POST',
    headers: getRequestHeaders(),
    body: JSON.stringify({ ids, action, reason }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.error?.message || `Failed to perform bulk ${action}`);
  }

  return res.json();
}


