'use client';

import * as React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Flag, MapPin, X } from 'lucide-react';
import { StatusBadge } from '@/components/status/status-badge';
import { CategoryChip } from '@/components/status/category-chip';
import { Button } from '@/components/ui/button';
import type { Incident } from '@/features/incidents/types';

interface MapAccessibleListProps {
  incidents: Incident[];
  selectedIncidentId?: string | null;
  onSelectIncident: (id: string | null) => void;
  onClose: () => void;
  className?: string;
}

export function MapAccessibleList({
  incidents,
  selectedIncidentId,
  onSelectIncident,
  onClose,
  className = '',
}: MapAccessibleListProps) {
  const listRef = React.useRef<HTMLUListElement>(null);
  const selectedItemRef = React.useRef<HTMLLIElement>(null);
  const [internalFocusedIndex, setFocusedIndex] = React.useState<number>(0);

  // Derive focusedIndex: if selectedIncidentId matches an incident, prefer its index
  const focusedIndex = React.useMemo(() => {
    if (selectedIncidentId) {
      const idx = incidents.findIndex((inc) => inc.id === selectedIncidentId);
      if (idx !== -1) return idx;
    }
    return Math.min(internalFocusedIndex, Math.max(0, incidents.length - 1));
  }, [selectedIncidentId, incidents, internalFocusedIndex]);

  // Auto-scroll to selected incident in the list when selected
  React.useEffect(() => {
    if (selectedIncidentId && selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedIncidentId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (incidents.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < incidents.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setFocusedIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setFocusedIndex(incidents.length - 1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const target = incidents[focusedIndex];
      if (target) {
        onSelectIncident(target.id);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <aside
      data-testid="map-accessible-list"
      aria-label="Accessible List of Visible Incidents"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`flex flex-col h-full bg-card border border-border rounded-xl overflow-hidden shadow-sm focus:outline-none focus:ring-1 focus:ring-accent ${className}`}
    >
      {/* Header */}
      <div className="p-3 border-b border-border bg-surface-elevated/40 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
            Visible Incidents ({incidents.length})
          </h2>
          <p className="text-[11px] text-muted-foreground font-sans mt-0.5">
            Keyboard accessible list of map markers
          </p>
        </div>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={onClose}
          aria-label="Close visible incidents list"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Accessible List items */}
      {incidents.length === 0 ? (
        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center text-muted-foreground">
          <MapPin className="h-8 w-8 text-muted-foreground/40 mb-2" />
          <p className="text-xs font-medium text-foreground">No incidents in visible area</p>
          <p className="text-[11px] mt-1 max-w-[200px]">
            Pan or zoom the map, or adjust your search filters to display incidents.
          </p>
        </div>
      ) : (
        <ul
          ref={listRef}
          role="listbox"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          aria-label="Select an incident to view details and moderation actions"
          className="flex-1 overflow-y-auto divide-y divide-border/60 p-1.5 space-y-1 focus:outline-none focus:ring-1 focus:ring-accent"
        >
          {incidents.map((incident, idx) => {
            const isSelected = incident.id === selectedIncidentId;
            const isFocused = idx === focusedIndex;
            let relativeTime = 'Recently';
            try {
              relativeTime = formatDistanceToNow(new Date(incident.reported_at), {
                addSuffix: true,
              });
            } catch {
              // fallback
            }

            return (
              <li
                key={incident.id}
                ref={isSelected ? selectedItemRef : null}
                role="option"
                id={`incident-option-${incident.id}`}
                aria-selected={isSelected}
                data-testid={`incident-list-item-${incident.id}`}
                onClick={() => onSelectIncident(incident.id)}
                className={`w-full text-left p-2.5 rounded-lg transition-colors flex flex-col gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent border cursor-pointer select-none ${
                  isSelected
                    ? 'bg-accent/10 border-accent/60 shadow-sm'
                    : isFocused
                      ? 'bg-surface-elevated/90 border-accent/40 shadow-sm'
                      : 'hover:bg-surface-elevated/60 border-transparent'
                }`}
              >
                <div className="flex items-center justify-between gap-1.5 w-full">
                  <CategoryChip
                    category={incident.category}
                  />
                  <StatusBadge
                    status={incident.review_status}
                  />
                </div>

                <div className="font-sans font-semibold text-xs text-foreground line-clamp-1">
                  {incident.title}
                </div>

                <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-muted-foreground">
                  <div className="flex items-center gap-1 truncate max-w-[180px]">
                    <MapPin className="h-3 w-3 shrink-0 text-muted-foreground" />
                    <span className="truncate">{incident.place_label}</span>
                  </div>
                  <span>{relativeTime}</span>
                </div>

                {(incident.flags_count ?? 0) > 0 && (
                  <div className="inline-flex items-center gap-1 text-[11px] font-mono text-status-warning">
                    <Flag className="h-3 w-3" />
                    <span>{incident.flags_count} community flags</span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
