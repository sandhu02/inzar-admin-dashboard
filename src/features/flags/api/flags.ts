import { env } from '@/lib/env';
import type { FlagFilterValues, FlagsResponse } from '../types';

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

export async function fetchFlags(filters: FlagFilterValues = {}): Promise<FlagsResponse> {
  const params = new URLSearchParams();
  if (filters.type && filters.type !== 'all') {
    params.set('type', filters.type);
  }
  if (filters.status && filters.status !== 'all') {
    params.set('status', filters.status);
  }
  if (filters.category_id && filters.category_id !== 'all') {
    params.set('category_id', filters.category_id);
  }
  if (filters.q && filters.q.trim()) {
    params.set('q', filters.q.trim());
  }

  const qs = params.toString();
  const url = getEndpointUrl(`/admin/flags${qs ? `?${qs}` : ''}`);

  const res = await fetch(url, {
    method: 'GET',
    headers: getRequestHeaders(),
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(
      errorJson?.error?.message || `Failed to fetch community flags (${res.status})`
    );
  }

  return res.json();
}

export async function dismissFlag(
  flagId: string,
  notes?: string
): Promise<{ id: string; status: string }> {
  const url = getEndpointUrl(`/admin/flags/${flagId}`);
  const res = await fetch(url, {
    method: 'PATCH',
    headers: getRequestHeaders(),
    body: JSON.stringify({ status: 'dismissed', notes }),
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(
      errorJson?.error?.message || `Failed to dismiss flag (${res.status})`
    );
  }

  return res.json();
}

export async function moveIncidentToReview(
  incidentId: string,
  reason: string = 'Moved to review queue following community dispute'
) {
  const url = getEndpointUrl(`/admin/incidents/${incidentId}/rereview`);
  const res = await fetch(url, {
    method: 'POST',
    headers: getRequestHeaders(),
    body: JSON.stringify({ reason }),
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(
      errorJson?.error?.message || `Failed to move incident to review (${res.status})`
    );
  }

  return res.json();
}

export async function markIncidentFalse(
  incidentId: string,
  reason: string,
  notes?: string
) {
  const url = getEndpointUrl(`/admin/incidents/${incidentId}/mark-false`);
  const res = await fetch(url, {
    method: 'POST',
    headers: getRequestHeaders(),
    body: JSON.stringify({ reason, notes }),
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(
      errorJson?.error?.message || `Failed to mark false report (${res.status})`
    );
  }

  return res.json();
}
