'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { fetchIncidents } from '@/features/incidents/api/incidents';
import type { IncidentFilterValues } from '@/features/incidents/types';

interface UseMapIncidentsOptions {
  filters: IncidentFilterValues;
  bbox?: string | null;
  viewportSyncEnabled?: boolean;
  debounceMs?: number;
  limit?: number;
}

export function useMapIncidents({
  filters,
  bbox,
  viewportSyncEnabled = true,
  debounceMs = 300,
  limit = 500,
}: UseMapIncidentsOptions) {
  // Debounce bbox updates to prevent request storms during smooth pan / zoom
  const [debouncedBbox, setDebouncedBbox] = useState<string | null>(bbox || null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedBbox(viewportSyncEnabled && bbox ? bbox : null);
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [bbox, debounceMs, viewportSyncEnabled]);

  const queryKey = [
    'incidents',
    'map',
    filters,
    viewportSyncEnabled ? debouncedBbox : 'all-viewport',
    limit,
  ];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await fetchIncidents({
        ...filters,
        limit,
        bbox: viewportSyncEnabled && debouncedBbox ? debouncedBbox : undefined,
      });
      return response;
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  return {
    incidents: query.data?.items || [],
    totalCount: query.data?.total_count || 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error as Error | null,
    refetch: query.refetch,
    debouncedBbox,
  };
}
