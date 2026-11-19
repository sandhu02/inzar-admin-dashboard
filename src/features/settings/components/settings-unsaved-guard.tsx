'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface SettingsUnsavedGuardProps {
  isDirty: boolean;
}

export function SettingsUnsavedGuard({ isDirty }: SettingsUnsavedGuardProps) {
  const router = useRouter();
  const [pendingUrl, setPendingUrl] = React.useState<string | null>(null);

  // 1. Browser tab close / refresh listener
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // 2. Intercept internal link clicks when form is dirty
  React.useEffect(() => {
    if (!isDirty) return;

    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

      // If linking to a different path
      if (href !== window.location.pathname) {
        e.preventDefault();
        e.stopPropagation();
        setPendingUrl(href);
      }
    };

    document.addEventListener('click', handleAnchorClick, true);
    return () => document.removeEventListener('click', handleAnchorClick, true);
  }, [isDirty]);

  const handleConfirmLeave = () => {
    if (pendingUrl) {
      const dest = pendingUrl;
      setPendingUrl(null);
      router.push(dest);
    }
  };

  const handleCancelLeave = () => {
    setPendingUrl(null);
  };

  return (
    <Dialog
      open={Boolean(pendingUrl)}
      onOpenChange={(open) => !open && handleCancelLeave()}
    >
      <DialogContent className="max-w-md bg-surface border-border p-6 text-foreground">
        <DialogHeader className="pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-status-danger/15 text-status-danger">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold font-sans text-foreground">
                Discard Unsaved Settings Changes?
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Unsaved modifications will be permanently lost
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4 text-xs text-muted-foreground leading-relaxed">
          You have modified platform settings without saving. Are you sure you want to navigate away from this page?
        </div>

        <DialogFooter className="pt-3 border-t border-border flex items-center justify-between sm:justify-between">
          <Button type="button" variant="outline" onClick={handleCancelLeave}>
            Stay on Page
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={handleConfirmLeave}
            className="bg-status-danger text-white hover:bg-status-danger/90"
          >
            Leave & Discard Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
