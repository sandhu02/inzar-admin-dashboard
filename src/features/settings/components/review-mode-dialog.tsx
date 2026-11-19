'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import type { ReviewMode } from '../types';

interface ReviewModeConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetMode: ReviewMode;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ReviewModeConfirmDialog({
  open,
  onOpenChange,
  targetMode,
  onConfirm,
  onCancel,
}: ReviewModeConfirmDialogProps) {
  const isAuto = targetMode === 'auto_approve';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-surface border-border p-6 text-foreground">
        <DialogHeader className="pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-full ${
                isAuto
                  ? 'bg-status-warning/15 text-status-warning'
                  : 'bg-accent/15 text-accent'
              }`}
            >
              {isAuto ? (
                <AlertTriangle className="h-5 w-5" />
              ) : (
                <ShieldCheck className="h-5 w-5" />
              )}
            </div>
            <div>
              <DialogTitle className="text-lg font-bold font-sans text-foreground">
                {isAuto
                  ? 'Switch to Auto-Approve Review Mode?'
                  : 'Switch to Manual Review Mode?'}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                High-impact intake pipeline transition
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4 space-y-3 text-xs leading-relaxed text-muted-foreground">
          {isAuto ? (
            <>
              <p>
                In <strong className="text-status-warning">Auto-Approve</strong> mode, citizen incident reports are published immediately to the live public map upon submission and automated checks.
              </p>
              <div className="p-3 rounded-lg border border-status-warning/30 bg-status-warning/10 text-status-warning text-[11px] space-y-1">
                <span className="font-bold block uppercase tracking-wider">
                  Operational Safety Impact:
                </span>
                <p className="text-foreground">
                  Reports will bypass human moderator review unless flagged by community members. Use this setting only when automated intake filters are tuned.
                </p>
              </div>
            </>
          ) : (
            <>
              <p>
                In <strong className="text-accent">Manual</strong> review mode, all incoming incident reports are placed into the moderation queue (<code className="font-mono text-accent">/queue</code>) and require explicit staff sign-off before becoming visible on the public map.
              </p>
              <div className="p-3 rounded-lg border border-border/80 bg-surface-elevated/50 text-[11px] space-y-1">
                <span className="font-bold text-foreground block uppercase tracking-wider">
                  Verification Safeguard:
                </span>
                <p>
                  Prevents false or unverified reports from reaching nearby citizens, with minor latency for emergency alerts pending queue processing.
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="pt-3 border-t border-border flex items-center justify-between sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onCancel();
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className={
              isAuto
                ? 'bg-status-warning text-black hover:bg-status-warning/90 font-semibold'
                : 'bg-accent text-accent-foreground hover:bg-accent/90 font-semibold'
            }
          >
            Confirm Mode Change
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
