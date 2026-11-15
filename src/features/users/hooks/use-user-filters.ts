'use client';

import { useQueryStates, parseAsString } from 'nuqs';
import { useCallback, useMemo } from 'react';
import type { UserFilterValues } from '../types';

export const userSearchParams = {
  q: parseAsString.withDefault(''),
  role: parseAsString.withDefault('all'),
  status: parseAsString.withDefault('all'),
  verified: parseAsString.withDefault('all'),
  date_preset: parseAsString.withDefault('all'),
  from: parseAsString.withDefault(''),
  to: parseAsString.withDefault(''),
  sort: parseAsString.withDefault('created_at:desc'),
  cursor: parseAsString.withDefault(''),
};

export type UserSearchParamsUpdates = Partial<{
  q: string | null;
  role: string | null;
  status: string | null;
  verified: string | null;
  date_preset: string | null;
  from: string | null;
  to: string | null;
  sort: string | null;
  cursor: string | null;
}>;

export function useUserFilters() {
  const [params, setParams] = useQueryStates(userSearchParams, {
    shallow: true,
    history: 'push',
  });

  const activeFilters = useMemo<UserFilterValues>(() => {
    return {
      q: params.q || undefined,
      role: params.role !== 'all' ? params.role : undefined,
      status: (params.status as UserFilterValues['status']) || undefined,
      verified: (params.verified as UserFilterValues['verified']) || undefined,
      date_preset: params.date_preset !== 'all' ? params.date_preset : undefined,
      created_from: params.date_preset === 'custom' ? params.from || undefined : undefined,
      created_to: params.date_preset === 'custom' ? params.to || undefined : undefined,
      sort: params.sort,
      cursor: params.cursor || undefined,
    };
  }, [params]);

  const setFilter = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (key: keyof typeof userSearchParams, value: any) => {
      setParams({
        [key]: value,
        cursor: null,
      });
    },
    [setParams]
  );

  const setMultipleFilters = useCallback(
    (updates: UserSearchParamsUpdates) => {
      setParams({
        ...updates,
        cursor: null,
      });
    },
    [setParams]
  );

  const setCursor = useCallback(
    (newCursor: string | null) => {
      setParams({ cursor: newCursor || null });
    },
    [setParams]
  );

  const setSort = useCallback(
    (newSort: string) => {
      setParams({ sort: newSort, cursor: null });
    },
    [setParams]
  );

  const clearAllFilters = useCallback(() => {
    setParams({
      q: null,
      role: null,
      status: null,
      verified: null,
      date_preset: null,
      from: null,
      to: null,
      cursor: null,
    });
  }, [setParams]);

  return {
    rawParams: params,
    activeFilters,
    setFilter,
    setMultipleFilters,
    setCursor,
    setSort,
    clearAllFilters,
  };
}
