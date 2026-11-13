import * as React from 'react';
import { Suspense } from 'react';
import { MapView } from '@/features/map/components/map-view';
import { MapLoadingSkeleton } from '@/features/map/components/map-loading-skeleton';

export const metadata = {
  title: 'Live Incident Map | Inzar Admin',
  description: 'Clustered geospatial visualization and rapid moderation of field incidents.',
};

export default function MapPage() {
  return (
    <Suspense fallback={<MapLoadingSkeleton />}>
      <MapView />
    </Suspense>
  );
}
