'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AlertTriangle, Ban } from 'lucide-react';

export type QuickReasonMode = 'reject' | 'mark_false';

interface QueueQuickReasonPickerProps {
  open: boolean;
  mode: QuickReasonMode;
  incidentTitle: string;
  onConfirm: (reason: string, notes?: string) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const REJECT_PRESETS = [
  'Insufficient verifiable evidence',
  'Duplicate report of existing incident',
  'Outdated ground event / Situation normalized',
  'Inappropriate or non-incident submission',
  'Low quality media / Unidentifiable scene',
];

const FALSE_REPORT_PRESETS = [
  'Misleading or staged visual content',
  'Location verified clear by field reports',
  'Malicious or fabricated false report',
  'Coordinated disinformation / Hoax submission',
];

interface QuickReasonContentProps {
  mode: QuickReasonMode;
  incidentTitle: string;
  onConfirm: (reason: string, notes?: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

function QuickReasonContent({
  mode,
  incidentTitle,
  onConfirm,
  onCancel,
  isSubmitting,
}: QuickReasonContentProps) {
  'use no memo';
  const presets = mode === 'reject' ? REJECT_PRESETS : FALSE_REPORT_PRESETS;
  const [selectedIndex, setSelectedIndex] = React.useState<number>(0);
  const [notes, setNotes] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleSubmit = React.useCallback(() => {
    const selectedPreset = presets[selectedIndex];
    const finalReason = selectedPreset || notes.trim();

    if (!finalReason) {
      setErrorMsg('A reason must be selected or provided.');
      return;
    }

    onConfirm(finalReason, notes.trim() || undefined);
  }, [presets, selectedIndex, notes, onConfirm]);

  // Handle number keys (1 - presets.length) and Enter/Esc while dialog is open
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isTextarea = (e.target as HTMLElement)?.tagName === 'TEXTAREA';

      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
        return;
      }

      if (!isTextarea) {
        const num = parseInt(e.key, 10);
        if (!isNaN(num) && num >= 1 && num <= presets.length) {
          e.preventDefault();
          setSelectedIndex(num - 1);
          setErrorMsg(null);
          return;
        }

        if (e.key === 'Enter') {
          e.preventDefault();
          handleSubmit();
        }
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [presets.length, onCancel, handleSubmit]);

  const isReject = mode === 'reject';
  const title = isReject ? 'Reject Incident Report' : 'Mark as False Report';
  const Icon = isReject ? Ban : AlertTriangle;

  return (
    <DialogContent
      className="sm:max-w-lg bg-surface border-border text-foreground"
      data-testid="quick-reason-picker-dialog"
    >
      <DialogHeader>
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg border',
              isReject
                ? 'bg-status-danger/10 border-status-danger/20 text-status-danger'
                : 'bg-status-warning/10 border-status-warning/20 text-status-warning'
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <DialogTitle className="text-lg font-bold font-sans">
              {title}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground truncate max-w-[360px]">
              {incidentTitle}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="space-y-4 py-2">
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-2">
            Select Quick Reason (Press 1-{presets.length})
          </label>
          <div className="space-y-1.5" role="radiogroup" aria-label="Presets">
            {presets.map((preset, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setSelectedIndex(idx);
                    setErrorMsg(null);
                  }}
                  role="radio"
                  aria-checked={isSelected}
                  className={cn(
                    'w-full flex items-center justify-between p-2.5 rounded-lg border text-left text-xs transition-colors',
                    isSelected
                      ? 'border-accent bg-accent/10 text-foreground font-semibold shadow-xs'
                      : 'border-border/60 bg-surface-elevated hover:bg-surface-elevated/80 text-muted-foreground'
                  )}
                  data-testid={`quick-reason-preset-${idx + 1}`}
                >
                  <span className="truncate pr-2">{preset}</span>
                  <kbd
                    className={cn(
                      'shrink-0 inline-flex h-5 w-5 items-center justify-center rounded font-mono text-[10px] font-bold border',
                      isSelected
                        ? 'border-accent bg-accent text-accent-foreground'
                        : 'border-border bg-surface text-muted-foreground'
                    )}
                  >
                    {idx + 1}
                  </kbd>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label
            htmlFor="quick-reason-notes"
            className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1.5"
          >
            Additional Audit Notes (Optional)
          </label>
          <textarea
            id="quick-reason-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Provide further context or details for audit logs..."
            rows={2}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent resize-none"
            data-testid="quick-reason-notes-input"
          />
        </div>

        {errorMsg && (
          <p className="text-xs text-status-danger font-mono" role="alert">
            {errorMsg}
          </p>
        )}
      </div>

      <DialogFooter className="flex flex-row justify-between sm:justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="text-xs"
        >
          Cancel (Esc)
        </Button>
        <Button
          type="button"
          variant={isReject ? 'destructive' : 'default'}
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="text-xs gap-1.5"
          data-testid="quick-reason-confirm-btn"
        >
          {isSubmitting ? 'Confirming...' : 'Confirm Decision (Enter)'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export function QueueQuickReasonPicker({
  open,
  mode,
  incidentTitle,
  onConfirm,
  onCancel,
  isSubmitting = false,
}: QueueQuickReasonPickerProps) {
  return (
    <Dialog open={open} onOpenChange={(val) => !val && onCancel()}>
      {open && (
        <QuickReasonContent
          key={`${mode}-${incidentTitle}`}
          mode={mode}
          incidentTitle={incidentTitle}
          onConfirm={onConfirm}
          onCancel={onCancel}
          isSubmitting={isSubmitting}
        />
      )}
    </Dialog>
  );
}
