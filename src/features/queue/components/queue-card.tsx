'use client';

import * as React from 'react';
import { CategoryChip } from '@/components/status/category-chip';
import { StatusBadge } from '@/components/status/status-badge';
import { Button } from '@/components/ui/button';
import { QueuePhotoViewer } from './queue-photo-viewer';
import {
  MapPin,
  Clock,
  Check,
  Ban,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Flag,
  ShieldCheck,
} from 'lucide-react';
import type { QueueItem } from '../types';
import { formatAge, formatReportedTime, formatUtcTooltip } from '@/lib/format/date';

interface QueueCardProps {
  item: QueueItem;
  currentIndex: number;
  totalCount: number;
  onApprove: () => void;
  onOpenReject: () => void;
  onOpenMarkFalse: () => void;
  onNext: () => void;
  onPrevious: () => void;
  isSubmitting?: boolean;
}

export function QueueCard({
  item,
  currentIndex,
  totalCount,
  onApprove,
  onOpenReject,
  onOpenMarkFalse,
  onNext,
  onPrevious,
  isSubmitting = false,
}: QueueCardProps) {
  const flags = item.flags || [];
  const fuzzedLat = item.fuzzed_location?.lat;
  const fuzzedLng = item.fuzzed_location?.lng;

  return (
    <article
      className="rounded-2xl border border-border bg-surface shadow-md overflow-hidden focus:outline-none"
      data-testid="queue-active-card"
      tabIndex={-1}
      aria-label={`Moderation Item ${currentIndex + 1} of ${totalCount}: ${item.title}`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-border">
        {/* Left Column: Photo Section (5 cols on lg) */}
        <div className="lg:col-span-5 p-4 sm:p-5 flex flex-col justify-between bg-surface-elevated/20">
          <QueuePhotoViewer
            thumbnailUrl={item.thumbnail_url ?? null}
            mediaUrls={item.media_urls}
            title={item.title}
          />

          {/* Location Context under photo */}
          <div className="mt-4 p-3 rounded-xl bg-surface-elevated border border-border/60 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 text-foreground font-medium">
              <MapPin className="h-3.5 w-3.5 text-accent shrink-0" />
              <span className="truncate">{item.place_label || 'Reported Location'}</span>
            </div>
            {typeof fuzzedLat === 'number' && typeof fuzzedLng === 'number' && (
              <div className="text-[11px] font-mono text-muted-foreground pl-5">
                Approx. {fuzzedLat.toFixed(4)}° N, {fuzzedLng.toFixed(4)}° E
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Metadata & Decision Center (7 cols on lg) */}
        <div className="lg:col-span-7 p-5 sm:p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Header: Chips & Timestamps */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <CategoryChip category={item.category} />
                <StatusBadge status={item.review_status} />
                {item.verification_label && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-info/10 text-status-info border border-info/20">
                    <ShieldCheck className="h-3 w-3" />
                    {item.verification_label}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                <Clock className="h-3.5 w-3.5" />
                <span title={formatUtcTooltip(item.reported_at)}>
                  {formatAge(item.reported_at)} ({formatReportedTime(item.reported_at)})
                </span>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold font-sans text-foreground tracking-tight">
                {item.title}
              </h2>
              <p className="text-sm text-foreground/80 leading-relaxed font-sans">
                {item.description || 'No detailed narrative provided by the reporter.'}
              </p>
            </div>

            {/* Flags Information (if any exist) */}
            {(flags.length > 0 || (item.flags_count ?? 0) > 0) && (
              <div
                className="rounded-xl border border-status-danger/30 bg-status-danger/5 p-3.5 space-y-2"
                data-testid="queue-flags-callout"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-status-danger">
                    <Flag className="h-3.5 w-3.5" />
                    <span>
                      {flags.length || item.flags_count} Community Flag
                      {(flags.length || item.flags_count) === 1 ? '' : 's'} Logged
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    Action required
                  </span>
                </div>

                <div className="space-y-1.5">
                  {flags.map((flag) => (
                    <div
                      key={flag.id}
                      className="text-xs text-foreground/90 pl-5 border-l-2 border-status-danger/40 py-0.5"
                    >
                      <span className="font-semibold capitalize text-status-danger">
                        {flag.type}:
                      </span>{' '}
                      {flag.reason}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Center Bar */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Decision Buttons */}
              <div className="grid grid-cols-3 gap-2 flex-1">
                <Button
                  type="button"
                  variant="default"
                  onClick={onApprove}
                  disabled={isSubmitting}
                  className="gap-1.5 h-10 text-xs font-semibold bg-accent text-accent-foreground hover:bg-accent/90"
                  data-testid="queue-approve-btn"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Approve</span>
                  <kbd className="hidden md:inline-block ml-1 px-1.5 py-0.5 rounded bg-black/25 text-[10px] font-mono font-bold">
                    A
                  </kbd>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={onOpenReject}
                  disabled={isSubmitting}
                  className="gap-1.5 h-10 text-xs font-semibold border-border text-foreground hover:bg-status-danger/10 hover:text-status-danger hover:border-status-danger/30"
                  data-testid="queue-reject-btn"
                >
                  <Ban className="h-3.5 w-3.5" />
                  <span>Reject</span>
                  <kbd className="hidden md:inline-block ml-1 px-1.5 py-0.5 rounded bg-surface-elevated text-[10px] font-mono font-bold border border-border">
                    R
                  </kbd>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={onOpenMarkFalse}
                  disabled={isSubmitting}
                  className="gap-1.5 h-10 text-xs font-semibold border-border text-foreground hover:bg-status-warning/10 hover:text-status-warning hover:border-status-warning/30"
                  data-testid="queue-mark-false-btn"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>False</span>
                  <kbd className="hidden md:inline-block ml-1 px-1.5 py-0.5 rounded bg-surface-elevated text-[10px] font-mono font-bold border border-border">
                    F
                  </kbd>
                </Button>
              </div>

              {/* Navigation Arrows */}
              <div className="flex items-center justify-end gap-1.5 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={onPrevious}
                  disabled={currentIndex === 0 || isSubmitting}
                  aria-label="Previous incident (K)"
                  className="h-10 w-10"
                  data-testid="queue-prev-btn"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={onNext}
                  disabled={currentIndex >= totalCount - 1 || isSubmitting}
                  aria-label="Next incident (J)"
                  className="h-10 w-10"
                  data-testid="queue-next-btn"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Micro Navigation State */}
            <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono px-1">
              <span>
                Report {currentIndex + 1} of {totalCount}
              </span>
              <span>
                Use <kbd className="font-bold text-foreground">J</kbd>/
                <kbd className="font-bold text-foreground">K</kbd> to switch
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
