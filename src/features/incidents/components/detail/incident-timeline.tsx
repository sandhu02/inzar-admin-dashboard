'use client';

import * as React from 'react';
import {
  Send,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Trash2,
  Check,
  Clock,
  LucideIcon,
} from 'lucide-react';
import { formatReportedTime } from '@/lib/format/date';
import type { TimelineEvent } from '../../types';

interface TimelineProps {
  events?: TimelineEvent[];
}

export function IncidentTimeline({ events = [] }: TimelineProps) {
  const getEventConfig = (
    type: TimelineEvent['type'],
    title: string
  ): { icon: LucideIcon; colorClasses: string; dotClasses: string } => {
    switch (type) {
      case 'submitted':
        return {
          icon: Send,
          colorClasses: 'text-foreground',
          dotClasses: 'border-border bg-surface-elevated text-muted-foreground',
        };
      case 'ai_reviewed':
        return {
          icon: Sparkles,
          colorClasses: 'text-status-info',
          dotClasses: 'border-status-info/40 bg-status-info/10 text-status-info',
        };
      case 'flagged':
        return {
          icon: AlertTriangle,
          colorClasses: 'text-status-warning',
          dotClasses: 'border-status-warning/40 bg-status-warning/10 text-status-warning',
        };
      case 'decision':
        if (title.toLowerCase().includes('approve') || title.toLowerCase().includes('publish')) {
          return {
            icon: CheckCircle2,
            colorClasses: 'text-status-success',
            dotClasses: 'border-status-success/40 bg-status-success/10 text-status-success',
          };
        }
        if (title.toLowerCase().includes('reject')) {
          return {
            icon: XCircle,
            colorClasses: 'text-status-danger',
            dotClasses: 'border-status-danger/40 bg-status-danger/10 text-status-danger',
          };
        }
        return {
          icon: Trash2,
          colorClasses: 'text-muted-foreground',
          dotClasses: 'border-border bg-surface-elevated text-muted-foreground',
        };
      case 'resolved':
        return {
          icon: Check,
          colorClasses: 'text-status-success',
          dotClasses: 'border-status-success/40 bg-status-success/10 text-status-success',
        };
      default:
        return {
          icon: Clock,
          colorClasses: 'text-muted-foreground',
          dotClasses: 'border-border bg-surface-elevated text-muted-foreground',
        };
    }
  };

  if (events.length === 0) {
    return (
      <div className="p-4 rounded-xl border border-border bg-card text-center text-xs text-muted-foreground">
        No lifecycle events recorded yet.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <Clock className="h-4 w-4 text-accent" />
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
          Incident Audit Timeline
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
        {events.map((event) => {
          const config = getEventConfig(event.type, event.title);
          const Icon = config.icon;

          return (
            <div key={event.id} className="relative group">
              {/* Dot Icon */}
              <div
                className={`absolute -left-6 top-0.5 h-6 w-6 rounded-full border flex items-center justify-center transition-transform group-hover:scale-110 ${config.dotClasses}`}
              >
                <Icon className="h-3 w-3" />
              </div>

              {/* Event Content */}
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h5 className="text-xs font-sans font-semibold text-foreground">
                    {event.title}
                  </h5>
                  <time
                    dateTime={event.timestamp}
                    className="text-[11px] font-mono text-muted-foreground whitespace-nowrap"
                  >
                    {formatReportedTime(event.timestamp)}
                  </time>
                </div>

                {event.description && (
                  <p className="text-xs font-sans text-muted-foreground leading-relaxed">
                    {event.description}
                  </p>
                )}

                {(event.actor || event.notes) && (
                  <div className="pt-1 flex items-center gap-2 text-[11px] font-mono text-muted-foreground/75 flex-wrap">
                    {event.actor && (
                      <span className="px-1.5 py-0.5 rounded bg-surface-elevated border border-border">
                        By: {event.actor}
                      </span>
                    )}
                    {event.notes && (
                      <span className="italic">
                        Note: &ldquo;{event.notes}&rdquo;
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
