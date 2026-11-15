'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { UsersFilterBar } from './users-filter-bar';
import { UsersStatsBar } from './users-stats-bar';
import { getUsersColumns } from './users-columns';
import { UsersCardList } from './users-card-list';
import { UsersEmpty } from './users-empty';
import { UserSuspendDialog } from './detail/user-suspend-dialog';
import { UserRoleDialog } from './detail/user-role-dialog';
import { UserRevokeSessionsDialog } from './detail/user-revoke-sessions-dialog';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useUserFilters } from '../hooks/use-user-filters';
import { useUsers } from '../hooks/use-users';
import { useCurrentUser } from '../hooks/use-current-user';
import { useUserActions } from '../hooks/use-user-actions';
import type { UserListItem, UserRole } from '../types';

export function UsersLedger() {
  const router = useRouter();
  const filterHook = useUserFilters();
  const { activeFilters, rawParams, setCursor, setSort, clearAllFilters } = filterHook;

  const { data, isLoading, isError, error, refetch } = useUsers(activeFilters);
  const { user: currentUser } = useCurrentUser();
  const {
    suspendUser,
    isSuspending,
    changeRole,
    isChangingRole,
    revokeSessions,
    isRevokingSessions,
  } = useUserActions();

  // Dialog states
  const [suspendTarget, setSuspendTarget] = React.useState<UserListItem | null>(null);
  const [suspendOpen, setSuspendOpen] = React.useState(false);

  const [roleTarget, setRoleTarget] = React.useState<UserListItem | null>(null);
  const [roleOpen, setRoleOpen] = React.useState(false);

  const [revokeTarget, setRevokeTarget] = React.useState<UserListItem | null>(null);
  const [revokeOpen, setRevokeOpen] = React.useState(false);

  const items = React.useMemo(() => data?.items || [], [data?.items]);
  const totalCount = data?.total_count || 0;

  // Check if target is the last admin
  const isTargetLastAdmin = React.useMemo(() => {
    if (!roleTarget || roleTarget.role !== 'admin') return false;
    const adminCount = items.filter((u) => u.role === 'admin').length;
    return adminCount <= 1;
  }, [roleTarget, items]);

  const handleSuspendConfirm = async (reason: string, notes?: string) => {
    if (!suspendTarget) return;
    await suspendUser({
      userId: suspendTarget.id,
      isSuspended: !suspendTarget.is_suspended,
      reason,
      notes,
    });
    refetch();
  };

  const handleRoleConfirm = async (newRole: UserRole, reason: string, notes?: string) => {
    if (!roleTarget) return;
    await changeRole({
      userId: roleTarget.id,
      role: newRole,
      reason,
      notes,
    });
    refetch();
  };

  const handleRevokeConfirm = async (reason?: string) => {
    if (!revokeTarget) return;
    await revokeSessions({
      userId: revokeTarget.id,
      reason,
    });
    refetch();
  };

  const columns = React.useMemo(() => {
    return getUsersColumns({
      currentUserId: currentUser?.id,
      currentUserEmail: currentUser?.email,
      currentUserRole: currentUser?.role,
      sort: rawParams.sort,
      onSortChange: (newSort) => setSort(newSort),
      onViewProfile: (u) => router.push(`/users/${u.id}`),
      onSuspend: (u) => {
        setSuspendTarget(u);
        setSuspendOpen(true);
      },
      onChangeRole: (u) => {
        setRoleTarget(u);
        setRoleOpen(true);
      },
      onRevokeSessions: (u) => {
        setRevokeTarget(u);
        setRevokeOpen(true);
      },
    });
  }, [currentUser, rawParams.sort, setSort, router]);

  const currentOffset = rawParams.cursor ? parseInt(rawParams.cursor, 10) || 0 : 0;
  const pageSize = 25;
  const hasNextPage = Boolean(data?.next_cursor);
  const hasPrevPage = currentOffset > 0;

  const handleNextPage = () => {
    if (data?.next_cursor) {
      setCursor(data.next_cursor);
    }
  };

  const handlePrevPage = () => {
    const prevOffset = Math.max(0, currentOffset - pageSize);
    setCursor(prevOffset > 0 ? String(prevOffset) : null);
  };

  const hasActiveFilters = Boolean(
    rawParams.q ||
      (rawParams.role && rawParams.role !== 'all') ||
      (rawParams.status && rawParams.status !== 'all') ||
      (rawParams.verified && rawParams.verified !== 'all') ||
      (rawParams.date_preset && rawParams.date_preset !== 'all')
  );

  if (isError) {
    return (
      <div className="p-6 rounded-xl border border-status-danger/30 bg-status-danger/10 text-status-danger text-sm">
        <p className="font-semibold mb-1">Failed to load user accounts</p>
        <p className="text-xs">{error?.message || 'Unknown network error'}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="mt-3 text-xs"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5" data-testid="users-ledger-container">
      {/* Top Header & Metrics */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold font-sans text-foreground">
          User Management
        </h1>
        <p className="text-xs text-muted-foreground font-sans">
          Manage citizen reporters, moderator staff, and administrator governance privileges.
        </p>
      </div>

      <UsersStatsBar items={items} totalCount={totalCount} />

      {/* Filter and search controls */}
      <UsersFilterBar filterHook={filterHook} />

      {/* Results View: Table on desktop, Card List on mobile */}
      {!isLoading && items.length === 0 ? (
        <UsersEmpty
          hasFilters={hasActiveFilters}
          onResetFilters={clearAllFilters}
        />
      ) : (
        <>
          <div className="hidden md:block">
            <DataTable
              columns={columns}
              data={items}
              isLoading={isLoading}
              onRowClick={(row) => router.push(`/users/${row.id}`)}
              className="border-border bg-card"
            />
          </div>

          <UsersCardList
            items={items}
            currentUserId={currentUser?.id}
            currentUserEmail={currentUser?.email}
            currentUserRole={currentUser?.role}
            onViewProfile={(u) => router.push(`/users/${u.id}`)}
            onSuspend={(u) => {
              setSuspendTarget(u);
              setSuspendOpen(true);
            }}
            onChangeRole={(u) => {
              setRoleTarget(u);
              setRoleOpen(true);
            }}
            onRevokeSessions={(u) => {
              setRevokeTarget(u);
              setRevokeOpen(true);
            }}
          />

          {/* Pagination Controls */}
          <div className="flex items-center justify-between py-2 text-xs font-mono text-muted-foreground">
            <div>
              Showing {currentOffset + 1}–{Math.min(currentOffset + items.length, totalCount)} of{' '}
              {totalCount} accounts
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={!hasPrevPage}
                className="h-8 px-2.5 text-xs font-mono gap-1"
                data-testid="pagination-prev-btn"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={!hasNextPage}
                className="h-8 px-2.5 text-xs font-mono gap-1"
                data-testid="pagination-next-btn"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Action Dialogs */}
      <UserSuspendDialog
        open={suspendOpen}
        onOpenChange={setSuspendOpen}
        user={suspendTarget}
        onConfirm={handleSuspendConfirm}
        isSubmitting={isSuspending}
      />

      <UserRoleDialog
        open={roleOpen}
        onOpenChange={setRoleOpen}
        user={roleTarget}
        onConfirm={handleRoleConfirm}
        isSubmitting={isChangingRole}
        isLastAdmin={isTargetLastAdmin}
      />

      <UserRevokeSessionsDialog
        open={revokeOpen}
        onOpenChange={setRevokeOpen}
        user={revokeTarget}
        onConfirm={handleRevokeConfirm}
        isSubmitting={isRevokingSessions}
      />
    </div>
  );
}
