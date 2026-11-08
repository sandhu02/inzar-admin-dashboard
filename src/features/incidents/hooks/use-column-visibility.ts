'use client';

import { useState, useCallback } from 'react';
import type { VisibilityState } from '@tanstack/react-table';

const STORAGE_KEY = 'inzar_incident_columns_visibility_v1';

export const DEFAULT_COLUMN_VISIBILITY: VisibilityState = {
  select: true,
  category: true,
  incident: true,
  review_status: true,
  lifecycle_status: true,
  flags_count: true,
  place_label: true,
  reported_at: true,
  age: true,
  actions: true,
};

export const COLUMN_LABELS: Record<string, string> = {
  category: 'Category',
  incident: 'Incident Title & Media',
  review_status: 'Review Status',
  lifecycle_status: 'Lifecycle Status',
  flags_count: 'Flags Count',
  place_label: 'Place Label',
  reported_at: 'Reported Time',
  age: 'Age',
};

export function useColumnVisibility() {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    () => {
      if (typeof window === 'undefined') return DEFAULT_COLUMN_VISIBILITY;
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          return {
            ...DEFAULT_COLUMN_VISIBILITY,
            ...JSON.parse(stored),
          };
        }
      } catch {
        // Fallback to default
      }
      return DEFAULT_COLUMN_VISIBILITY;
    }
  );

  const updateColumnVisibility = useCallback(
    (updater: VisibilityState | ((prev: VisibilityState) => VisibilityState)) => {
      setColumnVisibility((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        }
        return next;
      });
    },
    []
  );

  return {
    columnVisibility,
    setColumnVisibility: updateColumnVisibility,
  };
}
