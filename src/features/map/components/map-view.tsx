'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { RefreshCw, AlertCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMapFilters } from '../hooks/use-map-filters';
import { useMapIncidents } from '../hooks/use-map-incidents';
import { MapFiltersBar } from './map-filters-bar';
import { MapAccessibleList } from './map-accessible-list';
import { MapPreviewPanel } from './map-preview-panel';
import { MapLoadingSkeleton } from './map-loading-skeleton';
import { mockIncidentsDataset } from '@/mocks/incidents-data';
import type { Incident } from '@/features/incidents/types';

// Dynamic import of IncidentMap to prevent SSR execution of WebGL and MapLibre GL
const DynamicIncidentMap = dynamic(
  () => import('./incident-map').then((mod) => mod.IncidentMap),
  {
    ssr: false,
    loading: () => <MapLoadingSkeleton />,
  }
);

export function MapView() {
  const {
    activeFilters,
    selectedIncidentId,
    isListOpen,
    isViewportSync,
    selectIncident,
    toggleList,
  } = useMapFilters();

  const [currentBbox, setCurrentBbox] = React.useState<string | null>(null);

  // Fetch incidents with viewport bounds and debounced queries
  const {
    incidents,
    totalCount,
    isFetching,
    error,
    refetch,
  } = useMapIncidents({
    filters: activeFilters,
    bbox: currentBbox,
    viewportSyncEnabled: isViewportSync,
    debounceMs: 300,
    limit: 500,
  });

  // Keep local status overrides in memory if moderator updates an incident
  const [updatedOverrides, setUpdatedOverrides] = React.useState<Record<string, Incident>>({});

  const displayIncidents = React.useMemo(() => {
    return incidents.map((inc) => updatedOverrides[inc.id] || inc);
  }, [incidents, updatedOverrides]);

  const handleIncidentUpdated = (updated: Incident) => {
    setUpdatedOverrides((prev) => ({
      ...prev,
      [updated.id]: updated,
    }));
    refetch();
  };

  // Find currently selected incident from local state, query, or mock dataset
  const selectedIncident = React.useMemo(() => {
    if (!selectedIncidentId) return null;
    return (
      displayIncidents.find((inc) => inc.id === selectedIncidentId) ||
      mockIncidentsDataset.find((inc) => inc.id === selectedIncidentId) ||
      null
    );
  }, [displayIncidents, selectedIncidentId]);

  return (
    <div data-testid="map-view-container" className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-sans text-foreground">
              Live Incident Map
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-accent/15 text-accent border border-accent/30">
              <Shield className="h-3 w-3" />
              FUZZED ~500M GPS
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 font-sans">
            Real-time geospatial intelligence, clustering, and rapid moderation for field reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-8 text-xs font-medium gap-1.5 border-border"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin text-accent' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Shared Filter Bar */}
      <MapFiltersBar
        visibleCount={displayIncidents.length}
        totalMatchingCount={totalCount}
      />

      {/* Error state */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/50 bg-destructive/10 p-3.5 flex items-center justify-between text-xs text-destructive"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Failed to query incidents for the map: {error.message}</span>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            className="h-7 text-xs border-destructive/40"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Main Map Workspace with Split / Side Panel */}
      <div className="relative w-full h-[620px] md:h-[680px] flex gap-4">
        {/* Map Canvas Viewport */}
        <div className="flex-1 h-full min-w-0 relative">
          <DynamicIncidentMap
            incidents={displayIncidents}
            selectedIncidentId={selectedIncidentId}
            onSelectIncident={selectIncident}
            onBoundsChange={setCurrentBbox}
            className="h-full"
          />
        </div>

        {/* Side Panel: Preview Panel or Accessible List */}
        {selectedIncident ? (
          <div className="w-[380px] lg:w-[420px] shrink-0 h-full">
            <MapPreviewPanel
              key={selectedIncident.id}
              incident={selectedIncident}
              onClose={() => selectIncident(null)}
              onIncidentUpdated={handleIncidentUpdated}
              className="h-full"
            />
          </div>
        ) : isListOpen ? (
          <div className="w-[340px] lg:w-[380px] shrink-0 h-full hidden md:block">
            <MapAccessibleList
              incidents={displayIncidents}
              selectedIncidentId={selectedIncidentId}
              onSelectIncident={selectIncident}
              onClose={toggleList}
              className="h-full"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
