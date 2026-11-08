'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  Inbox,
  TriangleAlert,
  Map as MapIcon,
  Flag,
  Users,
  Tag,
  Sliders,
  FileText,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { isAdmin } from '@/lib/permissions';
import { UserMenu } from './user-menu';
import type { SessionUser } from '@/lib/auth/session';

interface SidebarProps {
  user: SessionUser;
  queueCount?: number;
  flagCount?: number;
  jobCount?: number;
}

export function Sidebar({
  user,
  queueCount = 14,
  flagCount = 9,
  jobCount = 3,
}: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const userIsAdmin = isAdmin(user.role);

  const mainNav = [
    {
      name: 'Overview',
      href: '/',
      icon: LayoutGrid,
      exact: true,
    },
    {
      name: 'Moderation queue',
      href: '/queue',
      icon: Inbox,
      badge: queueCount,
    },
    {
      name: 'Incidents',
      href: '/incidents',
      icon: TriangleAlert,
    },
    {
      name: 'Map',
      href: '/map',
      icon: MapIcon,
    },
    {
      name: 'Flags',
      href: '/flags',
      icon: Flag,
      badge: flagCount,
    },
  ];

  const adminNav = [
    {
      name: 'Users',
      href: '/users',
      icon: Users,
    },
    {
      name: 'Categories',
      href: '/categories',
      icon: Tag,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Sliders,
    },
    {
      name: 'Audit log',
      href: '/audit-log',
      icon: FileText,
    },
    {
      name: 'Jobs',
      href: '/jobs',
      icon: Clock,
      badge: jobCount,
    },
  ];

  const isActive = (href: string, exact = false) => {
    if (exact) {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside
      className={cn(
        'relative flex flex-col justify-between border-r border-border bg-surface transition-all duration-300 z-30 select-none shrink-0 min-h-screen',
        isCollapsed ? 'w-16' : 'w-64'
      )}
      aria-label="Dashboard Sidebar"
    >
      {/* Top Section */}
      <div className="flex flex-col flex-1">
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border/70">
          <Link
            href="/"
            className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md py-1"
          >
            <span
              className="text-accent text-xl font-bold leading-none"
              aria-hidden="true"
            >
              ◆
            </span>
            {!isCollapsed && (
              <span className="font-sans text-lg font-bold tracking-widest text-foreground">
                INZAR
              </span>
            )}
          </Link>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex h-6 w-6 items-center justify-center rounded-md border border-border bg-surface-elevated text-muted-foreground hover:text-foreground hover:border-accent/40 transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          {/* Main items */}
          <div className="space-y-1">
            {mainNav.map((item) => {
              const active = isActive(item.href, item.exact);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group',
                    active
                      ? 'bg-surface-elevated text-foreground font-semibold shadow-xs'
                      : 'text-muted-foreground hover:bg-surface-elevated/60 hover:text-foreground'
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  {/* Signal orange active marker bar */}
                  {active && (
                    <span
                      className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md bg-accent"
                      aria-hidden="true"
                    />
                  )}

                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0 transition-colors',
                      active ? 'text-accent' : 'text-muted-foreground group-hover:text-foreground'
                    )}
                  />

                  {!isCollapsed && (
                    <span className="flex-1 truncate">{item.name}</span>
                  )}

                  {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={cn(
                        'px-1.5 py-0.5 rounded font-mono text-xs font-semibold',
                        active
                          ? 'bg-accent/20 text-accent'
                          : 'bg-surface-elevated text-muted-foreground'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Admin section */}
          {userIsAdmin && (
            <div className="space-y-1 pt-2 border-t border-border/50">
              {!isCollapsed && (
                <div className="px-3 pb-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70 font-semibold">
                  ADMIN
                </div>
              )}
              {adminNav.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group',
                      active
                        ? 'bg-surface-elevated text-foreground font-semibold shadow-xs'
                        : 'text-muted-foreground hover:bg-surface-elevated/60 hover:text-foreground'
                    )}
                    title={isCollapsed ? item.name : undefined}
                  >
                    {active && (
                      <span
                        className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md bg-accent"
                        aria-hidden="true"
                      />
                    )}

                    <Icon
                      className={cn(
                        'h-4 w-4 shrink-0 transition-colors',
                        active ? 'text-accent' : 'text-muted-foreground group-hover:text-foreground'
                      )}
                    />

                    {!isCollapsed && (
                      <span className="flex-1 truncate">{item.name}</span>
                    )}

                    {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={cn(
                          'px-1.5 py-0.5 rounded font-mono text-xs font-semibold',
                          active
                            ? 'bg-accent/20 text-accent'
                            : 'bg-surface-elevated text-muted-foreground'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </nav>
      </div>

      {/* Footer / Account section */}
      <div className="p-3 border-t border-border/70">
        <UserMenu user={user} collapsed={isCollapsed} />
      </div>
    </aside>
  );
}
