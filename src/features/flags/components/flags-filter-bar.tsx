'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlagsFilterBarProps {
  type: string;
  status: string;
  category: string;
  search: string;
  onTypeChange: (type: string) => void;
  onStatusChange: (status: string) => void;
  onCategoryChange: (category: string) => void;
  onSearchChange: (search: string) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

const TYPE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'All Types' },
  { value: 'abuse', label: 'Abuse / Spam' },
  { value: 'incorrect', label: 'Incorrect Info' },
  { value: 'resolved', label: 'Already Resolved' },
];

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'dismissed', label: 'Dismissed' },
];

export function FlagsFilterBar({
  type,
  status,
  search,
  onTypeChange,
  onStatusChange,
  onSearchChange,
  onReset,
  hasActiveFilters,
}: FlagsFilterBarProps) {
  return (
    <div
      className="p-4 rounded-xl border border-border bg-surface space-y-3"
      data-testid="flags-filter-bar"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search flagged report titles or descriptions..."
            className="pl-9 h-9 text-xs bg-surface-elevated/40"
            data-testid="flags-search-input"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Reset button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="self-start md:self-auto inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent font-mono transition-colors"
            data-testid="flags-reset-filters-btn"
          >
            <X className="h-3.5 w-3.5" />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border/50">
        {/* Flag Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-mono uppercase text-muted-foreground mr-1 shrink-0">
            Status:
          </span>
          {STATUS_OPTIONS.map((opt) => {
            const active = status === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onStatusChange(opt.value)}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-medium transition-colors shrink-0',
                  active
                    ? 'bg-foreground text-background font-semibold shadow-xs'
                    : 'bg-surface-elevated text-muted-foreground hover:text-foreground'
                )}
                data-testid={`flags-filter-status-${opt.value}`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Flag Type Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-mono uppercase text-muted-foreground mr-1 shrink-0">
            Type:
          </span>
          {TYPE_OPTIONS.map((opt) => {
            const active = type === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onTypeChange(opt.value)}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-medium transition-colors shrink-0',
                  active
                    ? 'bg-accent text-accent-foreground font-semibold shadow-xs'
                    : 'bg-surface-elevated text-muted-foreground hover:text-foreground'
                )}
                data-testid={`flags-filter-type-${opt.value}`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
