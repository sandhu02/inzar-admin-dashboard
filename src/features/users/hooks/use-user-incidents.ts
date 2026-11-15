'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchUserIncidents, type UserIncidentsResponse } from '../api/users';

export function useUserIncidents(userId: string, cursor?: string) {
  return useQuery<UserIncidentsResponse, Error>({
    queryKey: ['admin', 'users', userId, 'incidents', cursor],
    queryFn: () => fetchUserIncidents(userId, cursor),
    enabled: Boolean(userId),
    staleTime: 30000,
  });
}
