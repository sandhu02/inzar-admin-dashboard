'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, AlertTriangle, Trash2, RotateCcw, Check, Sparkles } from 'lucide-react';

export type ModerationActionType =
  | 'approve'
  | 'reject'
  | 'mark_false'
  | 'remove'
  | 'restore'
  | 'resolve'
  | 're_review';

interface ActionDialogProps {
  action: ModerationActionType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (action: ModerationActionType, reason: string, notes?: string) => Promise<void>;
  incidentTitle?: string;
}

const ACTION_CONFIGS: Record<
  ModerationActionType,
  {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    confirmText: string;
    confirmVariant: 'default' | 'destructive' | 'secondary';
    presets: string[];
  }
> = {
  approve: {
    title: 'Approve Incident',
    description: 'Verify this incident and publish it to the live public emergency map and radius alerts.',
    icon: CheckCircle2,
    confirmText: 'Approve & Publish',
    confirmVariant: 'default',
    presets: [
      'Verified ground conditions',
      'Matches official responder report',
      'High community consensus and clear media',
      'Verified via surveillance/traffic feed',
      'Other',
    ],
  },
  reject: {
    title: 'Reject Incident',
    description: 'Reject this report so it does not appear on the public map.',
    icon: XCircle,
    confirmText: 'Reject Report',
    confirmVariant: 'destructive',
    presets: [
      'Duplicate of active incident',
      'Insufficient verifiable evidence',
      'Location cannot be confirmed',
      'Inappropriate or abusive imagery',
      'Hazard has already cleared',
      'Other',
    ],
  },
  mark_false: {
    title: 'Mark as False Report',
    description: 'Designate this report as intentional disinformation or false alert. This affects the reporter trust score.',
    icon: AlertTriangle,
    confirmText: 'Mark False',
    confirmVariant: 'destructive',
    presets: [
      'Intentional hoax / false alarm',
      'Misleading / recycled old photo',
      'Controlled burn or drill mistaken for emergency',
      'Malicious report targeting entity',
      'Other',
    ],
  },
  remove: {
    title: 'Remove Incident',
    description: 'Soft-remove this incident from public views. Retained in audit records and restorable within retention window.',
    icon: Trash2,
    confirmText: 'Remove Incident',
    confirmVariant: 'destructive',
    presets: [
      'Privacy / identity violation',
      'Resolved and retention window passed',
      'Duplicate redundant post',
      'Legal / official compliance request',
      'Other',
    ],
  },
  restore: {
    title: 'Restore Incident',
    description: 'Restore this soft-removed incident back to active under-review status.',
    icon: RotateCcw,
    confirmText: 'Restore to Review',
    confirmVariant: 'default',
    presets: [
      'Erroneous removal reviewed',
      'Additional evidence provided',
      'Ground situation remains active',
      'Other',
    ],
  },
  resolve: {
    title: 'Mark Incident as Resolved',
    description: 'Close this active incident and indicate to citizens that emergency response has concluded.',
    icon: Check,
    confirmText: 'Mark Resolved',
    confirmVariant: 'default',
    presets: [
      'Emergency response completed',
      'Traffic / hazard cleared by authorities',
      'Confirmed resolved by community quorum',
      'Weather conditions normalized',
      'Other',
    ],
  },
  re_review: {
    title: 'Re-run AI Review',
    description: 'Re-trigger multi-modal AI classification and risk analysis for this incident.',
    icon: Sparkles,
    confirmText: 'Re-run Review',
    confirmVariant: 'default',
    presets: [
      'Updated imagery uploaded',
      'False-positive classifier appeal',
      'Re-check severity scoring',
      'Other',
    ],
  },
};

interface ActionDialogFormProps {
  action: ModerationActionType;
  incidentTitle?: string;
  onConfirm: (action: ModerationActionType, reason: string, notes?: string) => Promise<void>;
  onCancel: () => void;
}

function ActionDialogForm({
  action,
  incidentTitle,
  onConfirm,
  onCancel,
}: ActionDialogFormProps) {
  const config = ACTION_CONFIGS[action];
  const Icon = config.icon;

  const [presetReason, setPresetReason] = React.useState<string>(
    config.presets[0] || ''
  );
  const [customNotes, setCustomNotes] = React.useState<string>('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const effectiveReason =
    presetReason === 'Other'
      ? customNotes.trim()
      : customNotes.trim()
        ? `${presetReason} — ${customNotes.trim()}`
        : presetReason;

  const isValid = effectiveReason.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await onConfirm(action, effectiveReason, customNotes.trim() || undefined);
      onCancel();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Action failed. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <div className="flex items-center gap-2 mb-1">
          <div className="h-8 w-8 rounded-lg bg-surface-elevated flex items-center justify-center border border-border">
            <Icon className="h-4 w-4 text-accent" />
          </div>
          <DialogTitle className="text-lg font-bold font-sans">
            {config.title}
          </DialogTitle>
        </div>
        <DialogDescription className="text-xs text-muted-foreground">
          {config.description}
        </DialogDescription>
      </DialogHeader>

      {incidentTitle && (
        <div className="my-3 p-2.5 rounded-lg border border-border bg-surface-elevated/40 text-xs font-mono text-muted-foreground truncate">
          Target: <span className="text-foreground font-semibold font-sans">{incidentTitle}</span>
        </div>
      )}

      <div className="space-y-3 my-4">
        <div>
          <label className="text-xs font-mono font-semibold uppercase text-muted-foreground block mb-1.5">
            Primary Justification <span className="text-status-danger">*</span>
          </label>
          <select
            value={presetReason}
            onChange={(e) => setPresetReason(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-border bg-card text-foreground text-xs font-sans focus:outline-none focus:ring-1 focus:ring-accent"
          >
            {config.presets.map((preset) => (
              <option key={preset} value={preset}>
                {preset}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-mono font-semibold uppercase text-muted-foreground block mb-1.5">
            {presetReason === 'Other' ? (
              <>
                Required Explanation <span className="text-status-danger">*</span>
              </>
            ) : (
              'Additional Notes (Optional)'
            )}
          </label>
          <textarea
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            placeholder={
              presetReason === 'Other'
                ? 'State the specific reason for this moderation action...'
                : 'Add context, dispatch ticket numbers, or operator notes...'
            }
            rows={3}
            className="w-full p-2.5 rounded-lg border border-border bg-card text-foreground text-xs font-sans placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-accent resize-none"
          />
        </div>

        {errorMsg && (
          <div className="p-2 rounded-lg bg-status-danger/10 border border-status-danger/30 text-xs text-status-danger">
            {errorMsg}
          </div>
        )}
      </div>

      <DialogFooter className="gap-2 sm:gap-0">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant={config.confirmVariant}
          size="sm"
          disabled={!isValid || isSubmitting}
          className="font-medium"
        >
          {isSubmitting ? 'Processing...' : config.confirmText}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function ActionDialog({
  action,
  open,
  onOpenChange,
  onConfirm,
  incidentTitle,
}: ActionDialogProps) {
  if (!action) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open && (
          <ActionDialogForm
            key={action}
            action={action}
            incidentTitle={incidentTitle}
            onConfirm={onConfirm}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
