'use client';

import * as React from 'react';
import { AlertCircle, RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SettingsDirtyBarProps {
  isDirty: boolean;
  dirtyCount: number;
  isSaving: boolean;
  onDiscard: () => void;
  onSave: () => void;
}

export function SettingsDirtyBar({
  isDirty,
  dirtyCount,
  isSaving,
  onDiscard,
  onSave,
}: SettingsDirtyBarProps) {
  if (!isDirty) return null;

  return (
    <div
      role="region"
      aria-label="Unsaved settings changes toolbar"
      className="fixed bottom-6 left-4 right-4 md:left-72 md:right-8 z-40 flex items-center justify-between gap-4 p-4 rounded-xl border border-accent/40 bg-surface-elevated/95 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-accent/20 text-accent shrink-0">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">
            Careful — you have unsaved configuration changes!
          </h4>
          <p className="text-xs text-muted-foreground font-mono">
            {dirtyCount} {dirtyCount === 1 ? 'setting has' : 'settings have'} been modified and not yet applied.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onDiscard}
          disabled={isSaving}
          className="h-9 px-3 gap-1.5 border-border hover:bg-surface text-xs"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Discard</span>
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={onSave}
          disabled={isSaving}
          className="h-9 px-4 gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90 text-xs font-semibold shadow-sm"
        >
          <Check className="h-3.5 w-3.5" />
          <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
        </Button>
      </div>
    </div>
  );
}
