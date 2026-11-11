import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, AlertCircle } from 'lucide-react';

export default function OverviewPage() {
  return (
    <div className="space-y-8">
      {/* Header with Title and Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-sans text-foreground">
            Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Control room for reports across the network.
          </p>
        </div>

        {/* Period Selector */}
        <div className="inline-flex items-center rounded-lg border border-border bg-surface p-1 self-start sm:self-auto">
          <button className="px-3 py-1 rounded-md text-xs font-mono font-medium text-muted-foreground hover:text-foreground transition-colors">
            24 h
          </button>
          <button className="px-3 py-1 rounded-md text-xs font-mono font-semibold bg-surface-elevated text-foreground shadow-xs">
            7 d
          </button>
          <button className="px-3 py-1 rounded-md text-xs font-mono font-medium text-muted-foreground hover:text-foreground transition-colors">
            30 d
          </button>
        </div>
      </div>

      {/* Primary KPI Cards Grid (Matches Page 1 of Design) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Queue Size */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-xs">
          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            QUEUE SIZE
          </p>
          <p className="text-4xl font-bold font-mono text-accent">14</p>
          <Link
            href="/queue"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-muted-foreground hover:text-accent transition-colors"
          >
            <span>OLDEST 38 MIN · OPEN QUEUE</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Card 2: New Incidents */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-xs">
          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            NEW INCIDENTS
          </p>
          <p className="text-4xl font-bold font-mono text-foreground">212</p>
          <Link
            href="/incidents"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-muted-foreground hover:text-accent transition-colors"
          >
            <span>LAST 7 DAYS · VIEW LIST</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Card 3: Flags Awaiting Action */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-xs">
          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            FLAGS AWAITING ACTION
          </p>
          <p className="text-4xl font-bold font-mono text-foreground">9</p>
          <Link
            href="/flags?status=pending"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-muted-foreground hover:text-accent transition-colors"
          >
            <span>ACROSS 6 INCIDENTS · VIEW FLAGS</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Card 4: Job Failures */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              JOB FAILURES
            </p>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-status-danger bg-destructive/15 border border-destructive/20">
              <AlertCircle className="h-3 w-3" />
              Needs retry
            </span>
          </div>
          <p className="text-4xl font-bold font-mono text-foreground">3</p>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-muted-foreground hover:text-accent transition-colors"
          >
            <span>BACKLOG 27 · VIEW JOBS</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Info Notice for Phase 1 */}
      <div className="rounded-xl border border-border/80 bg-surface/60 p-6">
        <h2 className="text-base font-semibold text-foreground mb-1">
          Authentication and App Shell Active
        </h2>
        <p className="text-sm text-muted-foreground max-w-2xl">
          You are authenticated with full role-aware navigation. Use the top-bar search and sidebar navigation to explore available sections. Deep data charts and live tables will populate as Phase 2 and subsequent modules are integrated.
        </p>
      </div>
    </div>
  );
}
