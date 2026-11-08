import createClient from 'openapi-fetch';
import type { paths } from './schema';
import { env } from '../env';

function getBaseUrl() {
  if (typeof window === 'undefined' || process.env.NODE_ENV === 'test') {
    return env.API_BASE_URL;
  }
  return '/api/proxy';
}

// Client pointing to backend directly or via BFF proxy
export const apiClient = createClient<paths>({
  baseUrl: getBaseUrl(),
  headers: {
    Authorization: 'Bearer mock_jwt_access_admin_token',
  },
  fetch: (input: Request) => globalThis.fetch(input),
});
