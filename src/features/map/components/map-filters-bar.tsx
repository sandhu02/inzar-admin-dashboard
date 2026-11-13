'use client';

import * as React from 'react';
import {
  Search,
  RotateCcw,
  List,
  Compass,
  Check,
  Flag,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMapFilters } from '../hooks/use-map-filters';
import { CATEGORY_MARKER_STYLES } from '../lib/map-constants';

interface MapFiltersBarProps {
  visibleCount: number;
  totalMatchingCount: number;
}

const CATEGORY_ITEMS = [
  { slug: 'fire', label: 'Fire' },
  { slug: 'accident', label: 'Accident' },
  { slug: 'road_block', label: 'Road Block' },
  { slug: 'flooding', label: 'Flooding' },
  { slug: 'gathering', label: 'Public Event' },
  { slug: 'other', label: 'Other Hazard' },
];

const REVIEW_STATUS_OPTIONS = [
  { value: 'all', label: 'All Review Statuses' },
  { value: 'needs_review', label: 'Needs Review' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'published', label: 'Published' },
  { value: 'not_approved', label: 'Not Approved' },
  { value: 'false_report', label: 'False Report' },
  { value: 'removed', label: 'Removed' },
];

const DATE_PRESET_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
];

export function MapFiltersBar({
  visibleCount,
  totalMatchingCount,
}: MapFiltersBarProps) {
  const {
    params,
    isListOpen,
    isViewportSync,
    hasActiveFilters,
    setFilter,
    toggleList,
    toggleViewportSync,
    resetFilters,
  } = useMapFilters();

  const [localSearch, setLocalSearch] = React.useState(params.q);
  const [prevUrlQ, setPrevUrlQ] = React.useState(params.q);

  // Sync local search when URL state changes
  if (prevUrlQ !== params.q) {
    setPrevUrlQ(params.q);
    setLocalSearch(params.q);
  }

  // Debounced search handler
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== params.q) {
        setFilter('q', localSearch ? localSearch : null);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, params.q, setFilter]);

  const handleCategoryToggle = (slug: string) => {
    const current = [...params.category];
    const index = current.indexOf(slug);
    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(slug);
    }
    setFilter('category', current.length > 0 ? current : null);
  };

  const handleReviewStatusChange = (val: string) => {
    setFilter('review', val === 'all' ? null : [val]);
  };

  const handleDatePresetChange = (val: string) => {
    setFilter('date_preset', val === 'all' ? null : val);
  };

  const activeReviewStatus = params.review.length === 1 ? params.review[0]! : 'all';

  return (
    <div
      data-testid="map-filters-bar"
      className="space-y-2.5 rounded-xl border border-border bg-card p-3 shadow-sm select-none"
    >
      {/* Top Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-1 items-center gap-2 min-w-[220px] max-w-sm">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              data-testid="map-search-input"
              placeholder="Search title, place, ID..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-9 h-9 text-xs font-sans bg-surface-elevated/40"
              aria-label="Filter incidents on map"
            />
          </div>
        </div>

        {/* Quick Dropdown Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Review Status Selector */}
          <Select
            value={activeReviewStatus}
            onValueChange={handleReviewStatusChange}
          >
            <SelectTrigger
              className="h-9 text-xs font-medium w-[150px] bg-surface-elevated/40"
              aria-label="Filter by review status"
            >
              <SelectValue placeholder="Review Status" />
            </SelectTrigger>
            <SelectContent>
              {REVIEW_STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Presets Selector */}
          <Select
            value={params.date_preset}
            onValueChange={handleDatePresetChange}
          >
            <SelectTrigger
              className="h-9 text-xs font-medium w-[130px] bg-surface-elevated/40"
              aria-label="Filter by date preset"
            >
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              {DATE_PRESET_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Flagged Only Toggle */}
          <Button
            type="button"
            size="sm"
            variant={params.flagged ? 'default' : 'outline'}
            onClick={() => setFilter('flagged', !params.flagged)}
            className="h-9 text-xs font-medium gap-1.5"
            aria-pressed={params.flagged}
          >
            <Flag className="h-3.5 w-3.5 text-status-warning" />
            Flagged
          </Button>

          {/* Has Media Toggle */}
          <Button
            type="button"
            size="sm"
            variant={params.has_media ? 'default' : 'outline'}
            onClick={() => setFilter('has_media', !params.has_media)}
            className="h-9 text-xs font-medium gap-1.5"
            aria-pressed={params.has_media}
          >
            <ImageIcon className="h-3.5 w-3.5 text-status-info" />
            Media
          </Button>

          {/* Removed Toggle */}
          <Button
            type="button"
            size="sm"
            variant={params.removed ? 'default' : 'outline'}
            onClick={() => setFilter('removed', !params.removed)}
            className="h-9 text-xs font-medium gap-1.5"
            aria-pressed={params.removed}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Removed
          </Button>

          {/* Viewport Sync Toggle */}
          <Button
            type="button"
            size="sm"
            data-testid="map-toggle-sync-btn"
            variant={isViewportSync ? 'secondary' : 'outline'}
            onClick={toggleViewportSync}
            className="h-9 text-xs font-medium gap-1.5 border-border"
            aria-pressed={isViewportSync}
            title={
              isViewportSync
                ? 'Viewport sync active: queries incidents in current map view'
                : 'Viewport sync off: queries all matching incidents'
            }
          >
            <Compass className={`h-3.5 w-3.5 ${isViewportSync ? 'text-accent' : ''}`} />
            {isViewportSync ? 'Sync On' : 'Sync Off'}
          </Button>

          {/* Accessible List Toggle */}
          <Button
            type="button"
            size="sm"
            data-testid="map-toggle-list-btn"
            variant={isListOpen ? 'secondary' : 'outline'}
            onClick={toggleList}
            className="h-9 text-xs font-medium gap-1.5"
            aria-pressed={isListOpen}
            title="Toggle incident list alternative (L)"
          >
            <List className="h-3.5 w-3.5" />
            List
          </Button>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={resetFilters}
              className="h-9 text-xs font-medium text-muted-foreground hover:text-foreground gap-1"
              aria-label="Reset all filters"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Category Pills Row */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/60">
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar flex-wrap">
          <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mr-1">
            Categories:
          </span>
          {CATEGORY_ITEMS.map((cat) => {
            const isSelected = params.category.includes(cat.slug);
            const style = CATEGORY_MARKER_STYLES[cat.slug] || CATEGORY_MARKER_STYLES.other!;

            return (
              <button
                key={cat.slug}
                type="button"
                data-testid={`map-category-filter-${cat.slug}`}
                onClick={() => handleCategoryToggle(cat.slug)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-sans font-medium transition-all duration-200 border ${
                  isSelected
                    ? 'border-accent bg-accent/15 text-accent shadow-sm'
                    : 'border-border/80 bg-surface-elevated/40 text-muted-foreground hover:text-foreground hover:border-border'
                }`}
                aria-pressed={isSelected}
                aria-label={`Filter by ${cat.label}`}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: style.colorHex }}
                />
                <span>{cat.label}</span>
                {isSelected && <Check className="h-3 w-3 text-accent" />}
              </button>
            );
          })}
        </div>

        {/* Live Counters */}
        <div className="text-[11px] font-mono text-muted-foreground whitespace-nowrap hidden sm:block">
          <span className="font-semibold text-foreground">{visibleCount}</span> visible
          {totalMatchingCount > visibleCount && (
            <span> / {totalMatchingCount} total</span>
          )}
        </div>
      </div>
    </div>
  );
}
