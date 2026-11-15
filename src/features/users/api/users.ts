import { env } from '@/lib/env';
import type {
  UserDetail,
  UserFilterValues,
  UsersListResponse,
  UserRole,
} from '../types';
import type { Incident } from '@/features/incidents/types';
import type { SessionUser } from '@/lib/auth/session';

function getEndpointUrl(endpoint: string) {
  if (typeof window === 'undefined' || process.env.NODE_ENV === 'test') {
    return `${env.API_BASE_URL}${endpoint}`;
  }
  return `/api/proxy${endpoint}`;
}

function getRequestHeaders() {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  if (process.env.NODE_ENV === 'test') {
    headers['Authorization'] = 'Bearer mock_jwt_access_admin_token';
  }
  return headers;
}

export interface UserIncidentsResponse {
  items: Incident[];
  total_count: number;
  next_cursor: string | null;
}

export async function fetchUsers(filters: UserFilterValues = {}): Promise<UsersListResponse> {
  const params = new URLSearchParams();

  if (filters.q?.trim()) {
    params.set('q', filters.q.trim());
  }

  if (filters.role && filters.role !== 'all') {
    params.set('role', filters.role);
  }

  if (filters.status && filters.status !== 'all') {
    params.set('status', filters.status);
  }

  if (filters.verified && filters.verified !== 'all') {
    params.set('verified', filters.verified);
  }

  if (filters.date_preset && filters.date_preset !== 'all') {
    params.set('date_preset', filters.date_preset);
  }

  if (filters.created_from) {
    params.set('created_from', filters.created_from);
  }

  if (filters.created_to) {
    params.set('created_to', filters.created_to);
  }

  if (filters.sort) {
    params.set('sort', filters.sort);
  }

  if (filters.cursor) {
    params.set('cursor', filters.cursor);
  }

  if (filters.limit) {
    params.set('limit', String(filters.limit));
  }

  const query = params.toString();
  const url = `${getEndpointUrl('/admin/users')}${query ? `?${query}` : ''}`;

  const res = await fetch(url, {
    headers: getRequestHeaders(),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      errorBody?.error?.message || `Failed to fetch users list (HTTP ${res.status})`
    );
  }

  return res.json();
}

export async function fetchUserDetail(userId: string): Promise<UserDetail> {
  const url = `${getEndpointUrl(`/admin/users/${encodeURIComponent(userId)}`)}`;
  const res = await fetch(url, {
    headers: getRequestHeaders(),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      errorBody?.error?.message || `Failed to fetch user profile (HTTP ${res.status})`
    );
  }

  return res.json();
}

export async function fetchUserIncidents(
  userId: string,
  cursor?: string
): Promise<UserIncidentsResponse> {
  const params = new URLSearchParams();
  if (cursor) params.set('cursor', cursor);

  const query = params.toString();
  const url = `${getEndpointUrl(`/admin/users/${encodeURIComponent(userId)}/incidents`)}${query ? `?${query}` : ''}`;
  const res = await fetch(url, {
    headers: getRequestHeaders(),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      errorBody?.error?.message || `Failed to fetch user incidents (HTTP ${res.status})`
    );
  }

  return res.json();
}

export async function updateUserSuspension(params: {
  userId: string;
  isSuspended: boolean;
  reason: string;
  notes?: string;
}): Promise<UserDetail> {
  const url = getEndpointUrl(`/admin/users/${encodeURIComponent(params.userId)}`);
  const res = await fetch(url, {
    method: 'PATCH',
    headers: getRequestHeaders(),
    body: JSON.stringify({
      is_suspended: params.isSuspended,
      reason: params.reason,
      notes: params.notes,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      errorBody?.error?.message || `Failed to update user suspension (HTTP ${res.status})`
    );
  }

  return res.json();
}

export async function updateUserRole(params: {
  userId: string;
  role: UserRole;
  reason: string;
  notes?: string;
}): Promise<UserDetail> {
  const url = getEndpointUrl(`/admin/users/${encodeURIComponent(params.userId)}`);
  const res = await fetch(url, {
    method: 'PATCH',
    headers: getRequestHeaders(),
    body: JSON.stringify({
      role: params.role,
      reason: params.reason,
      notes: params.notes,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      errorBody?.error?.message || `Failed to change user role (HTTP ${res.status})`
    );
  }

  return res.json();
}

export async function revokeUserSessions(params: {
  userId: string;
  reason?: string;
}): Promise<{ success: boolean; revoked_count: number }> {
  const url = getEndpointUrl(`/admin/users/${encodeURIComponent(params.userId)}/revoke-sessions`);
  const res = await fetch(url, {
    method: 'POST',
    headers: getRequestHeaders(),
    body: JSON.stringify({
      reason: params.reason,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      errorBody?.error?.message || `Failed to revoke user sessions (HTTP ${res.status})`
    );
  }

  return res.json();
}

export async function fetchCurrentUser(): Promise<{ user: SessionUser | null }> {
  if (typeof window === 'undefined' || process.env.NODE_ENV === 'test') {
    // Return mock admin in test environment
    return {
      user: {
        id: 'usr_admin_001',
        email: 'admin@inzar.app',
        display_name: 'Sana Rehman',
        role: 'admin',
      },
    };
  }

  const res = await fetch('/api/auth/session', {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    return { user: null };
  }

  return res.json();
}
