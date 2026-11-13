'use client';

import {
  useQueryStates,
  parseAsString,
  parseAsBoolean,
  parseAsArrayOf,
} from 'nuqs';
import { useCallback, useMemo } from 'react';
import type { IncidentFilterValues } from '@/features/incidents/types';

export const mapSearchParams = {
  q: parseAsString.withDefault(''),
  category: parseAsArrayOf(parseAsString, ',').withDefault([]),
  review: parseAsArrayOf(parseAsString, ',').withDefault([]),
  lifecycle: parseAsArrayOf(parseAsString, ',').withDefault([]),
  date_preset: parseAsString.withDefault('all'),
  from: parseAsString.withDefault(''),
  to: parseAsString.withDefault(''),
  flagged: parseAsBoolean.withDefault(false),
  has_media: parseAsBoolean.withDefault(false),
  removed: parseAsBoolean.withDefault(false),
  selected: parseAsString.withDefault(''),
  list_open: parseAsBoolean.withDefault(true),
  viewport_sync: parseAsBoolean.withDefault(true),
};

export type MapSearchParamsUpdates = Partial<{
  q: string | null;
  category: string[] | null;
  review: string[] | null;
  lifecycle: string[] | null;
  date_preset: string | null;
  from: string | null;
  to: string | null;
  flagged: boolean | null;
  has_media: boolean | null;
  removed: boolean | null;
  selected: string | null;
  list_open: boolean | null;
  viewport_sync: boolean | null;
}>;

export function useMapFilters() {
  const [params, setParams] = useQueryStates(mapSearchParams, {
    shallow: true,
    history: 'push',
  });

  const activeFilters = useMemo<IncidentFilterValues>(() => {
    return {
      q: params.q || undefined,
      category_id: params.category.length > 0 ? params.category : undefined,
      review_status: params.review.length > 0 ? params.review : undefined,
      lifecycle_status: params.lifecycle.length > 0 ? params.lifecycle : undefined,
      flagged: params.flagged ? true : undefined,
      has_media: params.has_media ? true : undefined,
      removed: params.removed ? true : undefined,
      date_preset: (params.date_preset as IncidentFilterValues['date_preset']) || 'all',
      created_from: params.date_preset === 'custom' ? params.from || undefined : undefined,
      created_to: params.date_preset === 'custom' ? params.to || undefined : undefined,
    };
  }, [params]);

  const selectedIncidentId = params.selected || null;
  const isListOpen = params.list_open;
  const isViewportSync = params.viewport_sync;

  const setFilter = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (key: keyof typeof mapSearchParams, value: any) => {
      setParams({
        [key]: value,
      });
    },
    [setParams]
  );

  const setMultipleFilters = useCallback(
    (updates: MapSearchParamsUpdates) => {
      setParams(updates);
    },
    [setParams]
  );

  const selectIncident = useCallback(
    (id: string | null) => {
      setParams({ selected: id || null });
    },
    [setParams]
  );

  const toggleList = useCallback(() => {
    setParams((prev) => ({ list_open: !prev.list_open }));
  }, [setParams]);

  const toggleViewportSync = useCallback(() => {
    setParams((prev) => ({ viewport_sync: !prev.viewport_sync }));
  }, [setParams]);

  const resetFilters = useCallback(() => {
    setParams({
      q: null,
      category: null,
      review: null,
      lifecycle: null,
      date_preset: 'all',
      from: null,
      to: null,
      flagged: null,
      has_media: null,
      removed: null,
      selected: null,
    });
  }, [setParams]);

  const hasActiveFilters = Boolean(
    params.q ||
      params.category.length > 0 ||
      params.review.length > 0 ||
      params.lifecycle.length > 0 ||
      params.date_preset !== 'all' ||
      params.flagged ||
      params.has_media ||
      params.removed
  );

  return {
    params,
    activeFilters,
    selectedIncidentId,
    isListOpen,
    isViewportSync,
    hasActiveFilters,
    setFilter,
    setMultipleFilters,
    selectIncident,
    toggleList,
    toggleViewportSync,
    resetFilters,
  };
}
