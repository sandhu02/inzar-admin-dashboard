import * as React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { isStaff } from '@/lib/permissions';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { IdleTimeoutTracker } from '@/components/layout/idle-timeout-tracker';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || !isStaff(session.user?.role)) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground antialiased">
      <IdleTimeoutTracker />

      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar user={session.user} />
      </div>

      {/* Main app viewport */}
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar user={session.user} />
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
