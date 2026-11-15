'use client';

import * as React from 'react';
import { FileText, CheckCircle2, Clock, XCircle, AlertOctagon, Flag } from 'lucide-react';
import type { UserStats } from '../../types';

interface UserStatsCardsProps {
  stats: UserStats;
}

export function UserStatsCards({ stats }: UserStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-3" data-testid="user-stats-cards">
      {/* Total Reports */}
      <div className="p-3.5 rounded-xl border border-border bg-card shadow-xs">
        <div className="flex items-center justify-between text-muted-foreground mb-1">
          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Total Reports</span>
          <FileText className="h-4 w-4 text-accent" />
        </div>
        <div className="text-xl font-bold font-mono text-foreground" data-testid="stat-user-total-reports">
          {stats.total_reports}
        </div>
      </div>

      {/* Published */}
      <div className="p-3.5 rounded-xl border border-border bg-card shadow-xs">
        <div className="flex items-center justify-between text-muted-foreground mb-1">
          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Published</span>
          <CheckCircle2 className="h-4 w-4 text-status-success" />
        </div>
        <div className="text-xl font-bold font-mono text-status-success" data-testid="stat-user-published">
          {stats.published_reports}
        </div>
      </div>

      {/* Under Review */}
      <div className="p-3.5 rounded-xl border border-border bg-card shadow-xs">
        <div className="flex items-center justify-between text-muted-foreground mb-1">
          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Under Review</span>
          <Clock className="h-4 w-4 text-status-warning" />
        </div>
        <div className="text-xl font-bold font-mono text-status-warning" data-testid="stat-user-under-review">
          {stats.under_review_reports}
        </div>
      </div>

      {/* Rejected */}
      <div className="p-3.5 rounded-xl border border-border bg-card shadow-xs">
        <div className="flex items-center justify-between text-muted-foreground mb-1">
          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Rejected</span>
          <XCircle className="h-4 w-4 text-status-danger" />
        </div>
        <div className="text-xl font-bold font-mono text-status-danger" data-testid="stat-user-rejected">
          {stats.rejected_reports}
        </div>
      </div>

      {/* False Reports (Severe Penalty) */}
      <div className={`p-3.5 rounded-xl border shadow-xs ${
        stats.false_reports > 0
          ? 'border-status-danger/40 bg-status-danger/10 text-status-danger'
          : 'border-border bg-card text-foreground'
      }`}>
        <div className="flex items-center justify-between mb-1 opacity-80">
          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">False Reports</span>
          <AlertOctagon className="h-4 w-4" />
        </div>
        <div className="text-xl font-bold font-mono" data-testid="stat-user-false-reports">
          {stats.false_reports}
        </div>
      </div>

      {/* Flags Received */}
      <div className={`p-3.5 rounded-xl border shadow-xs ${
        stats.flags_received > 0
          ? 'border-status-warning/40 bg-status-warning/10 text-status-warning'
          : 'border-border bg-card text-foreground'
      }`}>
        <div className="flex items-center justify-between mb-1 opacity-80">
          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Flags Received</span>
          <Flag className="h-4 w-4" />
        </div>
        <div className="text-xl font-bold font-mono" data-testid="stat-user-flags-received">
          {stats.flags_received}
        </div>
      </div>
    </div>
  );
}
