'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import type { IncidentFilterValues } from '../types';
import { mockCategories } from '@/mocks/fixtures';

interface FilterChipsProps {
  filters: IncidentFilterValues;
  onRemove: (filterKey: string, subValue?: string) => void;
  onClearAll: () => void;
}

export function IncidentFilterChips({
  filters,
  onRemove,
  onClearAll,
}: FilterChipsProps) {
  const chips: Array<{ id: string; label: string; onRemove: () => void }> = [];

  // Search chip
  if (filters.q) {
    chips.push({
      id: 'q',
      label: `Search: "${filters.q}"`,
      onRemove: () => onRemove('q'),
    });
  }

  // Review status chip
  if (filters.review_status && filters.review_status.length > 0) {
    const formatted = filters.review_status
      .map((s) => s.replace('_', ' '))
      .join(', ');
    chips.push({
      id: 'review',
      label: `Review: ${formatted}`,
      onRemove: () => onRemove('review'),
    });
  }

  // Lifecycle status chip
  if (filters.lifecycle_status && filters.lifecycle_status.length > 0) {
    chips.push({
      id: 'lifecycle',
      label: `Lifecycle: ${filters.lifecycle_status.join(', ')}`,
      onRemove: () => onRemove('lifecycle'),
    });
  }

  // Category chip
  if (filters.category_id && filters.category_id.length > 0) {
    const names = filters.category_id.map((catIdOrSlug) => {
      const match = mockCategories.find(
        (c) => c.id === catIdOrSlug || c.slug === catIdOrSlug
      );
      return match ? match.name : catIdOrSlug;
    });
    chips.push({
      id: 'category',
      label: `Category: ${names.join(', ')}`,
      onRemove: () => onRemove('category'),
    });
  }

  // Date preset chip
  if (filters.date_preset && filters.date_preset !== 'all') {
    const labelMap: Record<string, string> = {
      today: 'Today',
      '24h': 'Last 24 hours',
      '7d': 'Last 7 days',
      '30d': 'Last 30 days',
      custom: 'Custom date range',
    };
    chips.push({
      id: 'date_preset',
      label: labelMap[filters.date_preset] || filters.date_preset,
      onRemove: () => onRemove('date_preset'),
    });
  }

  // Flagged only chip
  if (filters.flagged) {
    chips.push({
      id: 'flagged',
      label: 'Flagged only',
      onRemove: () => onRemove('flagged'),
    });
  }

  // Has media chip
  if (filters.has_media) {
    chips.push({
      id: 'has_media',
      label: 'Has media',
      onRemove: () => onRemove('has_media'),
    });
  }

  // Removed included chip
  if (filters.removed) {
    chips.push({
      id: 'removed',
      label: 'Removed included',
      onRemove: () => onRemove('removed'),
    });
  }

  // Location radius chip
  if (
    typeof filters.near_lat === 'number' &&
    typeof filters.near_lng === 'number' &&
    typeof filters.radius_km === 'number'
  ) {
    chips.push({
      id: 'location',
      label: `Within ${filters.radius_km} km of (${filters.near_lat.toFixed(2)}, ${filters.near_lng.toFixed(2)})`,
      onRemove: () => onRemove('location'),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
      {chips.map((chip) => (
        <span
          key={chip.id}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-surface-elevated border border-border text-foreground hover:border-accent/40 transition-colors"
        >
          <span>{chip.label}</span>
          <button
            type="button"
            onClick={chip.onRemove}
            className="text-muted-foreground hover:text-foreground rounded p-0.5 focus:outline-none focus:ring-1 focus:ring-accent"
            aria-label={`Remove filter ${chip.label}`}
          >
            <X className="h-3 w-3 stroke-[2.5]" />
          </button>
        </span>
      ))}

      <button
        type="button"
        onClick={onClearAll}
        className="text-xs font-mono text-muted-foreground hover:text-foreground underline underline-offset-2 ml-1"
      >
        Clear all
      </button>
    </div>
  );
}
