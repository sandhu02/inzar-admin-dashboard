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
import { CheckCircle2, XCircle, AlertTriangle, Trash2, AlertOctagon } from 'lucide-react';
import type { BulkActionType, BulkActionFailure } from '../types';

const BULK_ACTION_CONFIGS: Record<
  BulkActionType,
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
    title: 'Bulk Approve Incidents',
    description: 'Verify and publish the selected incidents to the public live emergency map.',
    icon: CheckCircle2,
    confirmText: 'Approve Selected',
    confirmVariant: 'default',
    presets: [
      'Verified ground conditions',
      'High community consensus and clear media',
      'Verified via emergency services dispatch',
      'Area surveillance confirms incident',
      'Other',
    ],
  },
  reject: {
    title: 'Bulk Reject Incidents',
    description: 'Reject the selected reports so they do not appear on the public map.',
    icon: XCircle,
    confirmText: 'Reject Selected',
    confirmVariant: 'destructive',
    presets: [
      'Duplicate reports',
      'Insufficient verifiable evidence',
      'Hazard has already cleared',
      'Location cannot be confirmed',
      'Other',
    ],
  },
  mark_false: {
    title: 'Bulk Mark as False Reports',
    description: 'Designate the selected reports as intentional disinformation or false alarms.',
    icon: AlertTriangle,
    confirmText: 'Mark False',
    confirmVariant: 'destructive',
    presets: [
      'Intentional hoax / false alarm',
      'Misleading / recycled old photo',
      'Controlled drill mistaken for emergency',
      'Malicious report targeting entity',
      'Other',
    ],
  },
  remove: {
    title: 'Bulk Remove Incidents',
    description: 'Soft-remove selected incidents from public views. Retained for audit and can be restored.',
    icon: Trash2,
    confirmText: 'Remove Selected',
    confirmVariant: 'destructive',
    presets: [
      'Privacy / identity violation',
      'Duplicate redundant post',
      'Legal / official compliance request',
      'Hazard cleared and retention window passed',
      'Other',
    ],
  },
};

interface BulkActionDialogProps {
  action: BulkActionType | null;
  selectedCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (action: BulkActionType, reason: string) => Promise<void>;
}

export function BulkActionDialog({
  action,
  selectedCount,
  open,
  onOpenChange,
  onConfirm,
}: BulkActionDialogProps) {
  if (!action) return null;
  const config = BULK_ACTION_CONFIGS[action];
  const Icon = config.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open && (
          <BulkActionForm
            action={action}
            selectedCount={selectedCount}
            config={config}
            Icon={Icon}
            onConfirm={onConfirm}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function BulkActionForm({
  action,
  selectedCount,
  config,
  Icon,
  onConfirm,
  onCancel,
}: {
  action: BulkActionType;
  selectedCount: number;
  config: (typeof BULK_ACTION_CONFIGS)[BulkActionType];
  Icon: React.ComponentType<{ className?: string }>;
  onConfirm: (action: BulkActionType, reason: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [presetReason, setPresetReason] = React.useState<string>(config.presets[0] || '');
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
      await onConfirm(action, effectiveReason);
      onCancel();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Bulk action failed. Please try again.');
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
            {config.title} ({selectedCount})
          </DialogTitle>
        </div>
        <DialogDescription className="text-xs text-muted-foreground">
          {config.description}
        </DialogDescription>
      </DialogHeader>

      <div className="my-3 p-2.5 rounded-lg border border-border bg-surface-elevated/40 text-xs font-mono text-muted-foreground">
        Targeting <span className="text-accent font-bold">{selectedCount}</span> selected incident records.
      </div>

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
                ? 'Specify the justification for this bulk action...'
                : 'Add context, batch ticket numbers, or operator notes...'
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
          {isSubmitting ? 'Processing...' : `${config.confirmText} (${selectedCount})`}
        </Button>
      </DialogFooter>
    </form>
  );
}

interface BulkPartialFailureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  succeededCount: number;
  failures: BulkActionFailure[];
  action: BulkActionType;
}

export function BulkPartialFailureDialog({
  open,
  onOpenChange,
  succeededCount,
  failures,
  action,
}: BulkPartialFailureDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-lg bg-status-warning/15 flex items-center justify-center border border-status-warning/30 text-status-warning">
              <AlertOctagon className="h-4 w-4" />
            </div>
            <DialogTitle className="text-lg font-bold font-sans">
              Bulk {action.replace('_', ' ').toUpperCase()} Results
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            The bulk operation completed with partial success. Some items could not be updated due to state conflicts.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 my-3">
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-surface-elevated/40 text-xs font-mono">
            <div className="flex-1">
              <span className="text-muted-foreground">Succeeded: </span>
              <span className="text-status-success font-bold">{succeededCount} items</span>
            </div>
            <div className="flex-1">
              <span className="text-muted-foreground">Failed: </span>
              <span className="text-status-danger font-bold">{failures.length} items</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-mono font-semibold uppercase text-muted-foreground">
              Failed Items & Conflict Details
            </h4>
            <div
              className="max-h-56 overflow-y-auto space-y-2 pr-1 border border-border rounded-lg p-2 bg-card"
              data-testid="bulk-partial-failures-list"
            >
              {failures.map((f) => (
                <div
                  key={f.id}
                  className="p-2.5 rounded border border-status-danger/20 bg-status-danger/5 text-xs font-mono space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{f.id}</span>
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-status-danger/20 text-status-danger font-semibold">
                      {f.error?.code || 'ERROR'}
                    </span>
                  </div>
                  <p className="text-[11px] font-sans text-muted-foreground">
                    {f.error?.message || 'Action could not be applied.'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Acknowledge & Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
