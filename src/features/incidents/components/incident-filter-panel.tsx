'use client';

import * as React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { CategoryChip } from '@/components/status/category-chip';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import { IncidentLocationFilter } from './incident-location-filter';
import type { IncidentFilterValues } from '../types';

interface FilterPanelProps {
  filters: IncidentFilterValues;
  onApplyFilters: (newFilters: Partial<IncidentFilterValues>) => void;
  onResetFilters: () => void;
}

const REVIEW_OPTIONS = [
  { value: 'under_review', label: 'Under review' },
  { value: 'needs_review', label: 'Needs review' },
  { value: 'published', label: 'Published' },
  { value: 'ai_reviewed', label: 'AI reviewed' },
  { value: 'not_approved', label: 'Not approved' },
  { value: 'false_report', label: 'False report' },
  { value: 'removed', label: 'Removed' },
];

const LIFECYCLE_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'expired', label: 'Expired' },
  { value: 'hidden', label: 'Hidden' },
];

const DATE_PRESETS = [
  { value: 'all', label: 'All time' },
  { value: 'today', label: 'Today' },
  { value: '24h', label: '24 h' },
  { value: '7d', label: '7 d' },
  { value: '30d', label: '30 d' },
  { value: 'custom', label: 'Custom' },
];

function FilterFormContent({
  filters,
  activeCount,
  onApply,
  onReset,
  onCancel,
}: {
  filters: IncidentFilterValues;
  activeCount: number;
  onApply: (newFilters: Partial<IncidentFilterValues>) => void;
  onReset: () => void;
  onCancel: () => void;
}) {
  const [reviewStatus, setReviewStatus] = React.useState<string[]>(
    filters.review_status || []
  );
  const [lifecycleStatus, setLifecycleStatus] = React.useState<string[]>(
    filters.lifecycle_status || []
  );
  const [categoryId, setCategoryId] = React.useState<string[]>(
    filters.category_id || []
  );
  const [datePreset, setDatePreset] = React.useState<string>(
    filters.date_preset || 'all'
  );
  const [from, setFrom] = React.useState<string>(filters.created_from || '');
  const [to, setTo] = React.useState<string>(filters.created_to || '');
  const [flagged, setFlagged] = React.useState<boolean>(!!filters.flagged);
  const [hasMedia, setHasMedia] = React.useState<boolean>(!!filters.has_media);
  const [removed, setRemoved] = React.useState<boolean>(!!filters.removed);
  const [locationCenter, setLocationCenter] = React.useState<{
    lat?: number;
    lng?: number;
    radiusKm?: number;
  }>({
    lat: filters.near_lat,
    lng: filters.near_lng,
    radiusKm: filters.radius_km,
  });

  const toggleArrayItem = (
    currentList: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    value: string
  ) => {
    if (currentList.includes(value)) {
      setList(currentList.filter((item) => item !== value));
    } else {
      setList([...currentList, value]);
    }
  };

  const handleApply = () => {
    onApply({
      review_status: reviewStatus.length > 0 ? reviewStatus : undefined,
      lifecycle_status: lifecycleStatus.length > 0 ? lifecycleStatus : undefined,
      category_id: categoryId.length > 0 ? categoryId : undefined,
      date_preset: datePreset as IncidentFilterValues['date_preset'],
      created_from: datePreset === 'custom' && from ? from : undefined,
      created_to: datePreset === 'custom' && to ? to : undefined,
      flagged: flagged ? true : undefined,
      has_media: hasMedia ? true : undefined,
      removed: removed ? true : undefined,
      near_lat: locationCenter.lat,
      near_lng: locationCenter.lng,
      radius_km: locationCenter.radiusKm,
    });
  };

  return (
    <>
      <DialogHeader className="pb-3 border-b border-border">
        <DialogTitle className="text-lg font-bold font-sans text-foreground flex items-center justify-between">
          <span>Filter Incidents</span>
          {activeCount > 0 && (
            <span className="text-xs font-mono font-normal text-muted-foreground">
              {activeCount} filter(s) active
            </span>
          )}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-6 py-4">
        {/* Review Status Section */}
        <div className="space-y-2">
          <label className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground block">
            Review Status
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {REVIEW_OPTIONS.map((opt) => {
              const checked = reviewStatus.includes(opt.value);
              return (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 p-2 rounded-lg border border-border/70 hover:border-border bg-surface-elevated/40 cursor-pointer text-xs"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() =>
                      toggleArrayItem(reviewStatus, setReviewStatus, opt.value)
                    }
                  />
                  <span className="text-foreground">{opt.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Lifecycle Status Section */}
        <div className="space-y-2">
          <label className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground block">
            Lifecycle Status
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {LIFECYCLE_OPTIONS.map((opt) => {
              const checked = lifecycleStatus.includes(opt.value);
              return (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 p-2 rounded-lg border border-border/70 hover:border-border bg-surface-elevated/40 cursor-pointer text-xs"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() =>
                      toggleArrayItem(
                        lifecycleStatus,
                        setLifecycleStatus,
                        opt.value
                      )
                    }
                  />
                  <span className="text-foreground">{opt.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Category Section */}
        <div className="space-y-2">
          <label className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground block">
            Categories
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {DEFAULT_CATEGORIES.map((cat) => {
              const checked =
                categoryId.includes(cat.id) || categoryId.includes(cat.slug);
              return (
                <label
                  key={cat.id}
                  className="flex items-center gap-2 p-2 rounded-lg border border-border/70 hover:border-border bg-surface-elevated/40 cursor-pointer text-xs"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() =>
                      toggleArrayItem(categoryId, setCategoryId, cat.slug)
                    }
                  />
                  <CategoryChip category={cat} />
                </label>
              );
            })}
          </div>
        </div>

        {/* Date Range Section */}
        <div className="space-y-2">
          <label className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground block">
            Date Range
          </label>
          <div className="flex flex-wrap gap-2">
            {DATE_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => setDatePreset(preset.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors border ${
                  datePreset === preset.value
                    ? 'border-accent bg-accent/15 text-accent font-semibold'
                    : 'border-border/70 bg-surface-elevated/40 text-muted-foreground hover:text-foreground'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {datePreset === 'custom' && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-[10px] font-mono text-muted-foreground block mb-1">
                  START DATE (FROM)
                </label>
                <Input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="h-8 text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-muted-foreground block mb-1">
                  END DATE (TO)
                </label>
                <Input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>
          )}
        </div>

        {/* Flags and Attributes */}
        <div className="space-y-2">
          <label className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground block">
            Attributes & Flags
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <label className="flex items-center gap-2 p-2 rounded-lg border border-border/70 bg-surface-elevated/40 cursor-pointer text-xs">
              <Checkbox
                checked={flagged}
                onCheckedChange={(val) => setFlagged(!!val)}
              />
              <span className="text-foreground">Flagged only</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-lg border border-border/70 bg-surface-elevated/40 cursor-pointer text-xs">
              <Checkbox
                checked={hasMedia}
                onCheckedChange={(val) => setHasMedia(!!val)}
              />
              <span className="text-foreground">Has media</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-lg border border-border/70 bg-surface-elevated/40 cursor-pointer text-xs">
              <Checkbox
                checked={removed}
                onCheckedChange={(val) => setRemoved(!!val)}
              />
              <span className="text-foreground">Include removed</span>
            </label>
          </div>
        </div>

        {/* Location Radius Section */}
        <div className="pt-2 border-t border-border">
          <IncidentLocationFilter
            lat={locationCenter.lat}
            lng={locationCenter.lng}
            radiusKm={locationCenter.radiusKm}
            onApply={(lat, lng, radiusKm) => {
              setLocationCenter({ lat, lng, radiusKm });
            }}
            onClear={() => {
              setLocationCenter({});
            }}
          />
        </div>
      </div>

      <DialogFooter className="pt-3 border-t border-border flex items-center justify-between sm:justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="text-xs font-mono text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
          Reset all filters
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" variant="default" size="sm" onClick={handleApply}>
            Apply Filters
          </Button>
        </div>
      </DialogFooter>
    </>
  );
}

export function IncidentFilterPanel({
  filters,
  onApplyFilters,
  onResetFilters,
}: FilterPanelProps) {
  const [open, setOpen] = React.useState(false);

  // Count active filters
  const activeCount = React.useMemo(() => {
    let count = 0;
    if (filters.q) count++;
    if (filters.review_status?.length) count++;
    if (filters.lifecycle_status?.length) count++;
    if (filters.category_id?.length) count++;
    if (filters.date_preset && filters.date_preset !== 'all') count++;
    if (filters.flagged) count++;
    if (filters.has_media) count++;
    if (filters.removed) count++;
    if (typeof filters.near_lat === 'number') count++;
    return count;
  }, [filters]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className="h-9 px-3 gap-1.5 font-mono text-xs border-border bg-surface-elevated/60 hover:bg-surface-elevated"
        >
          <Filter className="h-3.5 w-3.5 text-accent" />
          <span>+ Add filter</span>
          {activeCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-accent text-accent-foreground font-bold">
              {activeCount}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-surface border-border p-6">
        {open && (
          <FilterFormContent
            filters={filters}
            activeCount={activeCount}
            onApply={(newFilters) => {
              onApplyFilters(newFilters);
              setOpen(false);
            }}
            onReset={() => {
              onResetFilters();
              setOpen(false);
            }}
            onCancel={() => setOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
