'use client';

import * as React from 'react';
import {
  Copy,
  Check,
  Lock,
  Ban,
  RotateCcw,
  ShieldCheck,
  LogOut,
  Calendar,
  Clock,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/status/status-badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatReportedTime, formatUtcTooltip } from '@/lib/format/date';
import type { UserDetail } from '../../types';

interface UserSummaryCardProps {
  user: UserDetail;
  currentUserId?: string | null;
  currentUserEmail?: string | null;
  currentUserRole?: string | null;
  onSuspend: () => void;
  onChangeRole: () => void;
  onRevokeSessions: () => void;
  isLastAdmin?: boolean;
}

export function UserSummaryCard({
  user,
  currentUserId,
  currentUserEmail,
  currentUserRole,
  onSuspend,
  onChangeRole,
  onRevokeSessions,
  isLastAdmin = false,
}: UserSummaryCardProps) {
  const [copiedId, setCopiedId] = React.useState(false);
  const [copiedEmail, setCopiedEmail] = React.useState(false);

  const isAdmin = currentUserRole === 'admin';
  const isSelf =
    (Boolean(currentUserId) && currentUserId === user.id) ||
    (Boolean(currentUserEmail) && Boolean(user.email) && currentUserEmail === user.email);

  const initials = user.display_name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleCopyId = () => {
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyEmail = () => {
    if (user.email) {
      navigator.clipboard.writeText(user.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  return (
    <div className="p-5 md:p-6 rounded-xl border border-border bg-card space-y-5" data-testid="user-summary-card">
      {/* Top Header: Avatar, Name, Badges, Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-full bg-surface-elevated border border-border flex items-center justify-center font-mono text-lg font-bold text-accent shrink-0 select-none">
            {initials}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl md:text-2xl font-bold font-sans text-foreground">
                {user.display_name}
              </h1>
              {isSelf && (
                <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-accent/20 text-accent border border-accent/40">
                  YOUR ACCOUNT
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap pt-0.5">
              <StatusBadge status={user.role} />
              <StatusBadge status={user.is_verified ? 'verified' : 'unverified'} />
              <StatusBadge status={user.is_suspended ? 'suspended' : 'active'} />
            </div>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Suspend / Unsuspend */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    variant={user.is_suspended ? 'outline' : 'destructive'}
                    size="sm"
                    onClick={onSuspend}
                    disabled={isSelf}
                    className="gap-1.5 text-xs font-mono"
                    data-testid="user-suspend-action-btn"
                  >
                    {user.is_suspended ? (
                      <>
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Reinstate Account</span>
                      </>
                    ) : (
                      <>
                        <Ban className="h-3.5 w-3.5" />
                        <span>Suspend Account</span>
                      </>
                    )}
                  </Button>
                </span>
              </TooltipTrigger>
              {isSelf && (
                <TooltipContent side="top">
                  <p className="text-xs">You cannot suspend your own account.</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          {/* Change Role (Admin only) */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onChangeRole}
                    disabled={!isAdmin || isSelf}
                    className="gap-1.5 text-xs font-mono border-border hover:border-accent/40"
                    data-testid="user-role-action-btn"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                    <span>Change Role</span>
                  </Button>
                </span>
              </TooltipTrigger>
              {!isAdmin ? (
                <TooltipContent side="top">
                  <p className="text-xs">Role modifications require Administrator access.</p>
                </TooltipContent>
              ) : isSelf ? (
                <TooltipContent side="top">
                  <p className="text-xs">You cannot modify your own role.</p>
                </TooltipContent>
              ) : null}
            </Tooltip>
          </TooltipProvider>

          {/* Revoke Sessions */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRevokeSessions}
            className="gap-1.5 text-xs font-mono text-status-warning hover:text-status-warning border-border hover:border-status-warning/40"
            data-testid="user-revoke-sessions-action-btn"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Revoke Sessions</span>
          </Button>
        </div>
      </div>

      {/* Suspension Alert Banner if suspended */}
      {user.is_suspended && (
        <div className="p-3.5 rounded-lg bg-status-danger/10 border border-status-danger/30 text-xs text-status-danger space-y-1" data-testid="user-suspended-banner">
          <div className="flex items-center gap-1.5 font-bold font-sans">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Account Currently Suspended</span>
          </div>
          <p className="leading-relaxed">
            <strong>Reason:</strong> {user.suspension_reason || 'Administrative policy suspension'}
          </p>
          {user.suspended_at && (
            <p className="font-mono text-[11px] opacity-80">
              Suspended {formatReportedTime(user.suspended_at)} by {user.suspended_by || 'Staff'}
            </p>
          )}
        </div>
      )}

      {/* Last Admin warning banner */}
      {isLastAdmin && user.role === 'admin' && (
        <div className="p-3 rounded-lg bg-status-warning/10 border border-status-warning/30 flex items-center gap-2 text-xs text-status-warning font-sans">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>
            <strong>Sole Administrator:</strong> This account is the only administrator configured in the system. Demotion protection is permanently engaged.
          </span>
        </div>
      )}

      {/* Metadata Grid: ID, Email, Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-border/60 text-xs">
        {/* User ID */}
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground block mb-1">
            User ID
          </span>
          <div className="flex items-center gap-1.5 font-mono text-foreground font-medium">
            <span className="truncate">{user.id}</span>
            <button
              onClick={handleCopyId}
              className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
              aria-label="Copy User ID"
            >
              {copiedId ? <Check className="h-3.5 w-3.5 text-status-success" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Email (Admin only) */}
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground block mb-1">
            Email Address {!isAdmin && <Lock className="inline h-3 w-3 text-muted-foreground" />}
          </span>
          {isAdmin && user.email ? (
            <div className="flex items-center gap-1.5 font-mono text-foreground font-medium">
              <span className="truncate">{user.email}</span>
              <button
                onClick={handleCopyEmail}
                className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
                aria-label="Copy Email"
              >
                {copiedEmail ? <Check className="h-3.5 w-3.5 text-status-success" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-muted-foreground/60 font-mono select-none" data-testid="user-email-masked">
              <Lock className="h-3 w-3" />
              <span>•••••••••••• (Restricted)</span>
            </div>
          )}
        </div>

        {/* Account Created */}
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground block mb-1">
            Member Since
          </span>
          <div className="flex items-center gap-1.5 font-mono text-foreground">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-default">{formatReportedTime(user.created_at)}</span>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <span className="font-mono text-xs">{formatUtcTooltip(user.created_at)}</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Last Active */}
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground block mb-1">
            Last Active
          </span>
          <div className="flex items-center gap-1.5 font-mono text-foreground">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-default">{formatReportedTime(user.last_active_at)}</span>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <span className="font-mono text-xs">{formatUtcTooltip(user.last_active_at)}</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
