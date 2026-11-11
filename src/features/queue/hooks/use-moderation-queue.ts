'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchQueue,
  approveQueueItem,
  rejectQueueItem,
  markFalseQueueItem,
  revertApproveQueueItem,
} from '../api/queue';
import type { QueueItem } from '../types';

export interface UndoItemState {
  item: QueueItem;
  index: number;
  secondsRemaining: number;
}

const UNDO_DURATION_SECONDS = 5;

export function useModerationQueue(categoryId?: string) {
  'use no memo';
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [processedItemIds, setProcessedItemIds] = React.useState<Set<string>>(() => new Set());
  const [undoState, setUndoState] = React.useState<UndoItemState | null>(null);
  const undoTimerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch queue data
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['moderation-queue', categoryId || 'all'],
    queryFn: () => fetchQueue({ category_id: categoryId }),
    staleTime: 1000 * 30,
  });

  // Filter out items that have been processed in this session
  const activeItems = React.useMemo(() => {
    const rawItems = data?.items;
    if (!rawItems) return [];
    return rawItems.filter((item) => !processedItemIds.has(item.id));
  }, [data, processedItemIds]);

  // Safe index computation
  const safeCurrentIndex =
    activeItems.length === 0 ? 0 : Math.min(currentIndex, activeItems.length - 1);
  const currentItem = activeItems[safeCurrentIndex] || null;

  // Clean up timer on unmount
  React.useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearInterval(undoTimerRef.current);
    };
  }, []);

  // Clear active undo timer
  const clearUndoTimer = React.useCallback(() => {
    if (undoTimerRef.current) {
      clearInterval(undoTimerRef.current);
      undoTimerRef.current = null;
    }
    setUndoState(null);
  }, []);

  // Approve action with optimistic advance and undo window
  const approve = React.useCallback(
    async (notes?: string) => {
      if (!currentItem) return;
      const targetItem = currentItem;
      const originalIndex = safeCurrentIndex;

      // Optimistically hide from queue
      setProcessedItemIds((prev) => new Set(prev).add(targetItem.id));

      // Clear any prior undo timer
      if (undoTimerRef.current) clearInterval(undoTimerRef.current);

      // Start new undo window (5 seconds countdown)
      setUndoState({
        item: targetItem,
        index: originalIndex,
        secondsRemaining: UNDO_DURATION_SECONDS,
      });

      undoTimerRef.current = setInterval(() => {
        setUndoState((prev) => {
          if (!prev || prev.secondsRemaining <= 1) {
            if (undoTimerRef.current) {
              clearInterval(undoTimerRef.current);
              undoTimerRef.current = null;
            }
            return null;
          }
          return { ...prev, secondsRemaining: prev.secondsRemaining - 1 };
        });
      }, 1000);

      try {
        await approveQueueItem(targetItem.id, notes);
        // Refresh incidents queries in background
        queryClient.invalidateQueries({ queryKey: ['incidents'] });
        queryClient.invalidateQueries({ queryKey: ['overview-stats'] });
      } catch (err) {
        // Rollback on network failure
        setProcessedItemIds((prev) => {
          const next = new Set(prev);
          next.delete(targetItem.id);
          return next;
        });
        clearUndoTimer();
        throw err;
      }
    },
    [currentItem, safeCurrentIndex, queryClient, clearUndoTimer]
  );

  // Undo approval
  const undo = React.useCallback(async () => {
    if (!undoState) return;
    const { item, index } = undoState;
    clearUndoTimer();

    // Restore item to active items
    setProcessedItemIds((prev) => {
      const next = new Set(prev);
      next.delete(item.id);
      return next;
    });

    // Move focus back to restored item
    setCurrentIndex(index);

    try {
      await revertApproveQueueItem(item.id);
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    } catch {
      // Revert attempt logged
    }
  }, [undoState, clearUndoTimer, queryClient]);

  // Reject action (destructive, no optimistic silent undo)
  const reject = React.useCallback(
    async (reason: string, notes?: string) => {
      if (!currentItem) return;
      const targetItem = currentItem;

      clearUndoTimer();
      setProcessedItemIds((prev) => new Set(prev).add(targetItem.id));

      try {
        await rejectQueueItem(targetItem.id, reason, notes);
        queryClient.invalidateQueries({ queryKey: ['incidents'] });
        queryClient.invalidateQueries({ queryKey: ['overview-stats'] });
      } catch (err) {
        setProcessedItemIds((prev) => {
          const next = new Set(prev);
          next.delete(targetItem.id);
          return next;
        });
        throw err;
      }
    },
    [currentItem, clearUndoTimer, queryClient]
  );

  // Mark false action (destructive, no silent undo)
  const markFalse = React.useCallback(
    async (reason: string, notes?: string) => {
      if (!currentItem) return;
      const targetItem = currentItem;

      clearUndoTimer();
      setProcessedItemIds((prev) => new Set(prev).add(targetItem.id));

      try {
        await markFalseQueueItem(targetItem.id, reason, notes);
        queryClient.invalidateQueries({ queryKey: ['incidents'] });
        queryClient.invalidateQueries({ queryKey: ['overview-stats'] });
      } catch (err) {
        setProcessedItemIds((prev) => {
          const next = new Set(prev);
          next.delete(targetItem.id);
          return next;
        });
        throw err;
      }
    },
    [currentItem, clearUndoTimer, queryClient]
  );

  // Navigation: Next
  const goToNext = React.useCallback(() => {
    if (safeCurrentIndex < activeItems.length - 1) {
      setCurrentIndex(safeCurrentIndex + 1);
    }
  }, [safeCurrentIndex, activeItems.length]);

  // Navigation: Previous
  const goToPrevious = React.useCallback(() => {
    if (safeCurrentIndex > 0) {
      setCurrentIndex(safeCurrentIndex - 1);
    }
  }, [safeCurrentIndex]);

  return {
    items: activeItems,
    currentItem,
    currentIndex: safeCurrentIndex,
    totalCount: activeItems.length,
    initialQueueSize: data?.queue_size ?? activeItems.length,
    oldestItemAgeMinutes: data?.oldest_item_age_minutes ?? 0,
    oldestReportedAt: data?.oldest_reported_at ?? null,
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
    setCurrentIndex,
  };
}
