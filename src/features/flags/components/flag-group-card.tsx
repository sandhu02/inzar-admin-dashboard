'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CategoryChip } from '@/components/status/category-chip';
import { StatusBadge } from '@/components/status/status-badge';
import { Button } from '@/components/ui/button';
import {
  ExternalLink,
  RotateCcw,
  AlertTriangle,
  Users,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatAge, formatReportedTime, formatUtcTooltip } from '@/lib/format/date';
import type { FlagGroup, FlagType, Incident } from '../types';

interface FlagGroupCardProps {
  group: FlagGroup;
  onDismissFlag: (flagId: string) => Promise<void>;
  onMoveToReview: (incidentId: string) => Promise<void>;
  onOpenMarkFalse: (group: FlagGroup) => void;
  isProcessing?: boolean;
}

function getFlagTypeBadge(type: FlagType) {
  if (type === 'abuse') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-status-danger/10 text-status-danger border border-status-danger/20">
        Abuse / Spam
      </span>
    );
  }
  if (type === 'incorrect') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-status-warning/10 text-status-warning border border-status-warning/20">
        Incorrect Info
      </span>
    );
  }
  if (type === 'resolved') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-status-info/10 text-status-info border border-info/20">
        Already Resolved
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-surface-elevated text-muted-foreground border border-border">
      {type}
    </span>
  );
}

export function FlagGroupCard({
  group,
  onDismissFlag,
  onMoveToReview,
  onOpenMarkFalse,
  isProcessing = false,
}: FlagGroupCardProps) {
  const [expanded, setExpanded] = React.useState(true);
  const [dismissingFlagId, setDismissingFlagId] = React.useState<string | null>(null);

  const handleDismiss = async (flagId: string) => {
    setDismissingFlagId(flagId);
    try {
      await onDismissFlag(flagId);
    } finally {
      setDismissingFlagId(null);
    }
  };

  const pendingFlagsCount = group.flags.filter((f) => f.status === 'pending').length;

  return (
    <div
      className="rounded-xl border border-border bg-surface shadow-xs overflow-hidden transition-colors"
      data-testid={`flag-group-${group.incident_id}`}
    >
      {/* Top Banner: Incident Summary */}
      <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-elevated/30 border-b border-border">
        <div className="flex items-start gap-3.5">
          {/* Incident Thumbnail */}
          <div className="relative h-14 w-14 shrink-0 rounded-lg overflow-hidden border border-border bg-surface-elevated flex items-center justify-center">
            {group.incident_thumbnail_url ? (
              <Image
                src={group.incident_thumbnail_url}
                alt={group.incident_title}
                fill
                sizes="56px"
                className="object-cover"
              />
            ) : (
              <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
            )}
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <CategoryChip category={group.category} />
              <StatusBadge status={group.review_status as Incident['review_status']} />
              {pendingFlagsCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-status-danger/15 text-status-danger border border-status-danger/30">
                  {pendingFlagsCount} PENDING
                </span>
              )}
            </div>

            <h2 className="text-base font-bold font-sans text-foreground truncate max-w-xl">
              {group.incident_title}
            </h2>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-accent shrink-0" />
                <span>{group.place_label || 'Location'}</span>
              </div>
              <div className="flex items-center gap-1 font-mono">
                <Clock className="h-3 w-3 shrink-0" />
                <span title={formatUtcTooltip(group.reported_at)}>
                  {formatAge(group.reported_at)} ({formatReportedTime(group.reported_at)})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Flagger Stats & Expand Toggle */}
        <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-border/50">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-elevated border border-border text-xs font-mono">
            <Users className="h-3.5 w-3.5 text-accent" />
            <span className="font-semibold text-foreground">
              {group.distinct_flaggers_count} Distinct Flagger
              {group.distinct_flaggers_count === 1 ? '' : 's'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="p-1.5 rounded-md hover:bg-surface-elevated text-muted-foreground hover:text-foreground transition-colors"
            aria-label={expanded ? 'Collapse flags' : 'Expand flags'}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Flags Section */}
      {expanded && (
        <div className="p-4 sm:p-5 space-y-4">
          <div className="space-y-2.5">
            <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Community Dispute Records ({group.flags.length})
            </h3>

            <div className="space-y-2">
              {group.flags.map((flag) => {
                const isDismissed = flag.status === 'dismissed';
                return (
                  <div
                    key={flag.id}
                    className={cn(
                      'flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border text-xs transition-colors',
                      isDismissed
                        ? 'border-border/40 bg-surface-elevated/20 opacity-60'
                        : 'border-border bg-surface-elevated/60'
                    )}
                    data-testid={`flag-item-${flag.id}`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getFlagTypeBadge(flag.type)}
                        <span className="text-[11px] font-mono text-muted-foreground" title={formatUtcTooltip(flag.created_at)}>
                          {formatAge(flag.created_at)}
                        </span>
                        {isDismissed && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground italic">
                            <CheckCircle className="h-3 w-3 text-status-success" />
                            Dismissed
                          </span>
                        )}
                      </div>
                      <p className="text-foreground font-sans text-xs">
                        {flag.reason}
                      </p>
                    </div>

                    {!isDismissed && (
                      <div className="self-end sm:self-center shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDismiss(flag.id)}
                          disabled={dismissingFlagId === flag.id || isProcessing}
                          className="h-7 px-2.5 text-[11px] border-border text-muted-foreground hover:text-foreground"
                          data-testid={`dismiss-flag-btn-${flag.id}`}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          <span>{dismissingFlagId === flag.id ? 'Dismissing...' : 'Dismiss Flag'}</span>
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Footer for Incident */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="text-xs gap-1.5 border-border"
              data-testid={`open-incident-btn-${group.incident_id}`}
            >
              <Link href={`/incidents/${group.incident_id}`}>
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Open Incident</span>
              </Link>
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onMoveToReview(group.incident_id)}
                disabled={isProcessing || group.review_status === 'under_review'}
                className="text-xs gap-1.5 border-border text-foreground hover:bg-surface-elevated"
                data-testid={`move-review-btn-${group.incident_id}`}
              >
                <RotateCcw className="h-3.5 w-3.5 text-accent" />
                <span>Move to Review</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenMarkFalse(group)}
                disabled={isProcessing || group.review_status === 'false_report'}
                className="text-xs gap-1.5 border-status-warning/30 text-status-warning hover:bg-status-warning/10"
                data-testid={`mark-false-btn-${group.incident_id}`}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Mark False</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
