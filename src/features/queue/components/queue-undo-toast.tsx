'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Undo2, CheckCircle2 } from 'lucide-react';
import type { UndoItemState } from '../hooks/use-moderation-queue';

interface QueueUndoToastProps {
  undoState: UndoItemState | null;
  onUndo: () => void;
}

export function QueueUndoToast({ undoState, onUndo }: QueueUndoToastProps) {
  if (!undoState) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-xl border border-accent/40 bg-surface-elevated/95 backdrop-blur-md px-4 py-3 shadow-2xl text-foreground animate-in fade-in slide-in-from-bottom-3 duration-200"
      data-testid="queue-undo-toast"
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-status-success/15 text-status-success shrink-0">
        <CheckCircle2 className="h-4 w-4" />
      </div>

      <div className="flex flex-col">
        <span className="text-xs font-semibold text-foreground truncate max-w-[260px] sm:max-w-[340px]">
          Approved: {undoState.item.title}
        </span>
        <span className="text-[11px] text-muted-foreground font-mono">
          Published to live map · {undoState.secondsRemaining}s to undo
        </span>
      </div>

      <Button
        type="button"
        size="sm"
        variant="default"
        onClick={onUndo}
        className="ml-2 gap-1.5 h-8 px-3 text-xs font-semibold bg-accent text-accent-foreground hover:bg-accent/90"
        data-testid="queue-undo-button"
      >
        <Undo2 className="h-3.5 w-3.5" />
        <span>Undo</span>
        <kbd className="hidden sm:inline-block ml-1 px-1 py-0.2 rounded bg-black/20 text-[10px] font-mono">
          U
        </kbd>
      </Button>
    </div>
  );
}
