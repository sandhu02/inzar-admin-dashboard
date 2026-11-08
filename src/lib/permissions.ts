export type Role = 'admin' | 'moderator' | 'user';

export const ADMIN_ONLY_ROUTES = [
  '/users',
  '/categories',
  '/settings',
  '/audit-log',
  '/jobs',
];

export function isStaff(role?: string | null): boolean {
  return role === 'admin' || role === 'moderator';
}

export function isAdmin(role?: string | null): boolean {
  return role === 'admin';
}

export function isModerator(role?: string | null): boolean {
  return role === 'moderator';
}

export function canAccessPath(path: string, role?: string | null): boolean {
  if (!role || !isStaff(role)) {
    return false;
  }

  // Check admin-only paths
  const isAdminOnly = ADMIN_ONLY_ROUTES.some(
    (adminRoute) => path === adminRoute || path.startsWith(`${adminRoute}/`)
  );

  if (isAdminOnly) {
    return isAdmin(role);
  }

  return true;
}
