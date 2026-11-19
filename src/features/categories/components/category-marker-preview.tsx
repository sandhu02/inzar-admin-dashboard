'use client';

import * as React from 'react';
import { CategoryChip, CATEGORY_ICON_REGISTRY } from '@/components/status/category-chip';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CategoryUrgency } from '../types';

interface CategoryMarkerPreviewProps {
  name: string;
  slug: string;
  color_hex: string;
  icon_key: string;
  urgency: CategoryUrgency;
  default_ttl_minutes: number;
  stale_after_minutes: number;
  require_manual_review: boolean;
  className?: string;
}

export function CategoryMarkerPreview({
  name,
  slug,
  color_hex,
  icon_key,
  urgency,
  default_ttl_minutes,
  stale_after_minutes,
  require_manual_review,
  className,
}: CategoryMarkerPreviewProps) {
  const Icon = CATEGORY_ICON_REGISTRY[icon_key] || HelpCircle;
  const isHighUrgency = urgency === 'high';

  return (
    <div
      className={cn(
        'rounded-xl border border-border/80 bg-surface-elevated/40 p-4 space-y-3',
        className
      )}
      aria-label="Category Live Preview"
    >
      <div className="flex items-center justify-between text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
        <span>Live Marker & Chip Preview</span>
        <span
          className={cn(
            'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
            isHighUrgency
              ? 'bg-status-danger/20 text-status-danger border border-status-danger/40'
              : 'bg-surface text-muted-foreground border border-border'
          )}
        >
          {urgency} urgency
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-lg bg-surface border border-border/60">
        {/* Map Marker Preview */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            {/* Pulsing ring for high urgency */}
            {isHighUrgency && (
              <span
                className="absolute h-10 w-10 rounded-full animate-ping opacity-25"
                style={{ backgroundColor: color_hex || '#FF6B2C' }}
                aria-hidden="true"
              />
            )}
            {/* Outer Pin Circle */}
            <div
              className="relative flex h-8 w-8 items-center justify-center rounded-full shadow-md text-white transition-all duration-200"
              style={{
                backgroundColor: color_hex || '#FF6B2C',
                border: '2px solid rgba(255, 255, 255, 0.85)',
              }}
              title="Map Pin Representation"
            >
              <Icon className="h-4 w-4 drop-shadow-xs" />
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
              Map Marker
            </span>
            <span className="text-xs font-semibold text-foreground">
              {name || 'Category Name'}
            </span>
          </div>
        </div>

        {/* CategoryChip Preview */}
        <div className="flex flex-col items-start gap-1">
          <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
            UI Chip
          </span>
          <CategoryChip
            category={{
              name: name || 'Category Name',
              slug: slug || 'custom_category',
              color_hex: color_hex || '#FF6B2C',
              icon_key: icon_key || 'flame',
            }}
          />
        </div>

        {/* Retention Summary */}
        <div className="flex flex-col text-right text-xs font-mono text-muted-foreground">
          <span className="text-[11px] uppercase tracking-wider">Timers</span>
          <span className="text-foreground">
            TTL: <strong className="font-bold">{default_ttl_minutes || 0}m</strong> · Stale:{' '}
            <strong className="font-bold">{stale_after_minutes || 0}m</strong>
          </span>
          {require_manual_review && (
            <span className="text-accent text-[10px] font-medium mt-0.5">
              Requires Manual Review
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
