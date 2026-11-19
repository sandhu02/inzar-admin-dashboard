'use client';

import * as React from 'react';
import { Clock, UserCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSettings } from '../hooks/use-settings';
import { SettingsForm } from './settings-form';
import { format } from 'date-fns';

export function SettingsView() {
  const { data: settings, isLoading, error } = useSettings();

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/80">
        <div>
          <h1 className="text-2xl font-bold font-sans text-foreground">
            Global Settings
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Admin platform runtime controls, intake pipeline rules, spatial limits, and rate thresholds.
          </p>
        </div>

        {/* Status Pill */}
        {settings && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-2.5 py-1 rounded-full font-mono text-xs border border-border bg-surface-elevated text-foreground flex items-center gap-1.5">
              <span
                className={`h-2 w-2 rounded-full ${
                  settings.review_mode === 'manual'
                    ? 'bg-accent'
                    : 'bg-status-warning'
                }`}
              />
              <span className="capitalize">{settings.review_mode.replace('_', '-')} Mode</span>
            </span>
          </div>
        )}
      </div>

      {/* Metadata & Governance Card */}
      {settings && (
        <TooltipProvider>
          <div className="p-4 rounded-xl border border-border/80 bg-surface flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <UserCheck className="h-4 w-4 text-accent" />
              <span>
                Last updated by:{' '}
                <strong className="text-foreground">{settings.updated_by}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground font-mono">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help hover:text-foreground">
                    {settings.updated_at
                      ? format(new Date(settings.updated_at), 'MMM d, yyyy · HH:mm')
                      : 'Unknown'}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="font-mono text-xs">
                  UTC: {settings.updated_at}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </TooltipProvider>
      )}

      {/* Main Content */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-16 w-full rounded-xl bg-surface-elevated" />
          <Skeleton className="h-64 w-full rounded-xl bg-surface-elevated" />
          <Skeleton className="h-64 w-full rounded-xl bg-surface-elevated" />
        </div>
      ) : error ? (
        <div className="p-6 rounded-xl border border-status-danger/40 bg-status-danger/10 text-status-danger text-sm">
          Failed to load platform settings. Please check backend connection or refresh.
        </div>
      ) : settings ? (
        <SettingsForm settings={settings} />
      ) : null}
    </div>
  );
}
