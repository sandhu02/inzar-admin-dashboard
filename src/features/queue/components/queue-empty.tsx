'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2, RotateCw, ArrowRight } from 'lucide-react';

interface QueueEmptyProps {
  onRefresh?: () => void;
  isFiltered?: boolean;
  onClearFilter?: () => void;
}

export function QueueEmpty({ onRefresh, isFiltered, onClearFilter }: QueueEmptyProps) {
  return (
    <div
      className="rounded-2xl border border-dashed border-border bg-surface-elevated/20 p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto space-y-4"
      data-testid="queue-empty-state"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-status-success/10 border border-status-success/20 text-status-success">
        <CheckCircle2 className="h-7 w-7" />
      </div>

      <div className="space-y-1.5">
        <h2 className="text-xl font-bold font-sans text-foreground">
          {isFiltered ? 'No Reports for Selected Category' : 'Moderation Queue is Clear'}
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {isFiltered
            ? 'There are no pending incident reports under the active category filter.'
            : 'All incoming incident reports have been reviewed. Live community reports are broadcast to the map.'}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        {isFiltered && onClearFilter && (
          <Button
            type="button"
            variant="outline"
            onClick={onClearFilter}
            className="text-xs"
            data-testid="queue-clear-filter-btn"
          >
            Show All Categories
          </Button>
        )}

        {onRefresh && (
          <Button
            type="button"
            variant="outline"
            onClick={onRefresh}
            className="text-xs gap-1.5"
            data-testid="queue-refresh-btn"
          >
            <RotateCw className="h-3.5 w-3.5" />
            <span>Check for New Reports</span>
          </Button>
        )}

        <Button asChild variant="default" className="text-xs gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90">
          <Link href="/incidents">
            <span>View All Incidents</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
