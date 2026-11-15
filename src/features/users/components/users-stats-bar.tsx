'use client';

import * as React from 'react';
import { Users, UserCheck, ShieldAlert, ShieldCheck, UserX } from 'lucide-react';
import type { UserListItem } from '../types';

interface UsersStatsBarProps {
  items: UserListItem[];
  totalCount: number;
}

export function UsersStatsBar({ items, totalCount }: UsersStatsBarProps) {
  const stats = React.useMemo(() => {
    const active = items.filter((u) => !u.is_suspended).length;
    const suspended = items.filter((u) => u.is_suspended).length;
    const verified = items.filter((u) => u.is_verified).length;
    const staff = items.filter((u) => u.role === 'admin' || u.role === 'moderator').length;

    return {
      total: totalCount,
      active,
      suspended,
      verified,
      staff,
    };
  }, [items, totalCount]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <div className="p-3.5 rounded-xl border border-border bg-card shadow-xs">
        <div className="flex items-center justify-between text-muted-foreground mb-1">
          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Total Accounts</span>
          <Users className="h-4 w-4 text-accent" />
        </div>
        <div className="text-xl font-bold font-mono text-foreground" data-testid="stat-total-users">
          {stats.total.toLocaleString()}
        </div>
      </div>

      <div className="p-3.5 rounded-xl border border-border bg-card shadow-xs">
        <div className="flex items-center justify-between text-muted-foreground mb-1">
          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Active Users</span>
          <UserCheck className="h-4 w-4 text-status-success" />
        </div>
        <div className="text-xl font-bold font-mono text-foreground" data-testid="stat-active-users">
          {stats.active.toLocaleString()}
        </div>
      </div>

      <div className="p-3.5 rounded-xl border border-border bg-card shadow-xs">
        <div className="flex items-center justify-between text-muted-foreground mb-1">
          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Suspended</span>
          <UserX className="h-4 w-4 text-status-danger" />
        </div>
        <div className="text-xl font-bold font-mono text-status-danger" data-testid="stat-suspended-users">
          {stats.suspended.toLocaleString()}
        </div>
      </div>

      <div className="p-3.5 rounded-xl border border-border bg-card shadow-xs">
        <div className="flex items-center justify-between text-muted-foreground mb-1">
          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Verified</span>
          <ShieldCheck className="h-4 w-4 text-status-info" />
        </div>
        <div className="text-xl font-bold font-mono text-foreground" data-testid="stat-verified-users">
          {stats.verified.toLocaleString()}
        </div>
      </div>

      <div className="p-3.5 rounded-xl border border-border bg-card shadow-xs col-span-2 md:col-span-1">
        <div className="flex items-center justify-between text-muted-foreground mb-1">
          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Staff & Mods</span>
          <ShieldAlert className="h-4 w-4 text-accent" />
        </div>
        <div className="text-xl font-bold font-mono text-accent" data-testid="stat-staff-users">
          {stats.staff.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
