import { env } from '@/lib/env';
import type { QueueFilters, QueueResponse, QueueItem } from '../types';

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

export async function fetchQueue(filters: QueueFilters = {}): Promise<QueueResponse> {
  const params = new URLSearchParams();
  if (filters.category_id && filters.category_id !== 'all') {
    params.set('category_id', filters.category_id);
  }

  const qs = params.toString();
  const url = getEndpointUrl(`/admin/moderation/queue${qs ? `?${qs}` : ''}`);

  const res = await fetch(url, {
    method: 'GET',
    headers: getRequestHeaders(),
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(
      errorJson?.error?.message || `Failed to fetch moderation queue (${res.status})`
    );
  }

  return res.json();
}

export async function approveQueueItem(
  id: string,
  notes?: string
): Promise<QueueItem> {
  const url = getEndpointUrl(`/admin/moderation/${id}/approve`);
  const res = await fetch(url, {
    method: 'POST',
    headers: getRequestHeaders(),
    body: JSON.stringify({ notes }),
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(
      errorJson?.error?.message || `Failed to approve incident (${res.status})`
    );
  }

  return res.json();
}

export async function rejectQueueItem(
  id: string,
  reason: string,
  notes?: string
): Promise<QueueItem> {
  const url = getEndpointUrl(`/admin/moderation/${id}/reject`);
  const res = await fetch(url, {
    method: 'POST',
    headers: getRequestHeaders(),
    body: JSON.stringify({ reason, notes }),
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(
      errorJson?.error?.message || `Failed to reject incident (${res.status})`
    );
  }

  return res.json();
}

export async function markFalseQueueItem(
  id: string,
  reason: string,
  notes?: string
): Promise<QueueItem> {
  const url = getEndpointUrl(`/admin/incidents/${id}/mark-false`);
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

export async function revertApproveQueueItem(id: string): Promise<QueueItem> {
  const url = getEndpointUrl(`/admin/incidents/${id}/rereview`);
  const res = await fetch(url, {
    method: 'POST',
    headers: getRequestHeaders(),
    body: JSON.stringify({ reason: 'Approval undone during moderation undo window' }),
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(
      errorJson?.error?.message || `Failed to undo approval (${res.status})`
    );
  }

  return res.json();
}
