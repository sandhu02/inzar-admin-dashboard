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
import { ShieldAlert, ShieldCheck, Shield, User as UserIcon } from 'lucide-react';
import type { UserListItem, UserRole } from '../../types';

interface UserRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserListItem | null;
  onConfirm: (role: UserRole, reason: string, notes?: string) => Promise<void>;
  isSubmitting?: boolean;
  isLastAdmin?: boolean;
}

const ROLE_OPTIONS: { role: UserRole; label: string; description: string; icon: typeof ShieldCheck }[] = [
  {
    role: 'admin',
    label: 'Administrator',
    description: 'Full governance permissions: staff roles, categories, global settings, audit logs, and jobs.',
    icon: ShieldCheck,
  },
  {
    role: 'moderator',
    label: 'Moderator',
    description: 'Operational permissions: review moderation queue, moderate incidents and flags, suspend bad actors.',
    icon: Shield,
  },
  {
    role: 'user',
    label: 'Standard Citizen',
    description: 'Standard mobile app citizen user with no staff or dashboard access.',
    icon: UserIcon,
  },
];

export function UserRoleDialog({
  open,
  onOpenChange,
  user,
  onConfirm,
  isSubmitting = false,
  isLastAdmin = false,
}: UserRoleDialogProps) {
  const [selectedRole, setSelectedRole] = React.useState<UserRole>(user?.role || 'user');
  const [reason, setReason] = React.useState<string>('');
  const [notes, setNotes] = React.useState<string>('');
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const [prevOpen, setPrevOpen] = React.useState(open);
  const [prevUserId, setPrevUserId] = React.useState(user?.id);
  if (prevOpen !== open || prevUserId !== user?.id) {
    setPrevOpen(open);
    setPrevUserId(user?.id);
    if (user && open) {
      setSelectedRole(user.role);
      setReason('');
      setNotes('');
      setErrorMsg(null);
    }
  }

  if (!user) return null;

  const isDemotingLastAdmin = isLastAdmin && user.role === 'admin' && selectedRole !== 'admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedRole === user.role) {
      onOpenChange(false);
      return;
    }

    if (isDemotingLastAdmin) {
      setErrorMsg('Cannot demote the last remaining administrator in the system.');
      return;
    }

    if (!reason.trim()) {
      setErrorMsg('A justification reason is required to alter user access roles.');
      return;
    }

    try {
      await onConfirm(selectedRole, reason.trim(), notes.trim() || undefined);
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Role update failed';
      setErrorMsg(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-accent/15 text-accent border border-accent/30">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="font-sans text-base font-bold text-foreground">
                  Modify Staff Role
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Target: <span className="text-foreground font-semibold font-sans">{user.display_name}</span>{' '}
                  <span className="font-mono text-[11px] text-muted-foreground/80">({user.id})</span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 my-4">
            {isLastAdmin && user.role === 'admin' && (
              <div className="p-3 rounded-lg bg-status-warning/10 border border-status-warning/30 flex items-start gap-2 text-xs text-status-warning">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Last Admin Guard:</strong> This user is the only administrator in the system. To demote this account, another user must first be promoted to Administrator.
                </span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold uppercase text-muted-foreground block">
                Select Target Role <span className="text-status-danger">*</span>
              </label>
              <div className="space-y-2">
                {ROLE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isCurrent = user.role === opt.role;
                  const isSelected = selectedRole === opt.role;
                  const isDisabled = isLastAdmin && user.role === 'admin' && opt.role !== 'admin';

                  return (
                    <label
                      key={opt.role}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-accent bg-accent/5 ring-1 ring-accent'
                          : 'border-border bg-surface hover:bg-surface-elevated'
                      } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="radio"
                        name="user_role"
                        value={opt.role}
                        checked={isSelected}
                        disabled={isDisabled}
                        onChange={() => setSelectedRole(opt.role)}
                        className="mt-0.5 accent-accent"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-accent" />
                          <span className="text-xs font-semibold text-foreground">{opt.label}</span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-medium bg-surface-elevated text-muted-foreground border border-border">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-normal">
                          {opt.description}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-mono font-semibold uppercase text-muted-foreground block mb-1.5">
                Audit Reason <span className="text-status-danger">*</span>
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Promoted to moderation team after supervisor review"
                className="w-full h-9 px-3 rounded-lg border border-border bg-surface text-foreground text-xs font-sans placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div>
              <label className="text-xs font-mono font-semibold uppercase text-muted-foreground block mb-1.5">
                Internal Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes for compliance and audit log..."
                rows={2}
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
              size="sm"
              disabled={isSubmitting || isDemotingLastAdmin || selectedRole === user.role}
            >
              {isSubmitting ? 'Updating...' : 'Confirm Role Change'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
