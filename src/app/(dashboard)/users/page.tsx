import * as React from 'react';
import { UsersLedger } from '@/features/users/components/users-ledger';
import { UsersLoadingSkeleton } from '@/features/users/components/users-loading-skeleton';

export default function UsersPage() {
  return (
    <React.Suspense fallback={<UsersLoadingSkeleton />}>
      <UsersLedger />
    </React.Suspense>
  );
}
