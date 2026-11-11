'use client';

import * as React from 'react';
import { useFlags } from '../hooks/use-flags';
import { FlagsStatsBar } from './flags-stats-bar';
import { FlagsFilterBar } from './flags-filter-bar';
import { FlagGroupCard } from './flag-group-card';
import { FlagsEmpty } from './flags-empty';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorBanner } from '@/components/ui/error-banner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import type { FlagGroup } from '../types';

export function FlagsView() {
  const {
    groups,
    awaitingCount,
    distinctIncidentsCount,
    isLoading,
    isError,
    error,
    refetch,
    params,
    updateFilters,
    dismissFlag,
    moveToReview,
    markFalse,
  } = useFlags();

  const [markFalseGroup, setMarkFalseGroup] = React.useState<FlagGroup | null>(null);
  const [markFalseReason, setMarkFalseReason] = React.useState('');
  const [markFalseError, setMarkFalseError] = React.useState<string | null>(null);
  const [isSubmittingFalse, setIsSubmittingFalse] = React.useState(false);

  const hasActiveFilters = Boolean(
    (params.type && params.type !== 'all') ||
      (params.status && params.status !== 'all') ||
      params.q
  );

  const handleResetFilters = () => {
    updateFilters({ type: 'all', status: 'all', q: '' });
  };

  const handleConfirmMarkFalse = async () => {
    if (!markFalseGroup) return;
    if (!markFalseReason.trim()) {
      setMarkFalseError('A reason is required to mark report as false.');
      return;
    }

    setIsSubmittingFalse(true);
    try {
      await markFalse({
        incidentId: markFalseGroup.incident_id,
        reason: markFalseReason.trim(),
      });
      setMarkFalseGroup(null);
      setMarkFalseReason('');
      setMarkFalseError(null);
    } catch (err) {
      setMarkFalseError(
        err instanceof Error ? err.message : 'Failed to mark incident false.'
      );
    } finally {
      setIsSubmittingFalse(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="flags-view-container">
      {/* Top Header */}
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl md:text-3xl font-bold font-sans text-foreground">
          Community Flags
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Review community-reported disputes, inaccuracies, and abuse reports grouped by incident.
        </p>
      </div>

      {/* KPI Stats Bar */}
      <FlagsStatsBar
        awaitingCount={awaitingCount}
        distinctIncidentsCount={distinctIncidentsCount}
        activeStatus={params.status || 'all'}
        onSelectStatus={(status) => updateFilters({ status })}
      />

      {/* Filter Toolbar */}
      <FlagsFilterBar
        type={params.type || 'all'}
        status={params.status || 'all'}
        category={params.category || 'all'}
        search={params.q || ''}
        onTypeChange={(type) => updateFilters({ type })}
        onStatusChange={(status) => updateFilters({ status })}
        onCategoryChange={(category) => updateFilters({ category })}
        onSearchChange={(q) => updateFilters({ q })}
        onReset={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Flag Groups List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-surface p-5 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <ErrorBanner
          error={error instanceof Error ? error.message : 'Failed to load community flags.'}
          title="Error Loading Flags"
          onRetry={() => refetch()}
        />
      ) : groups.length === 0 ? (
        <FlagsEmpty hasFilters={hasActiveFilters} onResetFilters={handleResetFilters} />
      ) : (
        <div className="space-y-4" data-testid="flags-groups-list">
          {groups.map((group) => (
            <FlagGroupCard
              key={group.incident_id}
              group={group}
              onDismissFlag={async (flagId) => {
                await dismissFlag({ flagId });
              }}
              onMoveToReview={async (incidentId) => {
                await moveToReview({ incidentId });
              }}
              onOpenMarkFalse={(targetGroup) => {
                setMarkFalseGroup(targetGroup);
                setMarkFalseReason('Community dispute confirmed inaccurate content');
                setMarkFalseError(null);
              }}
            />
          ))}
        </div>
      )}

      {/* Mark False Confirmation Dialog */}
      <Dialog
        open={Boolean(markFalseGroup)}
        onOpenChange={(open) => !open && setMarkFalseGroup(null)}
      >
        <DialogContent className="sm:max-w-md bg-surface border-border text-foreground">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-status-warning/10 border border-status-warning/20 text-status-warning">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <DialogTitle className="text-base font-bold font-sans">
                Mark as False Report
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground truncate">
              {markFalseGroup?.incident_title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <p className="text-xs text-muted-foreground">
              Marking an incident as false report removes it from the public map and logs a strike against the reporter&apos;s moderation record.
            </p>

            <div>
              <label
                htmlFor="mark-false-reason-input"
                className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1.5"
              >
                Required Reason
              </label>
              <textarea
                id="mark-false-reason-input"
                value={markFalseReason}
                onChange={(e) => {
                  setMarkFalseReason(e.target.value);
                  setMarkFalseError(null);
                }}
                rows={3}
                className="w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent resize-none"
                placeholder="State why this report is marked as false..."
                data-testid="mark-false-reason-textarea"
              />
            </div>

            {markFalseError && (
              <p className="text-xs text-status-danger font-mono" role="alert">
                {markFalseError}
              </p>
            )}
          </div>

          <DialogFooter className="flex flex-row justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMarkFalseGroup(null)}
              disabled={isSubmittingFalse}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleConfirmMarkFalse}
              disabled={isSubmittingFalse}
              className="text-xs"
              data-testid="confirm-mark-false-btn"
            >
              {isSubmittingFalse ? 'Confirming...' : 'Mark as False'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
