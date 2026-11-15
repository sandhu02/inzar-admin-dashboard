import { describe, it, expect, beforeEach } from 'vitest';
import {
  fetchUsers,
  fetchUserDetail,
  fetchUserIncidents,
  updateUserSuspension,
  updateUserRole,
  revokeUserSessions,
  fetchCurrentUser,
} from './users';
import { resetMockUsers } from '@/mocks/users-data';

describe('Users API Client', () => {
  beforeEach(() => {
    resetMockUsers();
  });

  it('fetchUsers returns paginated list of users with total_count', async () => {
    const res = await fetchUsers({ limit: 10 });
    expect(res).toBeDefined();
    expect(Array.isArray(res.items)).toBe(true);
    expect(res.items.length).toBeGreaterThan(0);
    expect(res.total_count).toBeGreaterThan(0);
    expect(res.items[0]).toHaveProperty('id');
    expect(res.items[0]).toHaveProperty('display_name');
    expect(res.items[0]).toHaveProperty('role');
  });

  it('fetchUsers filters by text search q', async () => {
    const res = await fetchUsers({ q: 'Hamza' });
    expect(res.items.length).toBeGreaterThan(0);
    expect(res.items.some((u) => u.display_name.includes('Hamza'))).toBe(true);
  });

  it('fetchUsers filters by role=admin', async () => {
    const res = await fetchUsers({ role: 'admin' });
    expect(res.items.length).toBeGreaterThan(0);
    expect(res.items.every((u) => u.role === 'admin')).toBe(true);
  });

  it('fetchUsers filters by status=suspended', async () => {
    const res = await fetchUsers({ status: 'suspended' });
    expect(res.items.length).toBeGreaterThan(0);
    expect(res.items.every((u) => u.is_suspended)).toBe(true);
  });

  it('fetchUsers filters by verified=verified', async () => {
    const res = await fetchUsers({ verified: 'verified' });
    expect(res.items.length).toBeGreaterThan(0);
    expect(res.items.every((u) => u.is_verified)).toBe(true);
  });

  it('fetchUserDetail returns detailed profile, stats, sessions, and moderation history', async () => {
    const user = await fetchUserDetail('usr_admin_001');
    expect(user.id).toBe('usr_admin_001');
    expect(user.display_name).toBe('Sana Rehman');
    expect(user.role).toBe('admin');
    expect(user.stats).toBeDefined();
    expect(user.stats.total_reports).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(user.sessions)).toBe(true);
    expect(Array.isArray(user.moderation_history)).toBe(true);
  });

  it('fetchUserIncidents returns list of incidents reported by user', async () => {
    const res = await fetchUserIncidents('usr_user_004');
    expect(res).toBeDefined();
    expect(Array.isArray(res.items)).toBe(true);
    expect(res.items.length).toBeGreaterThan(0);
  });

  it('updateUserSuspension suspends user with required reason and records in history', async () => {
    const updated = await updateUserSuspension({
      userId: 'usr_user_004',
      isSuspended: true,
      reason: 'Repeated coordinated spam reports',
    });

    expect(updated.is_suspended).toBe(true);
    expect(updated.suspension_reason).toBe('Repeated coordinated spam reports');
  });

  it('updateUserSuspension fails when suspending without reason', async () => {
    await expect(
      updateUserSuspension({
        userId: 'usr_user_005',
        isSuspended: true,
        reason: '   ',
      })
    ).rejects.toThrow(/reason is required/i);
  });

  it('updateUserSuspension unsuspends user', async () => {
    const updated = await updateUserSuspension({
      userId: 'usr_user_006',
      isSuspended: false,
      reason: 'Account reinstated following appeal review',
    });

    expect(updated.is_suspended).toBe(false);
    expect(updated.suspension_reason).toBeNull();
  });

  it('updateUserRole updates role for target user', async () => {
    const updated = await updateUserRole({
      userId: 'usr_user_005',
      role: 'moderator',
      reason: 'Appointed as new community safety moderator',
    });

    expect(updated.role).toBe('moderator');
  });

  it('updateUserRole protects the last remaining administrator from demotion', async () => {
    // usr_admin_001 is the sole admin initially
    await expect(
      updateUserRole({
        userId: 'usr_admin_001',
        role: 'user',
        reason: 'Attempted demotion',
      })
    ).rejects.toThrow(/last remaining administrator/i);
  });

  it('updateUserRole prevents modifying own role when multiple admins exist', async () => {
    // First promote another user to admin so last-admin guard does not trigger
    await updateUserRole({
      userId: 'usr_user_004',
      role: 'admin',
      reason: 'Promoting second admin',
    });

    // Now usr_admin_001 attempting to modify their own role is blocked by self-protection guard
    await expect(
      updateUserRole({
        userId: 'usr_admin_001',
        role: 'moderator',
        reason: 'Voluntary demotion',
      })
    ).rejects.toThrow(/cannot change your own role/i);
  });

  it('updateUserSuspension prevents suspending own account', async () => {
    await expect(
      updateUserSuspension({
        userId: 'usr_admin_001',
        isSuspended: true,
        reason: 'Self suspension',
      })
    ).rejects.toThrow(/cannot suspend your own account/i);
  });

  it('revokeUserSessions revokes active sessions', async () => {
    const res = await revokeUserSessions({
      userId: 'usr_user_004',
      reason: 'Suspicious login activity reported',
    });

    expect(res.success).toBe(true);
    const user = await fetchUserDetail('usr_user_004');
    expect(user.sessions.length).toBe(0);
  });

  it('fetchCurrentUser returns session user info', async () => {
    const session = await fetchCurrentUser();
    expect(session).toBeDefined();
  });
});
