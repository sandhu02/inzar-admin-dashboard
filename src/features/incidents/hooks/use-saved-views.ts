'use client';

import { useState, useCallback } from 'react';
import type { SavedView, IncidentFilterValues } from '../types';

const STORAGE_KEY = 'inzar_saved_incident_views_v1';
const DEFAULT_VIEW_ID_KEY = 'inzar_default_incident_view_id';

export const SYSTEM_VIEWS: SavedView[] = [
  {
    id: 'default',
    name: 'Default view',
    isSystem: true,
    isDefault: true,
    filters: {},
  },
  {
    id: 'under_review',
    name: 'Under review',
    isSystem: true,
    filters: {
      review_status: ['under_review', 'needs_review'],
    },
  },
  {
    id: 'flagged_only',
    name: 'Flagged only',
    isSystem: true,
    filters: {
      flagged: true,
    },
  },
  {
    id: 'last_7_days',
    name: 'Last 7 days',
    isSystem: true,
    filters: {
      date_preset: '7d',
    },
  },
];

export function useSavedViews() {
  const [customViews, setCustomViews] = useState<SavedView[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const storedViews = localStorage.getItem(STORAGE_KEY);
      return storedViews ? JSON.parse(storedViews) : [];
    } catch {
      return [];
    }
  });

  const [defaultViewId, setDefaultViewId] = useState<string>(() => {
    if (typeof window === 'undefined') return 'default';
    try {
      return localStorage.getItem(DEFAULT_VIEW_ID_KEY) || 'default';
    } catch {
      return 'default';
    }
  });

  const allViews: SavedView[] = [
    ...SYSTEM_VIEWS.map((sv) => ({
      ...sv,
      isDefault: sv.id === defaultViewId,
    })),
    ...customViews.map((cv) => ({
      ...cv,
      isDefault: cv.id === defaultViewId,
    })),
  ];

  const saveCurrentView = useCallback(
    (name: string, currentFilters: IncidentFilterValues): SavedView => {
      const newView: SavedView = {
        id: `view_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: name.trim(),
        isSystem: false,
        filters: {
          q: currentFilters.q,
          review_status: currentFilters.review_status,
          lifecycle_status: currentFilters.lifecycle_status,
          category_id: currentFilters.category_id,
          flagged: currentFilters.flagged,
          has_media: currentFilters.has_media,
          removed: currentFilters.removed,
          date_preset: currentFilters.date_preset,
          created_from: currentFilters.created_from,
          created_to: currentFilters.created_to,
          near_lat: currentFilters.near_lat,
          near_lng: currentFilters.near_lng,
          radius_km: currentFilters.radius_km,
          sort: currentFilters.sort,
        },
      };

      setCustomViews((prev) => {
        const next = [...prev, newView];
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        }
        return next;
      });

      return newView;
    },
    []
  );

  const renameView = useCallback((id: string, newName: string) => {
    setCustomViews((prev) => {
      const next = prev.map((v) =>
        v.id === id ? { ...v, name: newName.trim() } : v
      );
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
      return next;
    });
  }, []);

  const deleteView = useCallback(
    (id: string) => {
      setCustomViews((prev) => {
        const next = prev.filter((v) => v.id !== id);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        }
        return next;
      });
      if (defaultViewId === id) {
        setDefaultViewId('default');
        if (typeof window !== 'undefined') {
          localStorage.setItem(DEFAULT_VIEW_ID_KEY, 'default');
        }
      }
    },
    [defaultViewId]
  );

  const setDefaultView = useCallback((id: string) => {
    setDefaultViewId(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(DEFAULT_VIEW_ID_KEY, id);
    }
  }, []);

  return {
    views: allViews,
    customViews,
    defaultViewId,
    saveCurrentView,
    renameView,
    deleteView,
    setDefaultView,
  };
}
