'use client';

import * as React from 'react';
import { Flag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FlagsEmptyProps {
  hasFilters: boolean;
  onResetFilters: () => void;
}

export function FlagsEmpty({ hasFilters, onResetFilters }: FlagsEmptyProps) {
  return (
    <div
      className="rounded-2xl border border-dashed border-border bg-surface-elevated/20 p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto space-y-4"
      data-testid="flags-empty-state"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-elevated border border-border text-muted-foreground/60">
        <Flag className="h-6 w-6" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-bold font-sans text-foreground">
          {hasFilters ? 'No Flags Match Active Filters' : 'No Community Flags'}
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          {hasFilters
            ? 'Try broadening your search query, or clear your flag type and status filters.'
            : 'There are currently no community reports flagged for dispute or review.'}
        </p>
      </div>

      {hasFilters && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onResetFilters}
          className="text-xs gap-1.5"
          data-testid="flags-empty-reset-btn"
        >
          <X className="h-3.5 w-3.5" />
          <span>Reset All Filters</span>
        </Button>
      )}
    </div>
  );
}
