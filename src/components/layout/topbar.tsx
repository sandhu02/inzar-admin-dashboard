'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Search, Moon, Sun, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Sidebar } from './sidebar';
import type { SessionUser } from '@/lib/auth/session';

interface TopbarProps {
  user: SessionUser;
}

export function Topbar({ user }: TopbarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  // Generate breadcrumb title
  const getBreadcrumb = () => {
    if (pathname === '/') return 'OVERVIEW';
    const segment = pathname.split('/')[1]?.toUpperCase() || 'OVERVIEW';
    return segment.replace(/-/g, ' ');
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border bg-surface/90 backdrop-blur-md px-4 md:px-6">
      {/* Left: Mobile menu + Breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Mobile menu drawer trigger */}
        <div className="md:hidden">
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open navigation menu</span>
              </Button>
            </DrawerTrigger>
            <DrawerContent side="left" className="p-0 w-72">
              <DrawerHeader className="sr-only">
                <DrawerTitle>Mobile Navigation</DrawerTitle>
              </DrawerHeader>
              <Sidebar user={user} />
            </DrawerContent>
          </Drawer>
        </div>

        {/* Breadcrumb matching Inzar design: INZAR / SECTION */}
        <div className="flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-muted-foreground select-none">
          <span>INZAR</span>
          <span className="text-border">/</span>
          <span className="text-foreground">{getBreadcrumb()}</span>
        </div>
      </div>

      {/* Right: Search + Theme Toggle */}
      <div className="flex items-center gap-3">
        {/* Global Search Bar with keyboard shortcut / */}
        <div className="relative hidden sm:flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search incidents, users"
            className="h-9 w-64 md:w-80 rounded-lg border border-border bg-surface-elevated/70 pl-9 pr-8 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent focus:bg-surface transition-colors"
          />
          <kbd className="absolute right-2.5 top-2 pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-card px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            /
          </kbd>
        </div>

        {/* Theme Toggle Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="h-9 w-9 rounded-lg border-border bg-surface-elevated hover:bg-surface text-muted-foreground hover:text-foreground"
          aria-label="Toggle color theme"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 transition-transform" />
          ) : (
            <Moon className="h-4 w-4 transition-transform" />
          )}
        </Button>
      </div>
    </header>
  );
}
