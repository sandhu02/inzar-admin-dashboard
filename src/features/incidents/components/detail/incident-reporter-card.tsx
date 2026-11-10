'use client';

import * as React from 'react';
import { User, ShieldCheck, Lock, Eye, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ReporterProfile } from '../../types';

interface ReporterCardProps {
  reporter?: ReporterProfile | null;
  isRevealed?: boolean;
  revealReason?: string | null;
  onOpenReveal: () => void;
}

export function IncidentReporterCard({
  reporter,
  isRevealed = false,
  revealReason,
  onOpenReveal,
}: ReporterCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="p-3.5 border-b border-border bg-surface-elevated/40 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-accent" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
            Reporter Profile
          </span>
        </div>
        <div>
          {isRevealed ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-status-warning/15 text-status-warning border border-status-warning/30">
              <Eye className="h-3 w-3" />
              IDENTITY REVEALED
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-surface-elevated text-muted-foreground border border-border">
              <ShieldCheck className="h-3 w-3 text-status-info" />
              PRIVACY PROTECTED
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        {!isRevealed ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="text-sm font-sans font-medium text-foreground">
                Anonymous Whistleblower Protection
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                Reporter identity is masked in accordance with Privacy Rule 4. Staff members may reveal identity only when investigating fraud, legal requests, or serious abuse.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenReveal}
              className="h-8 text-xs font-medium shrink-0 border-border hover:border-status-warning/50 text-foreground"
            >
              <Lock className="h-3.5 w-3.5 mr-1.5 text-status-warning" />
              Reveal Identity
            </Button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {/* Identity Info */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-accent/15 border border-accent/30 text-accent font-bold font-mono text-sm flex items-center justify-center">
                  {reporter?.display_name
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase() || 'US'}
                </div>
                <div>
                  <h4 className="text-sm font-sans font-semibold text-foreground">
                    {reporter?.display_name || 'Verified Reporter'}
                  </h4>
                  <p className="text-xs font-mono text-muted-foreground mt-0.5">
                    {reporter?.email || 'reporter@example.com'}
                  </p>
                </div>
              </div>

              {/* Reporter ID Badge */}
              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-surface-elevated text-foreground border border-border">
                  <User className="h-3.5 w-3.5 text-accent" />
                  {reporter?.id || 'usr_unknown'}
                </span>
                {revealReason && (
                  <span
                    className="block text-[10px] font-mono text-muted-foreground mt-0.5 max-w-[140px] truncate"
                    title={revealReason}
                  >
                    Reason: {revealReason}
                  </span>
                )}
              </div>
            </div>

            {/* Reporter Metrics */}
            <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg border border-border bg-surface-elevated/40 text-center">
              <div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground block">
                  Reports
                </span>
                <span className="text-sm font-mono font-bold text-foreground">
                  {reporter?.incidents_count ?? 1}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground block">
                  Flags Received
                </span>
                <span className={`text-sm font-mono font-bold ${
                  (reporter?.flags_received_count ?? 0) > 0
                    ? 'text-status-warning'
                    : 'text-status-success'
                }`}>
                  {reporter?.flags_received_count ?? 0}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground block">
                  Account Age
                </span>
                <span className="text-xs font-mono font-medium text-foreground flex items-center justify-center gap-1 mt-0.5">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  {reporter?.account_created_at
                    ? new Date(reporter.account_created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        year: 'numeric',
                      })
                    : '2026'}
                </span>
              </div>
            </div>

            {/* Audit Notice */}
            <div className="p-2 rounded-md bg-status-warning/10 border border-status-warning/20 flex items-center justify-between text-[11px] font-mono text-status-warning">
              <span className="truncate pr-2">
                <strong>Audited reveal:</strong> &quot;{revealReason}&quot;
              </span>
              <span className="shrink-0 text-[10px] opacity-75">Recorded in Log</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
