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
import { Ban, RotateCcw, AlertTriangle } from 'lucide-react';
import type { UserListItem } from '../../types';

interface UserSuspendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserListItem | null;
  onConfirm: (reason: string, notes?: string) => Promise<void>;
  isSubmitting?: boolean;
}

const SUSPEND_PRESETS = [
  'Repeated submission of spam and fake incident reports',
  'Abusive or threatening content in incident reports',
  'Coordinated manipulation of traffic hazard alerts',
  'Violation of safety community guidelines',
  'Other',
];

const UNSUSPEND_PRESETS = [
  'Appeal accepted following moderation review',
  'Account cleared after false alarm investigation',
  'Suspension period completed with warning acknowledgement',
  'Other',
];

export function UserSuspendDialog({
  open,
  onOpenChange,
  user,
  onConfirm,
  isSubmitting = false,
}: UserSuspendDialogProps) {
  const isSuspending = !user?.is_suspended;
  const presets = isSuspending ? SUSPEND_PRESETS : UNSUSPEND_PRESETS;

  const [presetReason, setPresetReason] = React.useState<string>(presets[0]!);
  const [customNotes, setCustomNotes] = React.useState<string>('');
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const [prevOpen, setPrevOpen] = React.useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open) {
      setPresetReason(presets[0]!);
      setCustomNotes('');
      setErrorMsg(null);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = presetReason === 'Other' ? customNotes.trim() : presetReason;

    if (isSuspending && !finalReason) {
      setErrorMsg('Please specify a justification reason for this suspension.');
      return;
    }

    try {
      await onConfirm(finalReason, customNotes.trim() || undefined);
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed';
      setErrorMsg(msg);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="gap-2">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-lg border ${
                  isSuspending
                    ? 'bg-status-danger/10 text-status-danger border-status-danger/30'
                    : 'bg-status-success/10 text-status-success border-status-success/30'
                }`}
              >
                {isSuspending ? <Ban className="h-5 w-5" /> : <RotateCcw className="h-5 w-5" />}
              </div>
              <div>
                <DialogTitle className="font-sans text-base font-bold text-foreground">
                  {isSuspending ? 'Suspend User Account' : 'Reinstate User Account'}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Target: <span className="text-foreground font-semibold font-sans">{user.display_name}</span>{' '}
                  <span className="font-mono text-[11px] text-muted-foreground/80">({user.id})</span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3.5 my-4">
            {isSuspending && (
              <div className="p-3 rounded-lg bg-status-danger/10 border border-status-danger/30 flex items-start gap-2 text-xs text-status-danger leading-relaxed">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  Suspending this user will immediately terminate all active sessions, invalidate tokens, and prevent further incident reporting.
                </span>
              </div>
            )}

            <div>
              <label className="text-xs font-mono font-semibold uppercase text-muted-foreground block mb-1.5">
                Primary Justification <span className="text-status-danger">*</span>
              </label>
              <select
                value={presetReason}
                onChange={(e) => setPresetReason(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-surface text-foreground text-xs font-sans focus:outline-none focus:ring-1 focus:ring-accent"
              >
                {presets.map((preset) => (
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
                    ? 'State the specific policy reason for this moderation action...'
                    : 'Provide administrative context or internal investigation notes...'
                }
                rows={3}
                className="w-full p-2.5 rounded-lg border border-border bg-surface text-foreground text-xs font-sans placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-accent resize-none"
              />
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-status-danger/10 border border-status-danger/30 text-xs text-status-danger">
                {errorMsg}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={isSuspending ? 'destructive' : 'default'}
              size="sm"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Processing...'
                : isSuspending
                  ? 'Confirm Suspension'
                  : 'Reinstate Account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
