import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-status-danger mx-auto border border-destructive/20">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <span className="font-mono text-xs uppercase tracking-widest text-status-danger font-semibold">
            403 · Access Restricted
          </span>
          <h1 className="text-2xl font-bold text-foreground">
            Insufficient Permissions
          </h1>
          <p className="text-sm text-muted-foreground">
            This section is restricted to system administrators. Your account does not have authorization to view or modify these resources.
          </p>
        </div>
        <div className="pt-2">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Overview</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
