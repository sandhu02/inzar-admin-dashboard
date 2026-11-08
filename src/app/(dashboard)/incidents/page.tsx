import * as React from 'react';
import { IncidentsLedger } from '@/features/incidents/components/incidents-ledger';
import { Skeleton } from '@/components/ui/skeleton';

export default function IncidentsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-9 w-32" />
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      }
    >
      <IncidentsLedger />
    </React.Suspense>
  );
}
