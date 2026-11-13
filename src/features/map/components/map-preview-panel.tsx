'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import {
  X,
  MapPin,
  Shield,
  Flag,
  Clock,
  ExternalLink,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { StatusBadge } from '@/components/status/status-badge';
import { CategoryChip } from '@/components/status/category-chip';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { performIncidentAction } from '@/features/incidents/api/incidents';
import { ActionDialog, type ModerationActionType } from '@/features/incidents/components/detail/action-dialog';
import { IncidentActionsBar } from '@/features/incidents/components/detail/incident-actions-bar';
import type { Incident, IncidentDetail } from '@/features/incidents/types';

interface MapPreviewPanelProps {
  incident: Incident;
  onClose: () => void;
  onIncidentUpdated?: (updated: Incident) => void;
  className?: string;
}

export function MapPreviewPanel({
  incident,
  onClose,
  onIncidentUpdated,
  className = '',
}: MapPreviewPanelProps) {
  const { toast } = useToast();
  const [activeAction, setActiveAction] = React.useState<ModerationActionType | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [overrideIncident, setOverrideIncident] = React.useState<Incident | null>(null);

  const currentIncident =
    overrideIncident && overrideIncident.id === incident.id
      ? overrideIncident
      : incident;

  // Keyboard shortcut: Esc closes preview panel
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !activeAction) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeAction, onClose]);

  const handleConfirmAction = async (
    action: ModerationActionType,
    reason: string,
    notes?: string
  ) => {
    setIsSubmitting(true);
    try {
      const updated = await performIncidentAction(
        currentIncident.id,
        action,
        reason,
        notes
      );

      toast({
        title: 'Moderation action applied',
        description: `Incident marked as ${updated.review_status}. Reason: "${reason}"`,
        variant: 'success',
      });

      const nextIncident: Incident = {
        ...currentIncident,
        review_status: updated.review_status,
        lifecycle_status: updated.lifecycle_status,
      };

      setOverrideIncident(nextIncident);
      if (onIncidentUpdated) {
        onIncidentUpdated(nextIncident);
      }
      setActiveAction(null);
    } catch (err) {
      toast({
        title: 'Action failed',
        description: err instanceof Error ? err.message : 'Failed to update incident',
        variant: 'danger',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  let relativeTime = 'Recently';
  try {
    relativeTime = formatDistanceToNow(new Date(currentIncident.reported_at), {
      addSuffix: true,
    });
  } catch {
    // fallback
  }

  // Cast currentIncident to IncidentDetail shape for IncidentActionsBar compatibility
  const detailShim: IncidentDetail = {
    ...currentIncident,
    exact_location: null, // Hard constraint: privacy by default
  };

  return (
    <>
      <aside
        data-testid="map-preview-panel"
        aria-label={`Incident details: ${currentIncident.title}`}
        className={`flex flex-col h-full bg-card border border-border rounded-xl shadow-xl overflow-hidden select-none ${className}`}
      >
        {/* Top Header */}
        <div className="p-3.5 border-b border-border bg-surface-elevated/40 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-muted-foreground uppercase">
              Incident {currentIncident.id}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Link
              href={`/incidents/${currentIncident.id}`}
              className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline px-2 py-1 rounded hover:bg-accent/10"
              title="Open full incident detail view"
              aria-label="Open full incident detail view"
            >
              Full Details <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              data-testid="map-preview-close"
              onClick={onClose}
              aria-label="Close incident preview panel"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Photo Thumbnail / Placeholder */}
          <div className="relative w-full h-44 rounded-lg overflow-hidden bg-surface-elevated border border-border flex items-center justify-center">
            {currentIncident.thumbnail_url ? (
              <Image
                src={currentIncident.thumbnail_url}
                alt={currentIncident.title}
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Shield className="h-8 w-8 text-muted-foreground/30" />
                <span className="text-xs font-mono">No imagery attached</span>
              </div>
            )}
          </div>

          {/* Badges & Meta */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CategoryChip
              category={currentIncident.category}
            />
            <div className="flex items-center gap-1.5">
              <StatusBadge
                status={currentIncident.review_status}
              />
              <StatusBadge
                status={currentIncident.lifecycle_status}
              />
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-1">
            <h3 className="text-base font-bold font-sans text-foreground leading-snug">
              {currentIncident.title}
            </h3>
            <p className="text-xs text-muted-foreground font-sans leading-relaxed">
              {currentIncident.description || 'No description provided with this report.'}
            </p>
          </div>

          {/* Location Intelligence (Strictly Fuzzed Coordinates) */}
          <div className="p-3 rounded-lg border border-border bg-surface-elevated/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3 text-accent" />
                Location
              </span>
              <span
                data-testid="map-preview-fuzzed-badge"
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-surface text-muted-foreground border border-border"
              >
                <Shield className="h-2.5 w-2.5 text-status-info" />
                FUZZED ~500M
              </span>
            </div>
            <div className="text-xs font-semibold text-foreground">
              {currentIncident.place_label || 'Reported Location'}
            </div>
            <div className="text-[11px] font-mono text-muted-foreground flex items-center justify-between">
              <span>
                {(currentIncident.fuzzed_location?.lat ?? 33.7294).toFixed(4)}°, {(currentIncident.fuzzed_location?.lng ?? 73.0551).toFixed(4)}°
              </span>
              <span className="text-[10px] text-muted-foreground/80 flex items-center gap-1">
                <Lock className="h-2.5 w-2.5 text-status-warning" />
                Exact GPS masked · Fuzzed ~250m for reporter privacy
              </span>
            </div>
          </div>

          {/* Time & Flags stats */}
          <div className="flex items-center justify-between text-xs font-mono text-muted-foreground pt-1 border-t border-border/60">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {relativeTime}
            </span>
            {(currentIncident.flags_count ?? 0) > 0 ? (
              <span className="inline-flex items-center gap-1 text-status-warning font-semibold">
                <Flag className="h-3.5 w-3.5" />
                {currentIncident.flags_count} flags
              </span>
            ) : (
              <span className="text-status-success inline-flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                No disputes
              </span>
            )}
          </div>

          {/* Moderation Actions Bar */}
          <div className="pt-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
              Moderation Actions
            </div>
            <IncidentActionsBar
              incident={detailShim}
              onSelectAction={(action) => setActiveAction(action)}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </aside>

      {/* Confirmation and Reason Dialog for Moderation Actions */}
      <ActionDialog
        action={activeAction}
        open={Boolean(activeAction)}
        onOpenChange={(open) => !open && setActiveAction(null)}
        onConfirm={handleConfirmAction}
        incidentTitle={currentIncident.title}
      />
    </>
  );
}
