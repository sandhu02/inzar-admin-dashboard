'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Power } from 'lucide-react';
import { useToggleCategoryStatus } from '../hooks/use-categories';
import type { Category } from '../types';

interface CategoryDeactivateDialogProps {
  category: Category | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CategoryDeactivateDialog({
  category,
  open,
  onOpenChange,
  onSuccess,
}: CategoryDeactivateDialogProps) {
  const toggleMutation = useToggleCategoryStatus();
  if (!category) return null;

  const willDeactivate = category.is_active;

  const handleConfirm = async () => {
    try {
      await toggleMutation.mutateAsync({
        id: category.id,
        isActive: !willDeactivate,
      });
      onOpenChange(false);
      onSuccess?.();
    } catch {
      // handled
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-surface border-border p-6 text-foreground">
        <DialogHeader className="pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${
                willDeactivate
                  ? 'bg-status-danger/15 text-status-danger'
                  : 'bg-status-success/15 text-status-success'
              }`}
            >
              {willDeactivate ? (
                <AlertTriangle className="h-5 w-5" />
              ) : (
                <Power className="h-5 w-5" />
              )}
            </div>
            <div>
              <DialogTitle className="text-lg font-bold font-sans text-foreground">
                {willDeactivate
                  ? `Deactivate "${category.name}"?`
                  : `Reactivate "${category.name}"?`}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Category taxonomy governance rule
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4 space-y-3 text-xs leading-relaxed text-muted-foreground">
          {willDeactivate ? (
            <>
              <p>
                Deactivating <strong className="text-foreground">{category.name}</strong> will remove it from the citizen incident capture sheet and mobile intake filters.
              </p>
              <div className="p-3 rounded-lg border border-border/80 bg-surface-elevated/40 text-[11px] space-y-1">
                <span className="font-semibold text-foreground block">
                  Historic Integrity Notice:
                </span>
                <p>
                  Existing incidents classified under this category will retain their historical record and audit trail. Categories cannot be permanently deleted.
                </p>
              </div>
            </>
          ) : (
            <p>
              Reactivating <strong className="text-foreground">{category.name}</strong> will restore it to the citizen reporting options and live intake pipelines immediately.
            </p>
          )}
        </div>

        <DialogFooter className="pt-3 border-t border-border flex items-center justify-between sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={toggleMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={toggleMutation.isPending}
            className={
              willDeactivate
                ? 'bg-status-danger text-white hover:bg-status-danger/90'
                : 'bg-status-success text-white hover:bg-status-success/90'
            }
          >
            {toggleMutation.isPending
              ? 'Updating...'
              : willDeactivate
              ? 'Deactivate Category'
              : 'Reactivate Category'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
