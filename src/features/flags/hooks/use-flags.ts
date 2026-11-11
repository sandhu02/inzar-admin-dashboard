'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useQueryStates, parseAsString } from 'nuqs';
import {
  fetchFlags,
  dismissFlag,
  moveIncidentToReview,
  markIncidentFalse,
} from '../api/flags';
import type { FlagType, FlagStatus, FlagFilterValues } from '../types';

export const flagsSearchParams = {
  type: parseAsString.withDefault('all'),
  status: parseAsString.withDefault('all'),
  category: parseAsString.withDefault('all'),
  q: parseAsString.withDefault(''),
};

export type FlagsSearchParamUpdates = Partial<{
  type: string | null;
  status: string | null;
  category: string | null;
  q: string | null;
}>;

export function useFlags() {
  const queryClient = useQueryClient();
  const [params, setParams] = useQueryStates(flagsSearchParams, {
    shallow: true,
    history: 'push',
  });

  const filters: FlagFilterValues = React.useMemo(() => {
    return {
      type: (params.type || 'all') as 'all' | FlagType,
      status: (params.status || 'all') as 'all' | FlagStatus,
      category_id: params.category === 'all' ? undefined : params.category,
      q: params.q || undefined,
    };
  }, [params]);

  // Query flags
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['flags', filters],
    queryFn: () => fetchFlags(filters),
    staleTime: 1000 * 20,
  });

  // Mutation: Dismiss Flag
  const dismissMutation = useMutation({
    mutationFn: ({ flagId, notes }: { flagId: string; notes?: string }) =>
      dismissFlag(flagId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flags'] });
      queryClient.invalidateQueries({ queryKey: ['overview-stats'] });
    },
  });

  // Mutation: Move to Review Queue
  const moveToReviewMutation = useMutation({
    mutationFn: ({ incidentId, reason }: { incidentId: string; reason?: string }) =>
      moveIncidentToReview(incidentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flags'] });
      queryClient.invalidateQueries({ queryKey: ['moderation-queue'] });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
  });

  // Mutation: Mark Incident False
  const markFalseMutation = useMutation({
    mutationFn: ({
      incidentId,
      reason,
      notes,
    }: {
      incidentId: string;
      reason: string;
      notes?: string;
    }) => markIncidentFalse(incidentId, reason, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flags'] });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['overview-stats'] });
    },
  });

  const updateFilters = React.useCallback(
    (updates: FlagsSearchParamUpdates) => {
      setParams(updates as Record<string, string | null>);
    },
    [setParams]
  );

  return {
    groups: data?.items || [],
    totalCount: data?.total_count || 0,
    awaitingCount: data?.awaiting_count || 0,
    distinctIncidentsCount: data?.distinct_incidents_count || 0,
    isLoading,
    isError,
    error,
    refetch,
    filters,
    params,
    updateFilters,
    dismissFlag: dismissMutation.mutateAsync,
    isDismissing: dismissMutation.isPending,
    moveToReview: moveToReviewMutation.mutateAsync,
    isMovingToReview: moveToReviewMutation.isPending,
    markFalse: markFalseMutation.mutateAsync,
    isMarkingFalse: markFalseMutation.isPending,
  };
}
