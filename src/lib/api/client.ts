import createClient from 'openapi-fetch';
import type { paths } from './schema';
import { env } from '../env';

// Client pointing to backend directly or via BFF proxy
export const apiClient = createClient<paths>({
  baseUrl: typeof window === 'undefined' ? env.API_BASE_URL : '/api/proxy',
});
