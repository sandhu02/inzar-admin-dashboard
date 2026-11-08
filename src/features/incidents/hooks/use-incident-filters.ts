'use client';

import { useQueryStates, parseAsString, parseAsBoolean, parseAsFloat, parseAsArrayOf } from 'nuqs';
import { useCallback, useMemo } from 'react';
import type { IncidentFilterValues } from '../types';

export const incidentSearchParams = {
  q: parseAsString.withDefault(''),
  review: parseAsArrayOf(parseAsString, ',').withDefault([]),
  lifecycle: parseAsArrayOf(parseAsString, ',').withDefault([]),
  category: parseAsArrayOf(parseAsString, ',').withDefault([]),
  date_preset: parseAsString.withDefault('all'),
  from: parseAsString.withDefault(''),
  to: parseAsString.withDefault(''),
  flagged: parseAsBoolean.withDefault(false),
  has_media: parseAsBoolean.withDefault(false),
  removed: parseAsBoolean.withDefault(false),
  near_lat: parseAsFloat,
  near_lng: parseAsFloat,
  radius_km: parseAsFloat,
  sort: parseAsString.withDefault('reported_at:desc'),
  cursor: parseAsString.withDefault(''),
  view: parseAsString.withDefault('default'),
};

export type IncidentSearchParamsUpdates = Partial<{
  q: string | null;
  review: string[] | null;
  lifecycle: string[] | null;
  category: string[] | null;
  date_preset: string | null;
  from: string | null;
  to: string | null;
  flagged: boolean | null;
  has_media: boolean | null;
  removed: boolean | null;
  near_lat: number | null;
  near_lng: number | null;
  radius_km: number | null;
  sort: string | null;
  cursor: string | null;
  view: string | null;
}>;

export function useIncidentFilters() {
  const [params, setParams] = useQueryStates(incidentSearchParams, {
    shallow: true,
    history: 'push',
  });

  const activeFilters = useMemo<IncidentFilterValues>(() => {
    return {
      q: params.q || undefined,
      review_status: params.review.length > 0 ? params.review : undefined,
      lifecycle_status: params.lifecycle.length > 0 ? params.lifecycle : undefined,
      category_id: params.category.length > 0 ? params.category : undefined,
      flagged: params.flagged ? true : undefined,
      has_media: params.has_media ? true : undefined,
      removed: params.removed ? true : undefined,
      date_preset: (params.date_preset as IncidentFilterValues['date_preset']) || 'all',
      created_from: params.date_preset === 'custom' ? params.from || undefined : undefined,
      created_to: params.date_preset === 'custom' ? params.to || undefined : undefined,
      near_lat: params.near_lat ?? undefined,
      near_lng: params.near_lng ?? undefined,
      radius_km: params.radius_km ?? undefined,
      sort: params.sort,
      cursor: params.cursor || undefined,
      view: params.view,
    };
  }, [params]);

  const setFilter = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (key: keyof typeof incidentSearchParams, value: any) => {
      setParams({
        [key]: value,
        cursor: null,
      });
    },
    [setParams]
  );

  const setMultipleFilters = useCallback(
    (updates: IncidentSearchParamsUpdates) => {
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

  const setView = useCallback(
    (viewId: string) => {
      setParams({ view: viewId });
    },
    [setParams]
  );

  const clearAllFilters = useCallback(() => {
    setParams({
      q: null,
      review: null,
      lifecycle: null,
      category: null,
      date_preset: null,
      from: null,
      to: null,
      flagged: null,
      has_media: null,
      removed: null,
      near_lat: null,
      near_lng: null,
      radius_km: null,
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
    setView,
    clearAllFilters,
  };
}
