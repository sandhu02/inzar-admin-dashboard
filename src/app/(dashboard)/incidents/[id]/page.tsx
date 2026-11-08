'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IncidentDetailView } from '@/features/incidents/components/detail/incident-detail-view';

export default function IncidentDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

  if (!id) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        Invalid incident ID requested.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Navigation Breadcrumb / Back Link */}
      <div className="flex items-center justify-between pb-2">
        <Link href="/incidents">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground -ml-2 text-xs font-mono"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Back to Incidents Ledger
          </Button>
        </Link>
      </div>

      {/* Main Incident Detail View */}
      <IncidentDetailView incidentId={id} fullPage={true} />
    </div>
  );
}
