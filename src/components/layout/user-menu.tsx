'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Sun, Moon, Shield } from 'lucide-react';
import { useTheme } from 'next-themes';
import type { SessionUser } from '@/lib/auth/session';

interface UserMenuProps {
  user: SessionUser;
  collapsed?: boolean;
}

export function UserMenu({ user, collapsed = false }: UserMenuProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.push('/login');
      router.refresh();
    }
  };

  const initials = user.display_name
    ? user.display_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'SR';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-surface-elevated transition-colors text-left focus:outline-none focus:ring-1 focus:ring-accent group cursor-pointer"
          aria-label="User account menu"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-elevated border border-border text-xs font-mono font-bold text-foreground group-hover:border-accent/40 transition-colors">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user.display_name}
              </p>
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground truncate">
                {user.role}
              </p>
            </div>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        side="top"
        className="w-56 bg-card border-border shadow-xl mb-2"
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-foreground">
              {user.display_name}
            </p>
            <p className="text-xs leading-none text-muted-foreground font-mono">
              {user.email}
            </p>
            <div className="mt-1 flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-accent">
              <Shield className="h-3 w-3" />
              <span>{user.role}</span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-border" />

        <DropdownMenuItem
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="gap-2 cursor-pointer focus:bg-surface-elevated"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Moon className="h-4 w-4 text-muted-foreground" />
          )}
          <span>Toggle theme ({theme === 'dark' ? 'Light' : 'Dark'})</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-border" />

        <DropdownMenuItem
          onClick={handleSignOut}
          className="gap-2 cursor-pointer text-status-danger focus:bg-destructive/10 focus:text-status-danger"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
