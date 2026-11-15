'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchCurrentUser } from '../api/users';
import type { SessionUser } from '@/lib/auth/session';

export function useCurrentUser() {
  const query = useQuery<{ user: SessionUser | null }, Error>({
    queryKey: ['auth', 'session'],
    queryFn: fetchCurrentUser,
    staleTime: 60000,
  });

  return {
    user: query.data?.user ?? null,
    isAdmin: query.data?.user?.role === 'admin',
    isModerator: query.data?.user?.role === 'moderator',
    isLoading: query.isLoading,
  };
}
