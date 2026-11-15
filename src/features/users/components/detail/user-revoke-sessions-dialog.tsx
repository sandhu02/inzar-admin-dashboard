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
import { LogOut, AlertTriangle } from 'lucide-react';
import type { UserListItem } from '../../types';

interface UserRevokeSessionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserListItem | null;
  onConfirm: (reason?: string) => Promise<void>;
  isSubmitting?: boolean;
}

export function UserRevokeSessionsDialog({
  open,
  onOpenChange,
  user,
  onConfirm,
  isSubmitting = false,
}: UserRevokeSessionsDialogProps) {
  const [reason, setReason] = React.useState<string>('Staff administrative session revocation');
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const [prevOpen, setPrevOpen] = React.useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open) {
      setReason('Staff administrative session revocation');
      setErrorMsg(null);
    }
  }

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onConfirm(reason.trim() || undefined);
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Session revocation failed';
      setErrorMsg(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-status-warning/10 text-status-warning border border-status-warning/30">
                <LogOut className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="font-sans text-base font-bold text-foreground">
                  Revoke Active Sessions
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Target: <span className="text-foreground font-semibold font-sans">{user.display_name}</span>{' '}
                  <span className="font-mono text-[11px] text-muted-foreground/80">({user.id})</span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3.5 my-4">
            <div className="p-3 rounded-lg bg-status-warning/10 border border-status-warning/30 flex items-start gap-2 text-xs text-status-warning leading-relaxed">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                This will immediately invalidate all active mobile refresh tokens and browser sessions for this user. They will be forced to log in again.
              </span>
            </div>

            <div>
              <label className="text-xs font-mono font-semibold uppercase text-muted-foreground block mb-1.5">
                Revocation Reason (Audit Log)
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Account security compromise investigation"
                className="w-full h-9 px-3 rounded-lg border border-border bg-surface text-foreground text-xs font-sans placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-accent"
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
              variant="destructive"
              size="sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Revoking...' : 'Revoke All Sessions'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
