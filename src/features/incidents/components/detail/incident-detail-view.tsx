'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Copy,
  Clock,
  ExternalLink,
  Flame,
  AlertCircle,
} from 'lucide-react';
import { CategoryChip } from '@/components/status/category-chip';
import { StatusBadge } from '@/components/status/status-badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import {
  formatReportedTime,
  formatAge,
  formatUtcTooltip,
} from '@/lib/format/date';
import {
  fetchIncidentDetail,
  revealReporter,
  revealExactLocation,
  performIncidentAction,
} from '../../api/incidents';
import { IncidentPhotoViewer } from './incident-photo-viewer';
import { IncidentMiniMap } from './incident-mini-map';
import { IncidentReporterCard } from './incident-reporter-card';
import { IncidentTimeline } from './incident-timeline';
import { IncidentFlagsList } from './incident-flags-list';
import { IncidentActionsBar } from './incident-actions-bar';
import { ActionDialog, type ModerationActionType } from './action-dialog';
import { RevealDialog, type RevealType } from './reveal-dialog';
import type { IncidentDetail, ReporterProfile } from '../../types';

interface IncidentDetailViewProps {
  incidentId: string;
  onClose?: () => void;
  fullPage?: boolean;
}

export function IncidentDetailView({
  incidentId,
  onClose,
  fullPage = false,
}: IncidentDetailViewProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Dialog states
  const [selectedAction, setSelectedAction] = React.useState<ModerationActionType | null>(null);
  const [selectedReveal, setSelectedReveal] = React.useState<RevealType | null>(null);

  // Audited reveal state (auto-hides on leave / unmount, never stored in persistent storage)
  const [revealedReporter, setRevealedReporter] = React.useState<ReporterProfile | null>(null);
  const [reporterRevealReason, setReporterRevealReason] = React.useState<string | null>(null);

  const [revealedLocation, setRevealedLocation] = React.useState<{ lat: number; lng: number } | null>(null);
  const [locationRevealReason, setLocationRevealReason] = React.useState<string | null>(null);

  // Auto-reset reveal state during render whenever target incident ID changes
  const [prevIncidentId, setPrevIncidentId] = React.useState(incidentId);
  if (prevIncidentId !== incidentId) {
    setPrevIncidentId(incidentId);
    setRevealedReporter(null);
    setReporterRevealReason(null);
    setRevealedLocation(null);
    setLocationRevealReason(null);
  }

  // Fetch Incident Detail Query
  const {
    data: incident,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<IncidentDetail>({
    queryKey: ['incident-detail', incidentId],
    queryFn: () => fetchIncidentDetail(incidentId),
    staleTime: 30 * 1000,
  });

  // Action mutation
  const actionMutation = useMutation({
    mutationFn: async ({
      action,
      reason,
      notes,
    }: {
      action: ModerationActionType;
      reason: string;
      notes?: string;
    }) => {
      return performIncidentAction(incidentId, action, reason, notes);
    },
    onSuccess: (updatedIncident, variables) => {
      queryClient.setQueryData(['incident-detail', incidentId], updatedIncident);
      queryClient.invalidateQueries({ queryKey: ['admin-incidents'] });

      const actionLabels: Record<ModerationActionType, string> = {
        approve: 'Incident Approved & Published',
        reject: 'Incident Rejected',
        mark_false: 'Incident Marked as False Report',
        remove: 'Incident Removed from Public Ledger',
        restore: 'Incident Restored to Review Queue',
        resolve: 'Incident Marked as Resolved',
        re_review: 'Incident Re-queued for AI Review',
      };

      toast({
        title: actionLabels[variables.action] || 'Action Completed',
        description: `Status updated to ${updatedIncident.review_status}. Audit trail recorded.`,
        variant: variables.action === 'reject' || variables.action === 'mark_false' ? 'warning' : 'success',
      });
    },
    onError: (err: Error) => {
      // If state conflict or stale data, refresh incident detail and list
      if (
        err.message.toLowerCase().includes('conflict') ||
        err.message.toLowerCase().includes('state') ||
        err.message.toLowerCase().includes('not found')
      ) {
        queryClient.invalidateQueries({ queryKey: ['incident-detail', incidentId] });
        queryClient.invalidateQueries({ queryKey: ['admin-incidents'] });
      }

      toast({
        title: 'Action Failed',
        description: err.message,
        variant: 'danger',
      });
    },
  });

  // Reveal mutation
  const revealMutation = useMutation({
    mutationFn: async ({ type, reason }: { type: RevealType; reason: string }) => {
      if (type === 'reporter') {
        const rep = await revealReporter(incidentId, reason);
        return { type, reporter: rep, reason };
      } else {
        const loc = await revealExactLocation(incidentId, reason);
        return { type, location: loc, reason };
      }
    },
    onSuccess: (result) => {
      if (result.type === 'reporter' && result.reporter) {
        setRevealedReporter(result.reporter);
        setReporterRevealReason(result.reason);
        toast({
          title: 'Reporter Identity Revealed',
          description: `Authorized access granted for "${result.reason}". This action is audited.`,
          variant: 'warning',
        });
      } else if (result.type === 'location' && result.location) {
        setRevealedLocation(result.location);
        setLocationRevealReason(result.reason);
        toast({
          title: 'Exact Coordinates Revealed',
          description: `Pin precision unlocked for "${result.reason}". This action is audited.`,
          variant: 'warning',
        });
      }
    },
    onError: (err: Error) => {
      toast({
        title: 'Reveal Failed',
        description: err.message,
        variant: 'danger',
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 p-6" data-testid="incident-detail-skeleton">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-44 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !incident) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-status-danger/10 text-status-danger flex items-center justify-center mx-auto border border-status-danger/30">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold font-sans text-foreground">
          Failed to load incident detail
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          {error instanceof Error ? error.message : 'The incident record could not be retrieved.'}
        </p>
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
          {onClose && (
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>
    );
  }

  const handleCopyId = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(incident.id);
      toast({
        title: 'Copied ID',
        description: `Incident ID ${incident.id} copied to clipboard.`,
        variant: 'info',
      });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Metadata Section */}
      <div className="space-y-3 pb-4 border-b border-border">
        {/* Top Pills Bar */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <CategoryChip category={incident.category} />
            <StatusBadge status={incident.review_status} />
            <StatusBadge status={incident.lifecycle_status} />

            {/* Urgency Pill if available */}
            {incident.category?.urgency === 'high' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold bg-status-danger/15 text-status-danger border border-status-danger/30">
                <Flame className="h-3 w-3" />
                HIGH URGENCY
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyId}
              className="px-2 py-1 rounded-md border border-border bg-surface-elevated/70 hover:bg-surface-elevated text-xs font-mono text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
              title="Copy Incident ID"
            >
              <span className="max-w-[120px] truncate">{incident.id}</span>
              <Copy className="h-3 w-3 shrink-0" />
            </button>

            {!fullPage && (
              <a
                href={`/incidents/${encodeURIComponent(incident.id)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1 rounded-md border border-border bg-surface-elevated/70 hover:bg-surface-elevated text-xs font-mono text-accent hover:underline inline-flex items-center gap-1 transition-colors"
                title="Open in full page"
              >
                <span>Full Page</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-bold font-sans text-foreground tracking-tight">
          {incident.title}
        </h1>

        {/* Timestamps & Indicators */}
        <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground flex-wrap">
          <span
            className="cursor-help inline-flex items-center gap-1"
            title={formatUtcTooltip(incident.reported_at)}
          >
            <Clock className="h-3.5 w-3.5 text-accent" />
            Reported: {formatReportedTime(incident.reported_at)}
          </span>
          <span>·</span>
          <span>Age: {formatAge(incident.reported_at)}</span>
          {incident.last_confirmed_at && (
            <>
              <span>·</span>
              <span
                className="text-status-success cursor-help inline-flex items-center gap-1"
                title={formatUtcTooltip(incident.last_confirmed_at)}
              >
                Last confirmed: {formatReportedTime(incident.last_confirmed_at)}
              </span>
            </>
          )}
          {incident.expires_at && (
            <>
              <span>·</span>
              <span
                className="text-status-warning cursor-help inline-flex items-center gap-1"
                title={formatUtcTooltip(incident.expires_at)}
              >
                Expires: {formatReportedTime(incident.expires_at)}
              </span>
            </>
          )}
          {incident.published_at && (
            <>
              <span>·</span>
              <span
                className="text-muted-foreground cursor-help inline-flex items-center gap-1"
                title={formatUtcTooltip(incident.published_at)}
              >
                Last updated: {formatReportedTime(incident.published_at)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Moderation Actions Floating/Top Bar */}
      <IncidentActionsBar
        incident={incident}
        onSelectAction={(action) => setSelectedAction(action)}
        disabled={actionMutation.isPending}
      />

      {/* Media Photo Viewer with Zoom */}
      <section aria-label="Incident Media Evidence">
        <IncidentPhotoViewer
          mediaUrls={incident.media_urls}
          thumbnailUrl={incident.thumbnail_url}
          title={incident.title}
        />
      </section>

      {/* Description */}
      <section className="space-y-1.5 rounded-xl border border-border bg-card p-4" aria-label="Report Description">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
          Incident Narrative
        </h4>
        <p className="text-sm font-sans text-foreground leading-relaxed whitespace-pre-wrap">
          {incident.description || 'No detailed narrative provided with this report.'}
        </p>
      </section>

      {/* Dual Column: Location Map & Reporter Profile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Map Location Intelligence */}
        <IncidentMiniMap
          fuzzedLocation={incident.fuzzed_location}
          exactLocation={revealedLocation || incident.exact_location}
          placeLabel={incident.place_label}
          isRevealed={!!revealedLocation}
          revealReason={locationRevealReason}
          onOpenReveal={() => setSelectedReveal('location')}
        />

        {/* Reporter Privacy & Profile */}
        <IncidentReporterCard
          reporter={revealedReporter || incident.reporter}
          isRevealed={!!revealedReporter}
          revealReason={reporterRevealReason}
          onOpenReveal={() => setSelectedReveal('reporter')}
        />
      </div>

      {/* Timeline Audit History */}
      <section aria-label="Lifecycle and Review Timeline">
        <IncidentTimeline events={incident.timeline} />
      </section>

      {/* Community Flags */}
      <section aria-label="Community Flags">
        <IncidentFlagsList flags={incident.flags} />
      </section>

      {/* Action Dialog */}
      <ActionDialog
        action={selectedAction}
        open={!!selectedAction}
        onOpenChange={(isOpen) => !isOpen && setSelectedAction(null)}
        incidentTitle={incident.title}
        onConfirm={async (action, reason, notes) => {
          await actionMutation.mutateAsync({ action, reason, notes });
        }}
      />

      {/* Reveal Dialog */}
      <RevealDialog
        type={selectedReveal}
        open={!!selectedReveal}
        onOpenChange={(isOpen) => !isOpen && setSelectedReveal(null)}
        incidentId={incident.id}
        onConfirm={async (type, reason) => {
          await revealMutation.mutateAsync({ type, reason });
        }}
      />
    </div>
  );
}
