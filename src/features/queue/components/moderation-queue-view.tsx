'use client';

import * as React from 'react';
import { useModerationQueue } from '../hooks/use-moderation-queue';
import { QueueCard } from './queue-card';
import { QueueEmpty } from './queue-empty';
import { QueueShortcutsModal } from './queue-shortcuts-modal';
import {
  QueueQuickReasonPicker,
  type QuickReasonMode,
} from './queue-quick-reason-picker';
import { QueueUndoToast } from './queue-undo-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorBanner } from '@/components/ui/error-banner';
import { Button } from '@/components/ui/button';
import { Keyboard, Flame, ShieldAlert, AlertTriangle, Droplets, Users, HelpCircle, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORY_TABS = [
  { id: 'all', label: 'All Reports', icon: Layers },
  { id: 'fire', label: 'Fires', icon: Flame },
  { id: 'accident', label: 'Accidents', icon: AlertTriangle },
  { id: 'road_block', label: 'Road Blocks', icon: ShieldAlert },
  { id: 'flooding', label: 'Flooding', icon: Droplets },
  { id: 'gathering', label: 'Public Events', icon: Users },
  { id: 'other', label: 'Hazards', icon: HelpCircle },
];

export function ModerationQueueView() {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [shortcutsOpen, setShortcutsOpen] = React.useState(false);
  const [reasonPickerState, setReasonPickerState] = React.useState<{
    open: boolean;
    mode: QuickReasonMode;
  }>({
    open: false,
    mode: 'reject',
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    currentItem,
    currentIndex,
    totalCount,
    oldestItemAgeMinutes,
    isLoading,
    isError,
    error,
    refetch,
    approve,
    reject,
    markFalse,
    undo,
    undoState,
    goToNext,
    goToPrevious,
  } = useModerationQueue(selectedCategory === 'all' ? undefined : selectedCategory);

  // Focus management: ref to focus active container after decisions
  const queueCardContainerRef = React.useRef<HTMLDivElement>(null);

  const restoreFocus = React.useCallback(() => {
    // Keep focus within queue view so subsequent keyboard shortcuts continue to work
    setTimeout(() => {
      if (queueCardContainerRef.current) {
        queueCardContainerRef.current.focus();
      }
    }, 50);
  }, []);

  // Global Keyboard Shortcuts handler
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Guard: Disable shortcuts while typing in inputs, textareas, selects
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if (isInput) return;

      // 2. Guard: If dialog or reason picker is open, let dialog handle its own keys
      if (shortcutsOpen || reasonPickerState.open) return;

      const key = e.key.toLowerCase();

      // Help overlay
      if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        e.preventDefault();
        setShortcutsOpen(true);
        return;
      }

      // Undo approval (U key)
      if (key === 'u' && undoState) {
        e.preventDefault();
        undo();
        restoreFocus();
        return;
      }

      // If no active report, navigation and decision shortcuts do not fire
      if (!currentItem) return;

      // Approve (A key)
      if (key === 'a') {
        e.preventDefault();
        setIsSubmitting(true);
        approve()
          .catch(() => {})
          .finally(() => {
            setIsSubmitting(false);
            restoreFocus();
          });
        return;
      }

      // Reject (R key) -> opens quick reason picker
      if (key === 'r') {
        e.preventDefault();
        setReasonPickerState({ open: true, mode: 'reject' });
        return;
      }

      // Mark False (F key) -> opens quick reason picker
      if (key === 'f') {
        e.preventDefault();
        setReasonPickerState({ open: true, mode: 'mark_false' });
        return;
      }

      // Next report (J key)
      if (key === 'j') {
        e.preventDefault();
        goToNext();
        restoreFocus();
        return;
      }

      // Previous report (K key)
      if (key === 'k') {
        e.preventDefault();
        goToPrevious();
        restoreFocus();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    currentItem,
    shortcutsOpen,
    reasonPickerState.open,
    undoState,
    approve,
    undo,
    goToNext,
    goToPrevious,
    restoreFocus,
  ]);

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await approve();
    } finally {
      setIsSubmitting(false);
      restoreFocus();
    }
  };

  const handleConfirmReason = async (reason: string, notes?: string) => {
    setIsSubmitting(true);
    try {
      if (reasonPickerState.mode === 'reject') {
        await reject(reason, notes);
      } else {
        await markFalse(reason, notes);
      }
      setReasonPickerState({ open: false, mode: 'reject' });
    } finally {
      setIsSubmitting(false);
      restoreFocus();
    }
  };

  return (
    <div className="space-y-6" data-testid="moderation-queue-container">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold font-sans text-foreground">
              Moderation Queue
            </h1>
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-accent/15 text-accent border border-accent/30"
              data-testid="queue-count-badge"
            >
              {totalCount} PENDING
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Rapid verification workflow for citizen-submitted incident reports.
            {oldestItemAgeMinutes > 0 && (
              <span className="font-mono text-foreground/80 ml-1.5">
                · Oldest report waiting: {oldestItemAgeMinutes} min
              </span>
            )}
          </p>
        </div>

        {/* Shortcuts Cheat Sheet Trigger */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShortcutsOpen(true)}
          className="self-start sm:self-auto gap-1.5 text-xs border-border"
          data-testid="queue-shortcuts-trigger"
        >
          <Keyboard className="h-3.5 w-3.5 text-accent" />
          <span>Shortcuts</span>
          <kbd className="ml-1 px-1.5 py-0.2 rounded bg-surface-elevated text-[10px] font-mono border border-border">
            ?
          </kbd>
        </Button>
      </div>

      {/* Category Filter Tabs */}
      <div
        className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none"
        role="tablist"
        aria-label="Filter queue by category"
      >
        {CATEGORY_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setSelectedCategory(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border',
                isActive
                  ? 'bg-surface-elevated border-accent text-accent font-semibold shadow-xs'
                  : 'bg-surface border-border text-muted-foreground hover:text-foreground hover:bg-surface-elevated/60'
              )}
              data-testid={`queue-category-tab-${tab.id}`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Queue Viewport */}
      {isLoading ? (
        <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 animate-pulse">
          <div className="h-72 sm:h-96 w-full rounded-xl bg-surface-elevated" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ) : isError ? (
        <ErrorBanner
          error={error instanceof Error ? error.message : 'Unable to load moderation queue.'}
          title="Error Loading Queue"
          onRetry={() => refetch()}
        />
      ) : totalCount === 0 || !currentItem ? (
        <QueueEmpty
          onRefresh={() => refetch()}
          isFiltered={selectedCategory !== 'all'}
          onClearFilter={() => setSelectedCategory('all')}
        />
      ) : (
        <div ref={queueCardContainerRef} tabIndex={-1} className="outline-none">
          <QueueCard
            item={currentItem}
            currentIndex={currentIndex}
            totalCount={totalCount}
            onApprove={handleApprove}
            onOpenReject={() => setReasonPickerState({ open: true, mode: 'reject' })}
            onOpenMarkFalse={() => setReasonPickerState({ open: true, mode: 'mark_false' })}
            onNext={goToNext}
            onPrevious={goToPrevious}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {/* Quick Reason Picker Dialog (for Reject and Mark False) */}
      {currentItem && (
        <QueueQuickReasonPicker
          open={reasonPickerState.open}
          mode={reasonPickerState.mode}
          incidentTitle={currentItem.title}
          onConfirm={handleConfirmReason}
          onCancel={() => setReasonPickerState({ open: false, mode: 'reject' })}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Keyboard Shortcuts Cheat Sheet Dialog */}
      <QueueShortcutsModal
        open={shortcutsOpen}
        onOpenChange={setShortcutsOpen}
      />

      {/* Floating Undo Notification (active for 5s after approve) */}
      <QueueUndoToast undoState={undoState} onUndo={undo} />
    </div>
  );
}
