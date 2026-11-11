'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Keyboard } from 'lucide-react';

interface QueueShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SHORTCUTS = [
  { key: 'A', description: 'Approve incident and broadcast to live map', tag: 'Decision' },
  { key: 'R', description: 'Reject incident report (opens reason picker)', tag: 'Decision' },
  { key: 'F', description: 'Mark as false report (opens reason picker)', tag: 'Decision' },
  { key: 'J', description: 'Navigate to next incident report in queue', tag: 'Navigation' },
  { key: 'K', description: 'Navigate to previous incident report in queue', tag: 'Navigation' },
  { key: 'U', description: 'Undo approval (active for 5 seconds after approve)', tag: 'Action' },
  { key: '1 - 5', description: 'Select quick reason preset in picker dialog', tag: 'Reason Picker' },
  { key: 'Enter', description: 'Confirm decision in quick reason picker', tag: 'Dialog' },
  { key: 'Esc', description: 'Dismiss reason picker or shortcut cheat sheet', tag: 'Dialog' },
  { key: '?', description: 'Toggle this keyboard shortcut helper', tag: 'Helper' },
];

export function QueueShortcutsModal({ open, onOpenChange }: QueueShortcutsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-surface border-border text-foreground">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated border border-border">
              <Keyboard className="h-4 w-4 text-accent" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold font-sans">
                Moderation Keyboard Shortcuts
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                High-speed review controls designed for mouse-free queue operation.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-2 py-2">
          {SHORTCUTS.map((sc) => (
            <div
              key={sc.key}
              className="flex items-center justify-between p-2 rounded-md bg-surface-elevated/50 border border-border/50 text-sm"
            >
              <div className="flex items-center gap-2.5">
                <kbd className="inline-flex min-w-[28px] h-7 items-center justify-center rounded border border-border bg-surface px-2 font-mono text-xs font-bold text-accent shadow-xs">
                  {sc.key}
                </kbd>
                <span className="text-xs text-foreground">{sc.description}</span>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70">
                {sc.tag}
              </span>
            </div>
          ))}
        </div>

        <div className="text-[11px] text-muted-foreground/80 bg-surface-elevated/40 p-2.5 rounded-md border border-border/40">
          <strong>Tip:</strong> Keyboard shortcuts are automatically suspended while typing in text inputs or comment fields.
        </div>
      </DialogContent>
    </Dialog>
  );
}
