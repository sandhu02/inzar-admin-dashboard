'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, FileText, History, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserSummaryCard } from './user-summary-card';
import { UserStatsCards } from './user-stats-cards';
import { UserIncidentsTab } from './user-incidents-tab';
import { UserModerationHistory } from './user-moderation-history';
import { UserSessionsCard } from './user-sessions-card';
import { UserSuspendDialog } from './user-suspend-dialog';
import { UserRoleDialog } from './user-role-dialog';
import { UserRevokeSessionsDialog } from './user-revoke-sessions-dialog';
import { useUserDetail } from '../../hooks/use-user-detail';
import { useCurrentUser } from '../../hooks/use-current-user';
import { useUserActions } from '../../hooks/use-user-actions';
import type { UserRole } from '../../types';

interface UserDetailViewProps {
  userId: string;
}

type TabKey = 'incidents' | 'moderation' | 'sessions';

export function UserDetailView({ userId }: UserDetailViewProps) {
  const { data: user, isLoading, isError, error, refetch } = useUserDetail(userId);
  const { user: currentUser } = useCurrentUser();
  const {
    suspendUser,
    isSuspending,
    changeRole,
    isChangingRole,
    revokeSessions,
    isRevokingSessions,
  } = useUserActions();

  const [activeTab, setActiveTab] = React.useState<TabKey>('incidents');
  const [suspendOpen, setSuspendOpen] = React.useState(false);
  const [roleOpen, setRoleOpen] = React.useState(false);
  const [revokeOpen, setRevokeOpen] = React.useState(false);

  // Check if target is sole admin: if user is admin and id is usr_admin_001 or email is admin@inzar.app
  const isLastAdmin =
    user?.role === 'admin' &&
    (user?.id === 'usr_admin_001' || user?.email === 'admin@inzar.app');

  const handleSuspendConfirm = async (reason: string, notes?: string) => {
    if (!user) return;
    await suspendUser({
      userId: user.id,
      isSuspended: !user.is_suspended,
      reason,
      notes,
    });
    refetch();
  };

  const handleRoleConfirm = async (newRole: UserRole, reason: string, notes?: string) => {
    if (!user) return;
    await changeRole({
      userId: user.id,
      role: newRole,
      reason,
      notes,
    });
    refetch();
  };

  const handleRevokeConfirm = async (reason?: string) => {
    if (!user) return;
    await revokeSessions({
      userId: user.id,
      reason,
    });
    refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-5 animate-pulse" data-testid="user-detail-loading">
        <div className="h-6 w-48 bg-card rounded" />
        <div className="h-44 bg-card rounded-xl border border-border" />
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`stat-skel-${i}`} className="h-20 bg-card rounded-xl border border-border" />
          ))}
        </div>
        <div className="h-64 bg-card rounded-xl border border-border" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="p-8 rounded-xl border border-status-danger/30 bg-status-danger/10 text-status-danger text-center">
        <p className="font-semibold text-base mb-1">User Not Found</p>
        <p className="text-xs mb-4">{error?.message || 'The requested user profile does not exist.'}</p>
        <Link href="/users">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs font-mono">
            <ArrowLeft className="h-3.5 w-3.5" /> Return to User List
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="user-detail-container">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
        <Link
          href="/users"
          className="hover:text-foreground transition-colors flex items-center gap-1"
          data-testid="users-back-link"
        >
          <ArrowLeft className="h-3 w-3" />
          <span>Users</span>
        </Link>
        <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
        <span className="text-foreground font-semibold truncate max-w-[200px]">
          {user.display_name}
        </span>
      </div>

      {/* Summary Profile Header Card */}
      <UserSummaryCard
        user={user}
        currentUserId={currentUser?.id}
        currentUserEmail={currentUser?.email}
        currentUserRole={currentUser?.role}
        onSuspend={() => setSuspendOpen(true)}
        onChangeRole={() => setRoleOpen(true)}
        onRevokeSessions={() => setRevokeOpen(true)}
        isLastAdmin={isLastAdmin}
      />

      {/* Numerical Metrics Cards */}
      <UserStatsCards stats={user.stats} />

      {/* Tabs Navigation */}
      <div className="space-y-4">
        <div className="flex items-center gap-1 border-b border-border pb-1" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'incidents'}
            onClick={() => setActiveTab('incidents')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono font-medium transition-colors ${
              activeTab === 'incidents'
                ? 'bg-accent/15 text-accent border border-accent/30'
                : 'text-muted-foreground hover:text-foreground hover:bg-surface-elevated'
            }`}
            data-testid="tab-incidents"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Incident Reports ({user.stats.total_reports})</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'moderation'}
            onClick={() => setActiveTab('moderation')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono font-medium transition-colors ${
              activeTab === 'moderation'
                ? 'bg-accent/15 text-accent border border-accent/30'
                : 'text-muted-foreground hover:text-foreground hover:bg-surface-elevated'
            }`}
            data-testid="tab-moderation"
          >
            <History className="h-3.5 w-3.5" />
            <span>Moderation History ({user.moderation_history.length})</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'sessions'}
            onClick={() => setActiveTab('sessions')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono font-medium transition-colors ${
              activeTab === 'sessions'
                ? 'bg-accent/15 text-accent border border-accent/30'
                : 'text-muted-foreground hover:text-foreground hover:bg-surface-elevated'
            }`}
            data-testid="tab-sessions"
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>Active Sessions ({user.sessions.length})</span>
          </button>
        </div>

        {/* Tab Panels */}
        <div className="pt-1">
          {activeTab === 'incidents' && <UserIncidentsTab userId={user.id} />}
          {activeTab === 'moderation' && <UserModerationHistory history={user.moderation_history} />}
          {activeTab === 'sessions' && (
            <UserSessionsCard
              sessions={user.sessions}
              onRevokeAll={() => setRevokeOpen(true)}
            />
          )}
        </div>
      </div>

      {/* Action Dialogs */}
      <UserSuspendDialog
        open={suspendOpen}
        onOpenChange={setSuspendOpen}
        user={user}
        onConfirm={handleSuspendConfirm}
        isSubmitting={isSuspending}
      />

      <UserRoleDialog
        open={roleOpen}
        onOpenChange={setRoleOpen}
        user={user}
        onConfirm={handleRoleConfirm}
        isSubmitting={isChangingRole}
        isLastAdmin={isLastAdmin}
      />

      <UserRevokeSessionsDialog
        open={revokeOpen}
        onOpenChange={setRevokeOpen}
        user={user}
        onConfirm={handleRevokeConfirm}
        isSubmitting={isRevokingSessions}
      />
    </div>
  );
}
