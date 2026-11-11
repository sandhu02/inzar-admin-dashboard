'use client';

import * as React from 'react';
import { Flag, AlertTriangle, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlagsStatsBarProps {
  awaitingCount: number;
  distinctIncidentsCount: number;
  activeStatus: string;
  onSelectStatus: (status: string) => void;
}

export function FlagsStatsBar({
  awaitingCount,
  distinctIncidentsCount,
  activeStatus,
  onSelectStatus,
}: FlagsStatsBarProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" data-testid="flags-stats-bar">
      {/* Card 1: Awaiting Action */}
      <button
        type="button"
        onClick={() => onSelectStatus('pending')}
        className={cn(
          'rounded-xl border p-4 text-left transition-all shadow-xs flex flex-col justify-between space-y-2',
          activeStatus === 'pending'
            ? 'border-status-danger bg-status-danger/10 ring-1 ring-status-danger/30'
            : 'border-border bg-card hover:bg-surface-elevated'
        )}
        data-testid="flags-stat-pending"
      >
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-muted-foreground">
          <span>FLAGS AWAITING ACTION</span>
          <AlertTriangle className="h-4 w-4 text-status-danger" />
        </div>
        <p className="text-3xl font-bold font-mono text-status-danger">{awaitingCount}</p>
        <span className="text-[11px] font-mono text-muted-foreground">
          Pending community verification
        </span>
      </button>

      {/* Card 2: Distinct Incidents */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-2 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-muted-foreground">
          <span>DISPUTED INCIDENTS</span>
          <ShieldAlert className="h-4 w-4 text-accent" />
        </div>
        <p className="text-3xl font-bold font-mono text-foreground">
          {distinctIncidentsCount}
        </p>
        <span className="text-[11px] font-mono text-muted-foreground">
          Distinct reports with user flags
        </span>
      </div>

      {/* Card 3: All Flags View */}
      <button
        type="button"
        onClick={() => onSelectStatus('all')}
        className={cn(
          'rounded-xl border p-4 text-left transition-all shadow-xs flex flex-col justify-between space-y-2',
          activeStatus === 'all'
            ? 'border-accent bg-accent/10 ring-1 ring-accent/30'
            : 'border-border bg-card hover:bg-surface-elevated'
        )}
        data-testid="flags-stat-all"
      >
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-muted-foreground">
          <span>ALL COMMUNITY FLAGS</span>
          <Flag className="h-4 w-4 text-foreground" />
        </div>
        <p className="text-3xl font-bold font-mono text-foreground">
          {awaitingCount > 0 ? `${awaitingCount}+` : '0'}
        </p>
        <span className="text-[11px] font-mono text-muted-foreground">
          View full history across all states
        </span>
      </button>
    </div>
  );
}
