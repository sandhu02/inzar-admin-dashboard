'use client';

import * as React from 'react';
import { Smartphone, Monitor, Shield, LogOut, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatReportedTime, formatUtcTooltip } from '@/lib/format/date';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { UserSession } from '../../types';

interface UserSessionsCardProps {
  sessions: UserSession[];
  onRevokeAll: () => void;
}

export function UserSessionsCard({ sessions, onRevokeAll }: UserSessionsCardProps) {
  if (sessions.length === 0) {
    return (
      <div className="p-8 rounded-xl border border-border bg-card text-center" data-testid="user-no-sessions">
        <Shield className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm font-semibold text-foreground">No active sessions</p>
        <p className="text-xs text-muted-foreground mt-1">
          This account is not currently signed in to any mobile devices or browser sessions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="user-sessions-list">
      <div className="text-xs text-muted-foreground font-mono flex items-center justify-between pb-1">
        <span>Active Authorized Sessions ({sessions.length})</span>
        <Button
          variant="outline"
          size="sm"
          onClick={onRevokeAll}
          className="h-7 text-xs font-mono text-status-warning hover:text-status-warning border-border hover:border-status-warning/40 gap-1.5"
        >
          <LogOut className="h-3 w-3" /> Revoke All
        </Button>
      </div>

      <div className="divide-y divide-border/60 rounded-xl border border-border bg-card overflow-hidden">
        {sessions.map((sess) => {
          const isMobile =
            sess.device.toLowerCase().includes('android') ||
            sess.device.toLowerCase().includes('ios') ||
            sess.device.toLowerCase().includes('mobile');

          return (
            <div
              key={sess.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              data-testid={`session-row-${sess.id}`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg border border-border bg-surface-elevated text-accent">
                  {isMobile ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground font-sans">
                      {sess.device}
                    </span>
                    {sess.is_current && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-status-success/15 text-status-success border border-status-success/30">
                        <CheckCircle className="h-2.5 w-2.5" /> CURRENT SESSION
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-mono text-muted-foreground">
                    <span>IP: <strong className="text-foreground">{sess.ip_address}</strong></span>
                    <span>
                      Created: {formatReportedTime(sess.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-xs font-mono text-muted-foreground self-start sm:self-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-default">Last seen: {formatReportedTime(sess.last_seen_at)}</span>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <span className="font-mono text-xs">{formatUtcTooltip(sess.last_seen_at)}</span>
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
