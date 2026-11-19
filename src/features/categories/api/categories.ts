import { env } from '@/lib/env';
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
  ReorderCategoryItem,
} from '../types';

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

export async function fetchCategories(): Promise<Category[]> {
  const url = getEndpointUrl('/admin/categories');
  const res = await fetch(url, {
    method: 'GET',
    headers: getRequestHeaders(),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to fetch categories: HTTP ${res.status}`
    );
  }

  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function createCategory(
  input: CreateCategoryInput
): Promise<Category> {
  const url = getEndpointUrl('/admin/categories');
  const res = await fetch(url, {
    method: 'POST',
    headers: getRequestHeaders(),
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to create category: HTTP ${res.status}`
    );
  }

  return res.json();
}

export async function updateCategory(
  id: string,
  input: UpdateCategoryInput
): Promise<Category> {
  const url = getEndpointUrl(`/admin/categories/${id}`);
  const res = await fetch(url, {
    method: 'PATCH',
    headers: getRequestHeaders(),
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to update category: HTTP ${res.status}`
    );
  }

  return res.json();
}

export async function reorderCategories(
  items: ReorderCategoryItem[]
): Promise<Category[]> {
  const url = getEndpointUrl('/admin/categories/reorder');
  const res = await fetch(url, {
    method: 'PUT',
    headers: getRequestHeaders(),
    body: JSON.stringify({ items }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to reorder categories: HTTP ${res.status}`
    );
  }

  return res.json();
}

export async function toggleCategoryStatus(
  id: string,
  isActive: boolean
): Promise<Category> {
  return updateCategory(id, { is_active: isActive });
}
