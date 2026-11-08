import * as React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

export interface BackendError {
  code: string;
  message: string;
  details?: Record<string, unknown> | string | null;
}

interface ErrorBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  error?: BackendError | { error?: BackendError } | Error | string | null;
  onRetry?: () => void;
  title?: string;
}

export function ErrorBanner({
  error,
  onRetry,
  title = 'Something went wrong',
  className,
  ...props
}: ErrorBannerProps) {
  if (!error) return null;

  let message = 'An unexpected error occurred. Please try again.';
  let code: string | undefined;

  if (typeof error === 'string') {
    message = error;
  } else if ('error' in error && error.error) {
    message = error.error.message || message;
    code = error.error.code;
  } else if ('message' in error && typeof error.message === 'string') {
    message = error.message;
    if ('code' in error && typeof error.code === 'string') {
      code = error.code;
    }
  }

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-foreground',
        className
      )}
      {...props}
    >
      <AlertCircle className="h-5 w-5 text-status-danger shrink-0 mt-0.5" />
      <div className="flex-1 space-y-1">
        <div className="font-semibold text-status-danger flex items-center gap-2">
          <span>{title}</span>
          {code && (
            <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-destructive/20 text-status-danger">
              {code}
            </span>
          )}
        </div>
        <p className="text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="shrink-0 gap-1.5 h-8 border-destructive/30 hover:bg-destructive/20"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Retry</span>
        </Button>
      )}
    </div>
  );
}
