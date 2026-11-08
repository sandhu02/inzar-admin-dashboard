'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { RowSelectionState } from '@tanstack/react-table';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ErrorBanner } from '@/components/ui/error-banner';
import { DataTable } from '@/components/data-table/data-table';
import { fetchIncidents } from '../api/incidents';
import { useIncidentFilters } from '../hooks/use-incident-filters';
import { useColumnVisibility } from '../hooks/use-column-visibility';
import { getIncidentColumns } from './incident-columns';
import { IncidentFilterPanel } from './incident-filter-panel';
import { IncidentFilterChips } from './incident-filter-chips';
import { IncidentSavedViews } from './incident-saved-views';
import { IncidentColumnVisibility } from './incident-column-visibility';
import { IncidentBulkActions } from './incident-bulk-actions';
import { IncidentCardList } from './incident-card-list';
import type { Incident, SavedView } from '../types';

function IncidentSearchBox({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [localValue, setLocalValue] = React.useState(value);
  const [prevValue, setPrevValue] = React.useState(value);

  // Sync state during render when prop changes (e.g. on clear all)
  if (value !== prevValue) {
    setPrevValue(value);
    setLocalValue(value);
  }

  React.useEffect(() => {
    const handler = setTimeout(() => {
      const trimmed = localValue.trim();
      if (trimmed !== value) {
        onChange(trimmed);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [localValue, value, onChange]);

  return (
    <div className="relative flex-1 min-w-[200px]">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        placeholder="Search incidents by title, description, or place..."
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className="pl-9 h-9 text-xs font-sans bg-surface border-border"
      />
    </div>
  );
}

export function IncidentsLedger() {
  const {
    activeFilters,
    rawParams,
    setFilter,
    setMultipleFilters,
    setCursor,
    setSort,
    setView,
    clearAllFilters,
  } = useIncidentFilters();

  const { columnVisibility, setColumnVisibility } = useColumnVisibility();

  // Table row selection state
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  // Query server state
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-incidents', activeFilters],
    queryFn: () => fetchIncidents(activeFilters),
  });

  const items = data?.items || [];
  const totalCount = data?.total_count || 0;
  const nextCursor = data?.next_cursor;
  const prevCursor = data?.prev_cursor;

  // Selected row IDs
  const selectedIndices = Object.keys(rowSelection);
  const selectedCount = selectedIndices.length;

  const handleClearSelection = () => {
    setRowSelection({});
  };

  const handleBulkAction = (action: string) => {
    const selectedIncidents = selectedIndices
      .map((idx) => items[parseInt(idx, 10)])
      .filter(Boolean) as Incident[];
    console.info(`Bulk ${action} for ${selectedIncidents.length} items`);
  };

  const handleRowAction = (action: string, incident: Incident) => {
    console.info(`Action ${action} on incident ${incident.id}`);
  };

  const columns = React.useMemo(
    () =>
      getIncidentColumns({
        sort: activeFilters.sort,
        onSortChange: (newSort) => setSort(newSort),
        onRowAction: handleRowAction,
      }),
    [activeFilters.sort, setSort]
  );

  // Calculate page number display
  const currentOffset = parseInt(rawParams.cursor || '0', 10) || 0;
  const pageNumber = Math.floor(currentOffset / 25) + 1;
  const showingCount = items.length;

  return (
    <div className="space-y-4">
      {/* Top Header matching Page 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-foreground tracking-tight">
            Incidents
          </h1>
          <p className="text-sm font-mono text-muted-foreground mt-0.5">
            {totalCount.toLocaleString()} incidents match · all statuses
          </p>
        </div>

        {/* Saved Views and Column Visibility */}
        <div className="flex items-center gap-2">
          <IncidentSavedViews
            currentFilters={activeFilters}
            activeViewId={rawParams.view || 'default'}
            onSelectView={(savedView: SavedView) => {
              setView(savedView.id);
              setMultipleFilters({
                q: savedView.filters.q || null,
                review: savedView.filters.review_status || null,
                lifecycle: savedView.filters.lifecycle_status || null,
                category: savedView.filters.category_id || null,
                date_preset: savedView.filters.date_preset || null,
                from: savedView.filters.created_from || null,
                to: savedView.filters.created_to || null,
                flagged: savedView.filters.flagged || null,
                has_media: savedView.filters.has_media || null,
                removed: savedView.filters.removed || null,
                near_lat: savedView.filters.near_lat || null,
                near_lng: savedView.filters.near_lng || null,
                radius_km: savedView.filters.radius_km || null,
                sort: savedView.filters.sort || 'reported_at:desc',
              });
            }}
          />

          <IncidentColumnVisibility
            visibility={columnVisibility}
            onVisibilityChange={setColumnVisibility}
          />
        </div>
      </div>

      {/* Filter Bar Row */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <IncidentFilterPanel
            filters={activeFilters}
            onApplyFilters={(newFilters) => {
              setMultipleFilters({
                review: newFilters.review_status || null,
                lifecycle: newFilters.lifecycle_status || null,
                category: newFilters.category_id || null,
                date_preset: newFilters.date_preset || null,
                from: newFilters.created_from || null,
                to: newFilters.created_to || null,
                flagged: newFilters.flagged || null,
                has_media: newFilters.has_media || null,
                removed: newFilters.removed || null,
                near_lat: newFilters.near_lat || null,
                near_lng: newFilters.near_lng || null,
                radius_km: newFilters.radius_km || null,
              });
            }}
            onResetFilters={clearAllFilters}
          />

          {/* Search box with 300ms debounce */}
          <IncidentSearchBox
            value={activeFilters.q || ''}
            onChange={(newQuery) => setFilter('q', newQuery || null)}
          />
        </div>

        {/* Filter Chips */}
        <IncidentFilterChips
          filters={activeFilters}
          onRemove={(filterKey) => {
            if (filterKey === 'review') setFilter('review', null);
            else if (filterKey === 'lifecycle') setFilter('lifecycle', null);
            else if (filterKey === 'category') setFilter('category', null);
            else if (filterKey === 'date_preset') setFilter('date_preset', null);
            else if (filterKey === 'flagged') setFilter('flagged', null);
            else if (filterKey === 'has_media') setFilter('has_media', null);
            else if (filterKey === 'removed') setFilter('removed', null);
            else if (filterKey === 'location') {
              setMultipleFilters({
                near_lat: null,
                near_lng: null,
                radius_km: null,
              });
            } else if (filterKey === 'q') {
              setFilter('q', null);
            }
          }}
          onClearAll={clearAllFilters}
        />
      </div>

      {/* Bulk Action Bar (when rows are selected) */}
      <IncidentBulkActions
        selectedCount={selectedCount}
        onClearSelection={handleClearSelection}
        onBulkAction={handleBulkAction}
      />

      {/* Error state */}
      {isError && (
        <ErrorBanner
          title="Failed to load incidents"
          error={error}
          onRetry={() => refetch()}
        />
      )}

      {/* Desktop Table View (>= 1024px) */}
      <div className="hidden lg:block">
        <DataTable
          columns={columns}
          data={items}
          isLoading={isLoading}
          emptyTitle="No incidents found"
          emptyDescription="No reports match your current filter criteria. Try adjusting or clearing filters."
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={setColumnVisibility}
        />
      </div>

      {/* Mobile/Tablet Card View (< 1024px) */}
      <div className="lg:hidden">
        <IncidentCardList
          items={items}
          isLoading={isLoading}
          selectedIds={
            new Set(selectedIndices.map((idx) => items[parseInt(idx, 10)]?.id || ''))
          }
          onToggleSelect={(id) => {
            const index = items.findIndex((it) => it.id === id);
            if (index !== -1) {
              setRowSelection((prev) => {
                const next = { ...prev };
                if (next[index]) delete next[index];
                else next[index] = true;
                return next;
              });
            }
          }}
          onRowAction={handleRowAction}
        />
      </div>

      {/* Pagination Footer matching Page 2 */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs font-mono text-muted-foreground border-t border-border">
        <div>
          SHOWING {showingCount} OF {totalCount.toLocaleString()} · CURSOR PAGE{' '}
          {pageNumber}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCursor(prevCursor || null)}
            disabled={!prevCursor || isLoading}
            className="h-8 px-3 font-mono text-xs border-border bg-surface hover:bg-surface-elevated disabled:opacity-40"
          >
            <ChevronLeft className="h-3.5 w-3.5 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCursor(nextCursor || null)}
            disabled={!nextCursor || isLoading}
            className="h-8 px-3 font-mono text-xs border-border bg-surface hover:bg-surface-elevated disabled:opacity-40"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
