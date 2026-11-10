'use client';

import * as React from 'react';
import { MoreHorizontal, Copy } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusBadge } from '@/components/status/status-badge';
import { CategoryChip } from '@/components/status/category-chip';
import { formatReportedTime, formatAge } from '@/lib/format/date';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { IncidentThumbnail } from './incident-thumbnail';
import type { Incident } from '../types';

interface CardListProps {
  items: Incident[];
  isLoading?: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onRowClick?: (incident: Incident) => void;
  onRowAction?: (action: string, incident: Incident) => void;
}

export function IncidentCardList({
  items,
  isLoading,
  selectedIds,
  onToggleSelect,
  onRowClick,
  onRowAction,
}: CardListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-xl border border-border bg-card space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="p-8 rounded-xl border border-border bg-card text-center">
        <EmptyState
          title="No incidents match"
          description="Try adjusting your active filters or clear them to view all incidents."
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((incident) => {
        const isSelected = selectedIds.has(incident.id);

        return (
          <div
            key={incident.id}
            onClick={() => onRowClick?.(incident)}
            className={`p-4 rounded-xl border bg-card transition-all ${
              isSelected
                ? 'border-accent/40 bg-accent/5'
                : 'border-border hover:border-border/80 hover:bg-surface-elevated/40'
            } cursor-pointer`}
          >
            {/* Top row: Checkbox, Category, Badges, and Action Menu */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onToggleSelect(incident.id)}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Select incident ${incident.id}`}
                />
                <CategoryChip category={incident.category} />
              </div>

              <div className="flex items-center gap-2">
                <StatusBadge status={incident.review_status} />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground"
                      aria-label={`Actions for incident ${incident.id}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onRowAction?.('view', incident)}
                    >
                      View details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        if (typeof navigator !== 'undefined') {
                          navigator.clipboard.writeText(incident.id);
                        }
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy ID
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Middle row: Thumbnail + Title & description */}
            <div className="flex items-start gap-3 my-2">
              <IncidentThumbnail
                id={incident.id}
                thumbnailUrl={incident.thumbnail_url}
                title={incident.title}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <h2 className="font-sans font-semibold text-sm text-foreground truncate">
                  {incident.title}
                </h2>
                {incident.description && (
                  <p className="font-sans text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {incident.description}
                  </p>
                )}
              </div>
            </div>

            {/* Bottom metadata row */}
            <div className="flex flex-wrap items-center justify-between text-xs font-mono text-muted-foreground pt-2 border-t border-border/50 gap-2">
              <span>{incident.place_label || '-'}</span>
              <div className="flex items-center gap-3">
                {(incident.flags_count || 0) > 0 && (
                  <span className="text-status-warning font-semibold">
                    {incident.flags_count} flag(s)
                  </span>
                )}
                <span>{formatReportedTime(incident.reported_at)}</span>
                <span className="text-muted-foreground/60">
                  ({formatAge(incident.reported_at)})
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
