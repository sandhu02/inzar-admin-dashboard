'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from '../api/users';
import type { UserFilterValues, UsersListResponse } from '../types';

export function useUsers(filters: UserFilterValues = {}) {
  return useQuery<UsersListResponse, Error>({
    queryKey: ['admin', 'users', filters],
    queryFn: () => fetchUsers(filters),
    placeholderData: (previousData) => previousData,
    staleTime: 30000,
  });
}
