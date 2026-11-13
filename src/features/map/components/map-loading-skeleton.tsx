import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin } from 'lucide-react';

export function MapLoadingSkeleton() {
  return (
    <div
      data-testid="map-loading-skeleton"
      className="relative w-full h-[620px] rounded-xl border border-border bg-surface overflow-hidden flex flex-col items-center justify-center p-6 select-none"
    >
      {/* Background stylized grid */}
      <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="skeleton-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#skeleton-grid)" />
      </svg>

      <div className="relative z-10 flex flex-col items-center gap-3 text-center">
        <div className="h-12 w-12 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center animate-pulse">
          <MapPin className="h-6 w-6 text-accent" />
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground font-sans">
            Loading MapLibre Incident Map...
          </div>
          <div className="text-xs text-muted-foreground font-mono mt-1">
            Preparing clustered GeoJSON coordinates
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Skeleton className="h-2 w-16" />
          <Skeleton className="h-2 w-24" />
          <Skeleton className="h-2 w-12" />
        </div>
      </div>
    </div>
  );
}
