'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchUserDetail } from '../api/users';
import type { UserDetail } from '../types';

export function useUserDetail(userId: string) {
  return useQuery<UserDetail, Error>({
    queryKey: ['admin', 'users', userId],
    queryFn: () => fetchUserDetail(userId),
    enabled: Boolean(userId),
    staleTime: 30000,
  });
}
