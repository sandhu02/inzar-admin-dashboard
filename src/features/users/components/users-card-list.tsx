'use client';

import * as React from 'react';
import {
  MoreHorizontal,
  Lock,
  ExternalLink,
  Ban,
  RotateCcw,
  ShieldCheck,
  LogOut,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusBadge } from '@/components/status/status-badge';
import { formatReportedTime } from '@/lib/format/date';
import type { UserListItem } from '../types';

interface UsersCardListProps {
  items: UserListItem[];
  currentUserId?: string | null;
  currentUserEmail?: string | null;
  currentUserRole?: string | null;
  onViewProfile?: (user: UserListItem) => void;
  onSuspend?: (user: UserListItem) => void;
  onChangeRole?: (user: UserListItem) => void;
  onRevokeSessions?: (user: UserListItem) => void;
}

export function UsersCardList({
  items,
  currentUserId,
  currentUserEmail,
  currentUserRole,
  onViewProfile,
  onSuspend,
  onChangeRole,
  onRevokeSessions,
}: UsersCardListProps) {
  const isAdmin = currentUserRole === 'admin';

  return (
    <div className="grid grid-cols-1 gap-3 md:hidden" data-testid="users-card-list">
      {items.map((user) => {
        const initials = user.display_name
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase();
        const isSelf =
          (Boolean(currentUserId) && currentUserId === user.id) ||
          (Boolean(currentUserEmail) && Boolean(user.email) && currentUserEmail === user.email);

        return (
          <div
            key={user.id}
            onClick={() => onViewProfile?.(user)}
            className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-3 cursor-pointer hover:border-accent/40 transition-colors"
            data-testid={`user-card-${user.id}`}
          >
            {/* Header: User avatar, name, id, actions menu */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-full bg-surface-elevated border border-border flex items-center justify-center font-mono text-xs font-bold text-accent shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-foreground text-sm font-sans truncate">
                      {user.display_name}
                    </span>
                    {isSelf && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-accent/20 text-accent border border-accent/40">
                        YOU
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[11px] text-muted-foreground block truncate">
                    {user.id}
                  </span>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    aria-label={`Actions menu for ${user.display_name}`}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                  <DropdownMenuItem
                    onClick={() => onViewProfile?.(user)}
                    className="text-xs cursor-pointer gap-2"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>View Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border/60" />
                  <DropdownMenuItem
                    onClick={() => onSuspend?.(user)}
                    disabled={isSelf}
                    className={`text-xs cursor-pointer gap-2 ${
                      user.is_suspended ? 'text-status-success' : 'text-status-danger'
                    }`}
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
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem
                      onClick={() => onChangeRole?.(user)}
                      disabled={isSelf}
                      className="text-xs cursor-pointer gap-2"
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                      <span>Change Staff Role</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => onRevokeSessions?.(user)}
                    className="text-xs cursor-pointer gap-2 text-status-warning"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Revoke Sessions</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Email (Admin only) */}
            <div className="text-xs font-mono">
              {isAdmin && user.email ? (
                <span className="text-foreground">{user.email}</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-muted-foreground/60 select-none">
                  <Lock className="h-3 w-3" />
                  <span>•••••••••••• (Restricted)</span>
                </span>
              )}
            </div>

            {/* Badges row */}
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={user.role} />
              <StatusBadge status={user.is_verified ? 'verified' : 'unverified'} />
              <StatusBadge status={user.is_suspended ? 'suspended' : 'active'} />
            </div>

            {/* Footer row: reports count & joined time */}
            <div className="flex items-center justify-between text-xs font-mono text-muted-foreground pt-1 border-t border-border/50">
              <span className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" /> {user.reports_count} Reports
              </span>
              <span>Joined {formatReportedTime(user.created_at)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
