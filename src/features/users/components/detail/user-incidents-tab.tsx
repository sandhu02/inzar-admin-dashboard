'use client';

import * as React from 'react';
import Link from 'next/link';
import { ExternalLink, Flag, MapPin, FileQuestion } from 'lucide-react';
import { StatusBadge } from '@/components/status/status-badge';
import { CategoryChip } from '@/components/status/category-chip';
import { formatReportedTime } from '@/lib/format/date';
import { useUserIncidents } from '../../hooks/use-user-incidents';

interface UserIncidentsTabProps {
  userId: string;
}

export function UserIncidentsTab({ userId }: UserIncidentsTabProps) {
  const { data, isLoading, isError, error } = useUserIncidents(userId);

  const incidents = data?.items || [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={`inc-skel-${i}`} className="p-4 rounded-xl border border-border bg-card animate-pulse h-20" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 rounded-xl border border-status-danger/30 bg-status-danger/10 text-xs text-status-danger">
        Failed to load incidents: {error?.message || 'Network error'}
      </div>
    );
  }

  if (incidents.length === 0) {
    return (
      <div className="p-8 rounded-xl border border-border bg-card text-center" data-testid="user-no-incidents">
        <FileQuestion className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm font-semibold text-foreground">No reports recorded</p>
        <p className="text-xs text-muted-foreground mt-1">This user has not submitted any incident reports yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="user-incidents-list">
      <div className="text-xs text-muted-foreground font-mono flex items-center justify-between pb-1">
        <span>Recorded Incident Reports ({incidents.length})</span>
        <span className="text-[11px] text-muted-foreground/70">
          Note: Opening incidents respects audited privacy reveal protocols
        </span>
      </div>

      <div className="divide-y divide-border/60 rounded-xl border border-border bg-card overflow-hidden">
        {incidents.map((incident) => {
          return (
            <Link
              key={incident.id}
              href={`/incidents/${incident.id}`}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-surface-elevated/50 transition-colors group"
              data-testid={`user-incident-row-${incident.id}`}
            >
              <div className="flex items-start gap-3 min-w-0">
                {incident.thumbnail_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={incident.thumbnail_url}
                    alt={incident.title}
                    className="h-12 w-12 rounded-lg object-cover border border-border shrink-0 bg-surface"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-lg border border-border bg-surface-elevated flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CategoryChip category={incident.category} />
                    <span className="font-semibold text-xs text-foreground group-hover:text-accent transition-colors truncate">
                      {incident.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] font-mono text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {incident.place_label || 'Fuzzed Coordinates'}
                    </span>
                    {(incident.flags_count ?? 0) > 0 && (
                      <span className="flex items-center gap-1 text-status-warning">
                        <Flag className="h-3 w-3" /> {incident.flags_count} flags
                      </span>
                    )}
                    <span>Reported {formatReportedTime(incident.reported_at)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                <StatusBadge status={incident.review_status} />
                <StatusBadge status={incident.lifecycle_status} />
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors ml-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
