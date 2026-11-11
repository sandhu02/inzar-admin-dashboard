'use client';

import * as React from 'react';
import type { Incident } from '../types';

export interface ProgressiveMediaContextValue {
  canLoad: (id: string) => boolean;
  isLoaded: (id: string) => boolean;
  hasError: (id: string) => boolean;
  onImageLoaded: (id: string) => void;
  onImageError: (id: string) => void;
}

const ProgressiveMediaContext = React.createContext<ProgressiveMediaContextValue>({
  canLoad: () => true,
  isLoaded: () => true,
  hasError: () => false,
  onImageLoaded: () => {},
  onImageError: () => {},
});

export function useProgressiveMedia() {
  return React.useContext(ProgressiveMediaContext);
}

interface ProgressiveMediaProviderProps {
  items: Incident[];
  refreshKey?: string | number;
  children: React.ReactNode;
}

const IS_TEST = process.env.NODE_ENV === 'test';
// Do not load media initially: wait for initial data layout to render instantaneously
const INITIAL_DEFER_MS = IS_TEST ? 10 : 150;
// Stagger images so they appear one by one as retrieved
const PACING_DELAY_MS = IS_TEST ? 0 : 80;
// Safety timeout in case network request hangs or fails silently
const SAFETY_TIMEOUT_MS = IS_TEST ? 50 : 3500;

export function ProgressiveMediaProvider({
  items,
  refreshKey,
  children,
}: ProgressiveMediaProviderProps) {
  'use no memo';
  const [allowedIds, setAllowedIds] = React.useState<Set<string>>(() => new Set());
  const [loadedIds, setLoadedIds] = React.useState<Set<string>>(() => new Set());
  const [errorIds, setErrorIds] = React.useState<Set<string>>(() => new Set());

  const currentIndexRef = React.useRef(0);
  const activeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const mediaItems = React.useMemo(() => {
    return items.filter((item) => Boolean(item.thumbnail_url));
  }, [items]);

  const mediaItemsRef = React.useRef(mediaItems);
  React.useEffect(() => {
    mediaItemsRef.current = mediaItems;
  }, [mediaItems]);

  const clearTimers = React.useCallback(() => {
    if (activeTimerRef.current) {
      clearTimeout(activeTimerRef.current);
      activeTimerRef.current = null;
    }
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
  }, []);

  const advanceQueueRef = React.useRef<(nextIndex: number) => void>(() => {});

  const allowItemAtIndex = React.useCallback(
    (index: number) => {
      clearTimers();
      const currentList = mediaItemsRef.current;
      if (index >= currentList.length) return;

      const targetItem = currentList[index];
      if (!targetItem) return;

      currentIndexRef.current = index;
      setAllowedIds((prev) => {
        const next = new Set(prev);
        next.add(targetItem.id);
        return next;
      });

      // Safety timeout: if image hangs, automatically advance to next item
      safetyTimerRef.current = setTimeout(() => {
        advanceQueueRef.current(index + 1);
      }, SAFETY_TIMEOUT_MS);
    },
    [clearTimers]
  );

  const advanceQueue = React.useCallback(
    (nextIndex: number) => {
      clearTimers();
      const currentList = mediaItemsRef.current;
      if (nextIndex >= currentList.length) return;

      activeTimerRef.current = setTimeout(() => {
        allowItemAtIndex(nextIndex);
      }, PACING_DELAY_MS);
    },
    [clearTimers, allowItemAtIndex]
  );

  React.useEffect(() => {
    advanceQueueRef.current = advanceQueue;
  }, [advanceQueue]);

  const handleItemCompleted = React.useCallback(
    (id: string, isSuccess: boolean) => {
      if (isSuccess) {
        setLoadedIds((prev) => {
          if (prev.has(id)) return prev;
          const next = new Set(prev);
          next.add(id);
          return next;
        });
      } else {
        setErrorIds((prev) => {
          if (prev.has(id)) return prev;
          const next = new Set(prev);
          next.add(id);
          return next;
        });
      }

      const currentList = mediaItemsRef.current;
      const currentItem = currentList[currentIndexRef.current];

      // If the completed item is the current item in the sequence, advance to next
      if (currentItem && currentItem.id === id) {
        advanceQueue(currentIndexRef.current + 1);
      }
    },
    [advanceQueue]
  );

  const onImageLoaded = React.useCallback(
    (id: string) => {
      handleItemCompleted(id, true);
    },
    [handleItemCompleted]
  );

  const onImageError = React.useCallback(
    (id: string) => {
      handleItemCompleted(id, false);
    },
    [handleItemCompleted]
  );

  // When items change or refreshKey triggers: reset states and start progressive retrieval
  React.useEffect(() => {
    clearTimers();
    currentIndexRef.current = 0;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAllowedIds(new Set());
    setLoadedIds(new Set());
    setErrorIds(new Set());

    if (mediaItems.length === 0) return;

    // Defer initial media retrieval so initial table/card data renders instantaneously
    activeTimerRef.current = setTimeout(() => {
      allowItemAtIndex(0);
    }, INITIAL_DEFER_MS);

    return () => {
      clearTimers();
    };
  }, [items, refreshKey, mediaItems.length, clearTimers, allowItemAtIndex]);

  const canLoad = React.useCallback(
    (id: string) => allowedIds.has(id),
    [allowedIds]
  );

  const isLoaded = React.useCallback(
    (id: string) => loadedIds.has(id),
    [loadedIds]
  );

  const hasError = React.useCallback(
    (id: string) => errorIds.has(id),
    [errorIds]
  );

  const contextValue = React.useMemo(
    () => ({
      canLoad,
      isLoaded,
      hasError,
      onImageLoaded,
      onImageError,
    }),
    [canLoad, isLoaded, hasError, onImageLoaded, onImageError]
  );

  return (
    <ProgressiveMediaContext.Provider value={contextValue}>
      {children}
    </ProgressiveMediaContext.Provider>
  );
}
