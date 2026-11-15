'use client';

import * as React from 'react';
import { Users, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UsersEmptyProps {
  hasFilters?: boolean;
  onResetFilters?: () => void;
}

export function UsersEmpty({ hasFilters, onResetFilters }: UsersEmptyProps) {
  return (
    <div
      className="flex flex-col items-center justify-center p-12 text-center border border-border/80 rounded-xl bg-card"
      data-testid="users-empty-state"
    >
      <div className="h-12 w-12 rounded-full bg-surface-elevated border border-border flex items-center justify-center text-muted-foreground mb-4">
        <Users className="h-6 w-6" />
      </div>

      <h3 className="text-base font-semibold text-foreground mb-1 font-sans">
        No accounts found
      </h3>

      <p className="text-xs text-muted-foreground max-w-sm mb-5 leading-relaxed font-sans">
        {hasFilters
          ? 'No user accounts match your active search and filter criteria. Try adjusting or clearing your filters.'
          : 'There are currently no user accounts registered in the database.'}
      </p>

      {hasFilters && onResetFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onResetFilters}
          className="gap-2 font-mono text-xs"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset All Filters</span>
        </Button>
      )}
    </div>
  );
}
