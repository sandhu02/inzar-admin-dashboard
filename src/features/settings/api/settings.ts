import { env } from '@/lib/env';
import type { GlobalSettings, GlobalSettingsUpdateInput } from '../types';

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

export async function fetchSettings(): Promise<GlobalSettings> {
  const url = getEndpointUrl('/admin/settings');
  const res = await fetch(url, {
    method: 'GET',
    headers: getRequestHeaders(),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to fetch settings: HTTP ${res.status}`
    );
  }

  return res.json();
}

export async function updateSettings(
  input: GlobalSettingsUpdateInput
): Promise<GlobalSettings> {
  const url = getEndpointUrl('/admin/settings');
  const res = await fetch(url, {
    method: 'PATCH',
    headers: getRequestHeaders(),
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to update settings: HTTP ${res.status}`
    );
  }

  return res.json();
}
