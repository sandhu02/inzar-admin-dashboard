'use client';

import * as React from 'react';
import { Flag, AlertOctagon, CheckCircle2, AlertTriangle, Users } from 'lucide-react';
import { formatReportedTime } from '@/lib/format/date';
import type { IncidentFlag } from '../../types';

interface FlagsListProps {
  flags?: IncidentFlag[];
}

export function IncidentFlagsList({ flags = [] }: FlagsListProps) {
  if (flags.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 space-y-2">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <Flag className="h-4 w-4 text-accent" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
            Community Moderation Flags (0)
          </span>
        </div>
        <p className="text-xs text-muted-foreground py-2 text-center">
          No community members have flagged this incident.
        </p>
      </div>
    );
  }

  const getFlagBadge = (type: IncidentFlag['type']) => {
    switch (type) {
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-mono bg-status-success/15 text-status-success border border-status-success/30 font-medium">
            <CheckCircle2 className="h-3 w-3" />
            RESOLVED
          </span>
        );
      case 'abuse':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-mono bg-status-danger/15 text-status-danger border border-status-danger/30 font-medium">
            <AlertOctagon className="h-3 w-3" />
            ABUSE
          </span>
        );
      case 'incorrect':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-mono bg-status-warning/15 text-status-warning border border-status-warning/30 font-medium">
            <AlertTriangle className="h-3 w-3" />
            INACCURATE
          </span>
        );
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Flag className="h-4 w-4 text-status-danger" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
            Community Flags ({flags.length})
          </span>
        </div>
        <span className="text-[11px] font-mono text-muted-foreground">
          Pending Moderator Review
        </span>
      </div>

      <div className="space-y-2.5">
        {flags.map((flag) => (
          <div
            key={flag.id}
            className="p-3 rounded-lg border border-border bg-surface-elevated/40 space-y-1.5"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {getFlagBadge(flag.type)}
                {flag.flagger_count && flag.flagger_count > 1 && (
                  <span className="text-[11px] font-mono text-muted-foreground inline-flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {flag.flagger_count} citizens
                  </span>
                )}
              </div>
              <time
                dateTime={flag.created_at}
                className="text-[11px] font-mono text-muted-foreground"
              >
                {formatReportedTime(flag.created_at)}
              </time>
            </div>

            <p className="text-xs font-sans text-foreground leading-relaxed">
              &ldquo;{flag.reason}&rdquo;
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
