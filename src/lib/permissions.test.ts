import { describe, it, expect } from 'vitest';
import {
  isStaff,
  isAdmin,
  isModerator,
  canAccessPath,
} from './permissions';

describe('Permissions and Role Helpers', () => {
  it('correctly identifies staff roles', () => {
    expect(isStaff('admin')).toBe(true);
    expect(isStaff('moderator')).toBe(true);
    expect(isStaff('user')).toBe(false);
    expect(isStaff(null)).toBe(false);
    expect(isStaff(undefined)).toBe(false);
  });

  it('correctly identifies admin', () => {
    expect(isAdmin('admin')).toBe(true);
    expect(isAdmin('moderator')).toBe(false);
    expect(isAdmin('user')).toBe(false);
  });

  it('correctly identifies moderator', () => {
    expect(isModerator('moderator')).toBe(true);
    expect(isModerator('admin')).toBe(false);
  });

  it('grants admin access to all dashboard and admin routes', () => {
    expect(canAccessPath('/', 'admin')).toBe(true);
    expect(canAccessPath('/queue', 'admin')).toBe(true);
    expect(canAccessPath('/incidents', 'admin')).toBe(true);
    expect(canAccessPath('/users', 'admin')).toBe(true);
    expect(canAccessPath('/categories', 'admin')).toBe(true);
    expect(canAccessPath('/settings', 'admin')).toBe(true);
    expect(canAccessPath('/audit-log', 'admin')).toBe(true);
    expect(canAccessPath('/jobs', 'admin')).toBe(true);
  });

  it('grants moderator access to operational routes but blocks admin-only routes', () => {
    // Allowed routes for moderator
    expect(canAccessPath('/', 'moderator')).toBe(true);
    expect(canAccessPath('/queue', 'moderator')).toBe(true);
    expect(canAccessPath('/incidents', 'moderator')).toBe(true);
    expect(canAccessPath('/map', 'moderator')).toBe(true);
    expect(canAccessPath('/flags', 'moderator')).toBe(true);

    // Blocked routes for moderator
    expect(canAccessPath('/users', 'moderator')).toBe(false);
    expect(canAccessPath('/users/usr_123', 'moderator')).toBe(false);
    expect(canAccessPath('/categories', 'moderator')).toBe(false);
    expect(canAccessPath('/settings', 'moderator')).toBe(false);
    expect(canAccessPath('/audit-log', 'moderator')).toBe(false);
    expect(canAccessPath('/jobs', 'moderator')).toBe(false);
  });

  it('rejects access for non-staff or unauthenticated users', () => {
    expect(canAccessPath('/', 'user')).toBe(false);
    expect(canAccessPath('/queue', 'user')).toBe(false);
    expect(canAccessPath('/', null)).toBe(false);
    expect(canAccessPath('/', undefined)).toBe(false);
  });
});
