import * as React from 'react';
import {
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  Trash2,
  Check,
  EyeOff,
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ReviewStatus =
  | 'ai_reviewed'
  | 'under_review'
  | 'needs_review'
  | 'published'
  | 'not_approved'
  | 'removed'
  | 'false_report';

export type LifecycleStatus = 'active' | 'resolved' | 'expired' | 'hidden';

export type AnyStatus = ReviewStatus | LifecycleStatus | string;

interface StatusConfig {
  label: string;
  icon: LucideIcon;
  variant:
    | 'info'
    | 'warning'
    | 'success'
    | 'danger'
    | 'destructive'
    | 'secondary'
    | 'accent'
    | 'default';
  classes: string;
}

const STATUS_CONFIGS: Record<string, StatusConfig> = {
  // Review statuses
  ai_reviewed: {
    label: 'AI reviewed',
    icon: Sparkles,
    variant: 'info',
    classes: 'border-status-info/30 bg-status-info/10 text-status-info',
  },
  under_review: {
    label: 'Under review',
    icon: Clock,
    variant: 'warning',
    classes: 'border-status-warning/30 bg-status-warning/10 text-status-warning',
  },
  checking: {
    label: 'Checking',
    icon: Clock,
    variant: 'warning',
    classes: 'border-status-warning/30 bg-status-warning/10 text-status-warning',
  },
  awaiting_media: {
    label: 'Awaiting media',
    icon: Clock,
    variant: 'info',
    classes: 'border-status-info/30 bg-status-info/10 text-status-info',
  },
  needs_review: {
    label: 'Under review',
    icon: Clock,
    variant: 'warning',
    classes: 'border-status-warning/30 bg-status-warning/10 text-status-warning',
  },
  published: {
    label: 'Published',
    icon: CheckCircle2,
    variant: 'success',
    classes: 'border-status-success/30 bg-status-success/10 text-status-success',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    variant: 'danger',
    classes: 'border-status-danger/30 bg-status-danger/10 text-status-danger',
  },
  not_approved: {
    label: 'Not approved',
    icon: XCircle,
    variant: 'danger',
    classes: 'border-status-danger/30 bg-status-danger/10 text-status-danger',
  },
  removed: {
    label: 'Removed',
    icon: Trash2,
    variant: 'secondary',
    classes: 'border-border bg-surface-elevated text-muted-foreground',
  },
  false_report: {
    label: 'False report',
    icon: AlertOctagon,
    variant: 'danger',
    classes: 'border-status-danger/40 bg-status-danger/10 text-status-danger',
  },

  // Lifecycle statuses
  active: {
    label: 'Active',
    icon: CheckCircle2,
    variant: 'default',
    classes: 'border-border bg-surface-elevated text-foreground',
  },
  resolved: {
    label: 'Resolved',
    icon: Check,
    variant: 'secondary',
    classes: 'border-border bg-surface-elevated text-muted-foreground',
  },
  expired: {
    label: 'Expired',
    icon: Clock,
    variant: 'secondary',
    classes: 'border-border bg-surface-elevated text-muted-foreground',
  },
  hidden: {
    label: 'Hidden',
    icon: EyeOff,
    variant: 'secondary',
    classes: 'border-border bg-surface-elevated text-muted-foreground',
  },
};

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: AnyStatus;
  showIcon?: boolean;
}

export function StatusBadge({
  status,
  showIcon = true,
  className,
  ...props
}: StatusBadgeProps) {
  const normalizedKey = status.toLowerCase().replace(/[\s-]/g, '_');
  const config = STATUS_CONFIGS[normalizedKey] || {
    label: status.replace(/_/g, ' '),
    icon: Clock,
    variant: 'default',
    classes: 'border-border bg-surface-elevated text-foreground',
  };

  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-mono font-medium border transition-colors',
        config.classes,
        className
      )}
      data-status={normalizedKey}
      {...props}
    >
      {showIcon && <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />}
      <span>{config.label}</span>
    </span>
  );
}
