'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import {
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Lock,
  Copy,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { StatusBadge } from '@/components/status/status-badge';
import { formatReportedTime, formatUtcTooltip } from '@/lib/format/date';
import type { UserListItem } from '../types';

interface GetUsersColumnsOptions {
  currentUserId?: string | null;
  currentUserEmail?: string | null;
  currentUserRole?: string | null;
  sort?: string;
  onSortChange?: (sortKey: string) => void;
  onViewProfile?: (user: UserListItem) => void;
  onSuspend?: (user: UserListItem) => void;
  onChangeRole?: (user: UserListItem) => void;
  onRevokeSessions?: (user: UserListItem) => void;
}

export function getUsersColumns({
  currentUserId,
  currentUserEmail,
  currentUserRole,
  sort = 'created_at:desc',
  onSortChange,
  onViewProfile,
  onSuspend,
  onChangeRole,
  onRevokeSessions,
}: GetUsersColumnsOptions = {}): ColumnDef<UserListItem>[] {
  const [currentSortKey, currentSortDir] = sort.split(':');
  const isAdmin = currentUserRole === 'admin';

  const renderSortableHeader = (label: string, fieldKey: string) => {
    const isSorted = currentSortKey === fieldKey;

    return (
      <button
        onClick={() => {
          if (!onSortChange) return;
          if (isSorted) {
            onSortChange(`${fieldKey}:${currentSortDir === 'asc' ? 'desc' : 'asc'}`);
          } else {
            onSortChange(`${fieldKey}:desc`);
          }
        }}
        className="flex items-center gap-1.5 hover:text-foreground transition-colors group select-none text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground"
      >
        <span>{label}</span>
        {isSorted ? (
          currentSortDir === 'asc' ? (
            <ArrowUp className="h-3.5 w-3.5 text-accent" />
          ) : (
            <ArrowDown className="h-3.5 w-3.5 text-accent" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-40 group-hover:opacity-100 transition-opacity" />
        )}
      </button>
    );
  };

  return [
    // 1. User (Avatar + Name + Mono ID)
    {
      accessorKey: 'display_name',
      header: () => renderSortableHeader('Citizen / Staff', 'display_name'),
      cell: ({ row }) => {
        const user = row.original;
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
          <div className="flex items-center gap-3 py-1">
            <div className="h-8 w-8 rounded-full bg-surface-elevated border border-border flex items-center justify-center font-mono text-xs font-bold text-accent shrink-0 select-none">
              {initials}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-foreground text-xs font-sans truncate">
                  {user.display_name}
                </span>
                {isSelf && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-accent/20 text-accent border border-accent/40">
                    YOU
                  </span>
                )}
              </div>
              <span className="font-mono text-[11px] text-muted-foreground tracking-tight truncate">
                {user.id}
              </span>
            </div>
          </div>
        );
      },
    },

    // 2. Email (Admin Only, masked for moderators)
    {
      accessorKey: 'email',
      header: () => (
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
          Email {!isAdmin && <Lock className="h-3 w-3 text-muted-foreground" />}
        </span>
      ),
      cell: ({ row }) => {
        const user = row.original;
        if (!isAdmin || !user.email) {
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground/60 select-none cursor-default">
                    <Lock className="h-3 w-3" />
                    <span>••••••••••••</span>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">Email addresses are restricted to administrator staff.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }

        return (
          <div className="flex items-center gap-1.5 font-mono text-xs text-foreground group">
            <span className="truncate max-w-[180px]">{user.email}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (user.email) navigator.clipboard.writeText(user.email);
              }}
              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity"
              aria-label="Copy email address"
            >
              <Copy className="h-3 w-3" />
            </button>
          </div>
        );
      },
    },

    // 3. Role
    {
      accessorKey: 'role',
      header: () => (
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
          Role
        </span>
      ),
      cell: ({ row }) => <StatusBadge status={row.original.role} />,
    },

    // 4. Verification
    {
      accessorKey: 'is_verified',
      header: () => (
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
          Verified
        </span>
      ),
      cell: ({ row }) => (
        <StatusBadge status={row.original.is_verified ? 'verified' : 'unverified'} />
      ),
    },

    // 5. Account Status (Suspended / Active)
    {
      accessorKey: 'is_suspended',
      header: () => (
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
          Status
        </span>
      ),
      cell: ({ row }) => (
        <StatusBadge status={row.original.is_suspended ? 'suspended' : 'active'} />
      ),
    },

    // 6. Report Counts
    {
      accessorKey: 'reports_count',
      header: () => renderSortableHeader('Reports', 'reports_count'),
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 font-mono text-xs text-foreground">
          <FileText className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{row.original.reports_count}</span>
        </div>
      ),
    },

    // 7. Created Date
    {
      accessorKey: 'created_at',
      header: () => renderSortableHeader('Joined', 'created_at'),
      cell: ({ row }) => {
        const dateStr = row.original.created_at;
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="font-mono text-xs text-muted-foreground hover:text-foreground cursor-default transition-colors">
                  {formatReportedTime(dateStr)}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">
                <span className="font-mono text-xs">{formatUtcTooltip(dateStr)}</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },

    // 8. Row Actions
    {
      id: 'actions',
      header: () => (
        <span className="sr-only">Actions</span>
      ),
      cell: ({ row }) => {
        const user = row.original;
        const isSelf =
          (Boolean(currentUserId) && currentUserId === user.id) ||
          (Boolean(currentUserEmail) && Boolean(user.email) && currentUserEmail === user.email);

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  aria-label={`Actions menu for ${user.display_name}`}
                  data-testid={`user-actions-btn-${user.id}`}
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
                  <span>View Profile & Reports</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-border/60" />

                {/* Suspend / Unsuspend */}
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

                {/* Role modification (admin only) */}
                {isAdmin && (
                  <DropdownMenuItem
                    onClick={() => onChangeRole?.(user)}
                    disabled={isSelf}
                    className="text-xs cursor-pointer gap-2 text-foreground"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                    <span>Change Staff Role</span>
                  </DropdownMenuItem>
                )}

                {/* Revoke Sessions */}
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
        );
      },
    },
  ];
}
