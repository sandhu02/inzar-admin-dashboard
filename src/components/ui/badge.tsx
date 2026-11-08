import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-mono font-medium transition-colors border',
  {
    variants: {
      variant: {
        default: 'border-border bg-surface-elevated text-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        accent: 'border-accent/30 bg-accent/10 text-accent',
        info: 'border-status-info/30 bg-status-info/10 text-status-info',
        success: 'border-status-success/30 bg-status-success/10 text-status-success',
        warning: 'border-status-warning/30 bg-status-warning/10 text-status-warning',
        danger: 'border-status-danger/30 bg-status-danger/10 text-status-danger',
        outline: 'border-border text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
