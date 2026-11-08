'use client';

import * as React from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Trash2,
  RotateCcw,
  Check,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { IncidentDetail } from '../../types';
import type { ModerationActionType } from './action-dialog';

interface ActionsBarProps {
  incident: IncidentDetail;
  onSelectAction: (action: ModerationActionType) => void;
  disabled?: boolean;
}

export function IncidentActionsBar({
  incident,
  onSelectAction,
  disabled = false,
}: ActionsBarProps) {
  const review = incident.review_status?.toLowerCase();
  const lifecycle = incident.lifecycle_status?.toLowerCase();

  // State-aware validity rules
  const canApprove = review !== 'published' && review !== 'removed';
  const canReject = review !== 'not_approved' && review !== 'removed';
  const canMarkFalse = review !== 'false_report' && review !== 'removed';
  const canRemove = review !== 'removed';
  const canRestore = review === 'removed';
  const canResolve = lifecycle === 'active';
  const canReReview = review !== 'removed';

  return (
    <div className="rounded-xl border border-accent/30 bg-surface-elevated/95 backdrop-blur-md p-3.5 shadow-lg flex flex-wrap items-center justify-between gap-2.5">
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Approve Button */}
        {canApprove && (
          <Button
            type="button"
            size="sm"
            variant="default"
            disabled={disabled}
            onClick={() => onSelectAction('approve')}
            className="h-8 text-xs font-medium"
          >
            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
            Approve
          </Button>
        )}

        {/* Reject Button */}
        {canReject && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled}
            onClick={() => onSelectAction('reject')}
            className="h-8 text-xs font-medium text-status-danger border-border hover:border-status-danger/40 hover:bg-status-danger/10"
          >
            <XCircle className="h-3.5 w-3.5 mr-1.5" />
            Reject
          </Button>
        )}

        {/* Mark False Button */}
        {canMarkFalse && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled}
            onClick={() => onSelectAction('mark_false')}
            className="h-8 text-xs font-medium text-status-warning border-border hover:border-status-warning/40 hover:bg-status-warning/10"
          >
            <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
            Mark False
          </Button>
        )}

        {/* Mark Resolved Button */}
        {canResolve && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled}
            onClick={() => onSelectAction('resolve')}
            className="h-8 text-xs font-medium text-status-success border-border hover:border-status-success/40 hover:bg-status-success/10"
          >
            <Check className="h-3.5 w-3.5 mr-1.5" />
            Mark Resolved
          </Button>
        )}

        {/* Re-run Review */}
        {canReReview && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={disabled}
            onClick={() => onSelectAction('re_review')}
            className="h-8 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5 text-accent" />
            Re-run AI
          </Button>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        {/* Remove Button */}
        {canRemove && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={disabled}
            onClick={() => onSelectAction('remove')}
            className="h-8 text-xs font-medium text-muted-foreground hover:text-status-danger"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Remove
          </Button>
        )}

        {/* Restore Button */}
        {canRestore && (
          <Button
            type="button"
            size="sm"
            variant="default"
            disabled={disabled}
            onClick={() => onSelectAction('restore')}
            className="h-8 text-xs font-medium"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            Restore
          </Button>
        )}
      </div>
    </div>
  );
}
