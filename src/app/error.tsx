'use client';

import * as React from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-2xl border border-destructive/30 bg-card shadow-2xl">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-status-danger mx-auto border border-destructive/20">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <span className="font-mono text-xs uppercase tracking-widest text-status-danger font-semibold">
            500 · Application Error
          </span>
          <h1 className="text-2xl font-bold text-foreground">
            Something Went Wrong
          </h1>
          <p className="text-sm text-muted-foreground">
            An unexpected error occurred while processing this request. Our operations log has been recorded.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            variant="default"
            className="w-full sm:w-auto gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              <span>Back Home</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
