'use client';

import * as React from 'react';
import {
  Ban,
  RotateCcw,
  AlertOctagon,
  XCircle,
  ShieldCheck,
  LogOut,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { formatReportedTime, formatUtcTooltip } from '@/lib/format/date';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { UserModerationHistoryItem } from '../../types';

interface UserModerationHistoryProps {
  history: UserModerationHistoryItem[];
}

const ACTION_CONFIGS: Record<
  string,
  { label: string; icon: typeof Ban; colorClasses: string }
> = {
  suspension: {
    label: 'Account Suspended',
    icon: Ban,
    colorClasses: 'bg-status-danger/10 text-status-danger border-status-danger/30',
  },
  unsuspension: {
    label: 'Account Reinstated',
    icon: RotateCcw,
    colorClasses: 'bg-status-success/10 text-status-success border-status-success/30',
  },
  false_report_penalty: {
    label: 'False Report Sanction',
    icon: AlertOctagon,
    colorClasses: 'bg-status-danger/10 text-status-danger border-status-danger/30',
  },
  rejection: {
    label: 'Report Rejected',
    icon: XCircle,
    colorClasses: 'bg-status-warning/10 text-status-warning border-status-warning/30',
  },
  role_change: {
    label: 'Staff Role Alteration',
    icon: ShieldCheck,
    colorClasses: 'bg-accent/10 text-accent border-accent/30',
  },
  session_revocation: {
    label: 'Sessions Force-Revoked',
    icon: LogOut,
    colorClasses: 'bg-status-warning/10 text-status-warning border-status-warning/30',
  },
};

export function UserModerationHistory({ history }: UserModerationHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="p-8 rounded-xl border border-border bg-card text-center" data-testid="user-clean-moderation-history">
        <CheckCircle2 className="h-8 w-8 text-status-success mx-auto mb-2" />
        <p className="text-sm font-semibold text-foreground">Clean Moderation Record</p>
        <p className="text-xs text-muted-foreground mt-1">
          No warnings, false report penalties, or administrative sanctions recorded for this account.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="user-moderation-history-list">
      <div className="text-xs text-muted-foreground font-mono flex items-center justify-between pb-1">
        <span>Moderation Log & Sanctions ({history.length})</span>
        <span className="text-[11px] text-muted-foreground/70">
          Immutable audit record of staff actions
        </span>
      </div>

      <div className="space-y-2.5">
        {history.map((item) => {
          const config = ACTION_CONFIGS[item.action] || {
            label: item.action.replace('_', ' ').toUpperCase(),
            icon: Shield,
            colorClasses: 'bg-surface-elevated text-foreground border-border',
          };
          const Icon = config.icon;

          return (
            <div
              key={item.id}
              className="p-3.5 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-start justify-between gap-3"
              data-testid={`moderation-history-item-${item.id}`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`p-2 rounded-lg border shrink-0 mt-0.5 ${config.colorClasses}`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-foreground font-sans">
                      {config.label}
                    </span>
                    {item.previous_value && item.new_value && (
                      <span className="font-mono text-[11px] text-muted-foreground">
                        ({item.previous_value} → {item.new_value})
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-foreground/90 font-sans leading-relaxed">
                    <strong>Reason:</strong> {item.reason}
                  </p>

                  <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                    <span>Authorized by: <strong className="text-foreground font-sans">{item.actor}</strong></span>
                  </div>
                </div>
              </div>

              <div className="self-start sm:self-center shrink-0">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="font-mono text-[11px] text-muted-foreground cursor-default">
                        {formatReportedTime(item.created_at)}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <span className="font-mono text-xs">{formatUtcTooltip(item.created_at)}</span>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
