import Link from 'next/link';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-elevated text-muted-foreground mx-auto border border-border">
          <HelpCircle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground font-semibold">
            404 · Page Not Found
          </span>
          <h1 className="text-2xl font-bold text-foreground">
            Resource Missing
          </h1>
          <p className="text-sm text-muted-foreground">
            The page or report you requested could not be located. It may have been removed or relocated.
          </p>
        </div>
        <div className="pt-2">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Overview</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
