'use client';

import * as React from 'react';
import { Search, X, RotateCcw, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { useUserFilters } from '../hooks/use-user-filters';

interface UsersFilterBarProps {
  filterHook: ReturnType<typeof useUserFilters>;
}

export function UsersFilterBar({ filterHook }: UsersFilterBarProps) {
  const { rawParams, setFilter, clearAllFilters } = filterHook;
  const [searchTerm, setSearchTerm] = React.useState(rawParams.q || '');
  const [prevUrlQ, setPrevUrlQ] = React.useState(rawParams.q || '');

  // Sync local search when URL state changes
  if (prevUrlQ !== (rawParams.q || '')) {
    setPrevUrlQ(rawParams.q || '');
    setSearchTerm(rawParams.q || '');
  }

  // Debounced search (300ms)
  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== (rawParams.q || '')) {
        setFilter('q', searchTerm || null);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, rawParams.q, setFilter]);

  const activeChips = React.useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];

    if (rawParams.q) {
      chips.push({
        key: 'q',
        label: `Search: "${rawParams.q}"`,
        onRemove: () => {
          setSearchTerm('');
          setFilter('q', null);
        },
      });
    }

    if (rawParams.role && rawParams.role !== 'all') {
      chips.push({
        key: 'role',
        label: `Role: ${rawParams.role.toUpperCase()}`,
        onRemove: () => setFilter('role', null),
      });
    }

    if (rawParams.status && rawParams.status !== 'all') {
      chips.push({
        key: 'status',
        label: `Status: ${rawParams.status.toUpperCase()}`,
        onRemove: () => setFilter('status', null),
      });
    }

    if (rawParams.verified && rawParams.verified !== 'all') {
      chips.push({
        key: 'verified',
        label: `Verified: ${rawParams.verified.toUpperCase()}`,
        onRemove: () => setFilter('verified', null),
      });
    }

    if (rawParams.date_preset && rawParams.date_preset !== 'all') {
      chips.push({
        key: 'date_preset',
        label: `Time: ${rawParams.date_preset.toUpperCase()}`,
        onRemove: () => setFilter('date_preset', null),
      });
    }

    return chips;
  }, [rawParams, setFilter]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by display name or email..."
            className="w-full h-9 pl-9 pr-8 rounded-lg border border-border bg-card text-foreground text-xs font-sans placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-accent"
            data-testid="users-search-input"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilter('q', null);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Role select */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={rawParams.role || 'all'}
            onChange={(e) => setFilter('role', e.target.value === 'all' ? null : e.target.value)}
            className="h-9 px-2.5 rounded-lg border border-border bg-card text-foreground text-xs font-sans focus:outline-none focus:ring-1 focus:ring-accent"
            aria-label="Filter by role"
            data-testid="filter-role-select"
          >
            <option value="all">All Roles</option>
            <option value="admin">Administrator</option>
            <option value="moderator">Moderator</option>
            <option value="user">Citizen</option>
          </select>

          {/* Status select */}
          <select
            value={rawParams.status || 'all'}
            onChange={(e) => setFilter('status', e.target.value === 'all' ? null : e.target.value)}
            className="h-9 px-2.5 rounded-lg border border-border bg-card text-foreground text-xs font-sans focus:outline-none focus:ring-1 focus:ring-accent"
            aria-label="Filter by account status"
            data-testid="filter-status-select"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended Only</option>
          </select>

          {/* Verification select */}
          <select
            value={rawParams.verified || 'all'}
            onChange={(e) => setFilter('verified', e.target.value === 'all' ? null : e.target.value)}
            className="h-9 px-2.5 rounded-lg border border-border bg-card text-foreground text-xs font-sans focus:outline-none focus:ring-1 focus:ring-accent"
            aria-label="Filter by verification"
            data-testid="filter-verified-select"
          >
            <option value="all">All Verification</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>

          {/* Date range preset select */}
          <select
            value={rawParams.date_preset || 'all'}
            onChange={(e) => setFilter('date_preset', e.target.value === 'all' ? null : e.target.value)}
            className="h-9 px-2.5 rounded-lg border border-border bg-card text-foreground text-xs font-sans focus:outline-none focus:ring-1 focus:ring-accent"
            aria-label="Filter by created date"
            data-testid="filter-date-select"
          >
            <option value="all">All Time</option>
            <option value="today">Past 24 Hours</option>
            <option value="7d">Past 7 Days</option>
            <option value="30d">Past 30 Days</option>
          </select>
        </div>
      </div>

      {/* Active filter chips */}
      {activeChips.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-1" data-testid="active-filter-chips">
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Filters:
          </span>
          {activeChips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-border bg-surface-elevated text-xs font-sans text-foreground"
            >
              <span>{chip.label}</span>
              <button
                onClick={chip.onRemove}
                className="text-muted-foreground hover:text-foreground rounded p-0.5"
                aria-label={`Remove filter ${chip.label}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground font-mono"
            data-testid="clear-all-filters-btn"
          >
            <RotateCcw className="h-3 w-3 mr-1" /> Clear All
          </Button>
        </div>
      )}
    </div>
  );
}
