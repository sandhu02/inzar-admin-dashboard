'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, AlertTriangle, Trash2, X } from 'lucide-react';

interface BulkActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkAction: (action: string) => void;
}

export function IncidentBulkActions({
  selectedCount,
  onClearSelection,
  onBulkAction,
}: BulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-accent/30 bg-surface-elevated shadow-md animate-in fade-in slide-in-from-top-2 duration-150">
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs font-bold text-accent px-2 py-0.5 rounded bg-accent/15 uppercase tracking-wider">
          {selectedCount} SELECTED
        </span>
        <button
          type="button"
          onClick={onClearSelection}
          className="text-xs font-mono text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
        >
          <X className="h-3 w-3" />
          Deselect
        </button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="default"
          onClick={() => onBulkAction('approve')}
          className="h-8 text-xs font-medium"
        >
          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
          Approve
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => onBulkAction('reject')}
          className="h-8 text-xs font-medium text-status-danger border-border hover:border-status-danger/40"
        >
          <XCircle className="h-3.5 w-3.5 mr-1" />
          Reject
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => onBulkAction('mark_false')}
          className="h-8 text-xs font-medium text-status-warning border-border hover:border-status-warning/40"
        >
          <AlertTriangle className="h-3.5 w-3.5 mr-1" />
          Mark false
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => onBulkAction('remove')}
          className="h-8 text-xs font-medium text-muted-foreground hover:text-status-danger border-border"
        >
          <Trash2 className="h-3.5 w-3.5 mr-1" />
          Remove
        </Button>
      </div>
    </div>
  );
}
