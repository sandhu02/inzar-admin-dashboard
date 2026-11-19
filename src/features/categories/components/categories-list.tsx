'use client';

import * as React from 'react';
import {
  GripVertical,
  Pencil,
  Power,
  ChevronUp,
  ChevronDown,
  Trash2,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CategoryChip } from '@/components/status/category-chip';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useReorderCategories } from '../hooks/use-categories';
import { cn } from '@/lib/utils';
import type { Category } from '../types';

interface CategoriesListProps {
  categories: Category[];
  onEditCategory: (category: Category) => void;
  onToggleCategoryStatus: (category: Category) => void;
}

export function CategoriesList({
  categories: items,
  onEditCategory,
  onToggleCategoryStatus,
}: CategoriesListProps) {
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);
  const reorderMutation = useReorderCategories();

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = async (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) {
      handleDragEnd();
      return;
    }

    const updated = [...items];
    const [movedItem] = updated.splice(draggedIndex, 1);
    if (!movedItem) return;
    updated.splice(dropIndex, 0, movedItem);

    // Re-assign sort_orders
    const reordered = updated.map((item, idx) => ({
      id: item.id,
      sort_order: idx + 1,
    }));

    handleDragEnd();
    await reorderMutation.mutateAsync(reordered);
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const updated = [...items];
    const currentItem = updated[index];
    const targetItem = updated[targetIndex];
    if (!currentItem || !targetItem) return;

    updated[index] = targetItem;
    updated[targetIndex] = currentItem;

    const reordered = updated.map((item, idx) => ({
      id: item.id,
      sort_order: idx + 1,
    }));

    await reorderMutation.mutateAsync(reordered);
  };

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center text-muted-foreground">
        No categories found. Click &quot;Add Category&quot; to define your first taxonomy entry.
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-2 select-none" data-testid="categories-list">
        {items.map((cat, index) => {
          const isDragging = draggedIndex === index;
          const isOver = dragOverIndex === index;
          const isFirst = index === 0;
          const isLast = index === items.length - 1;

          return (
            <div
              key={cat.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              onDrop={() => handleDrop(index)}
              className={cn(
                'group relative flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border bg-surface transition-all duration-150',
                isDragging
                  ? 'opacity-40 border-dashed border-accent shadow-lg'
                  : isOver
                  ? 'border-accent bg-surface-elevated/80'
                  : 'border-border/70 hover:border-border hover:bg-surface-elevated/40',
                !cat.is_active && 'opacity-60 bg-surface/50'
              )}
              data-category-id={cat.id}
            >
              {/* Left group: Drag handle + Order + Chip + Slug */}
              <div className="flex items-center gap-3">
                {/* Drag Handle */}
                <div
                  className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
                  title="Drag to reorder category"
                >
                  <GripVertical className="h-5 w-5" />
                </div>

                {/* Keyboard Order Controls */}
                <div className="flex flex-col items-center">
                  <span className="font-mono text-xs font-semibold text-muted-foreground">
                    #{cat.sort_order}
                  </span>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={isFirst || reorderMutation.isPending}
                      onClick={() => handleMove(index, 'up')}
                      className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                      aria-label={`Move ${cat.name} up`}
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={isLast || reorderMutation.isPending}
                      onClick={() => handleMove(index, 'down')}
                      className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                      aria-label={`Move ${cat.name} down`}
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Chip & Slug */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 ml-1">
                  <CategoryChip category={cat} />
                  <span className="font-mono text-xs text-muted-foreground bg-surface-elevated px-2 py-0.5 rounded border border-border/50">
                    {cat.slug}
                  </span>
                </div>
              </div>

              {/* Middle: Badges & Timers */}
              <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs">
                {/* Urgency Badge */}
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full font-mono text-[11px] font-semibold uppercase tracking-wider',
                    cat.urgency === 'high'
                      ? 'bg-status-danger/15 text-status-danger border border-status-danger/30'
                      : 'bg-surface-elevated text-muted-foreground border border-border/60'
                  )}
                >
                  {cat.urgency}
                </span>

                {/* Review Mode Pill */}
                {cat.require_manual_review ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 font-mono text-[11px]">
                    <ShieldCheck className="h-3 w-3" />
                    <span>Manual review</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-elevated text-muted-foreground border border-border/50 font-mono text-[11px]">
                    <span>Auto review</span>
                  </span>
                )}

                {/* Retention Timing */}
                <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground bg-surface-elevated/40 px-2.5 py-1 rounded-md border border-border/40">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
                  <span>
                    TTL: <strong className="text-foreground">{cat.default_ttl_minutes}m</strong> · Stale:{' '}
                    <strong className="text-foreground">{cat.stale_after_minutes}m</strong>
                  </span>
                </div>

                {/* Status Badge */}
                <span
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[11px] font-semibold uppercase tracking-wider',
                    cat.is_active
                      ? 'bg-status-success/15 text-status-success border border-status-success/30'
                      : 'bg-status-warning/15 text-status-warning border border-status-warning/30'
                  )}
                >
                  <span
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      cat.is_active ? 'bg-status-success' : 'bg-status-warning'
                    )}
                  />
                  {cat.is_active ? 'Active' : 'Deactivated'}
                </span>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-1.5 shrink-0 ml-auto md:ml-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onEditCategory(cat)}
                  className="h-8 px-2.5 gap-1.5 text-xs border-border bg-surface-elevated/50 hover:bg-surface-elevated"
                  aria-label={`Edit ${cat.name}`}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onToggleCategoryStatus(cat)}
                  className={cn(
                    'h-8 px-2.5 gap-1.5 text-xs border-border',
                    cat.is_active
                      ? 'hover:bg-status-danger/15 hover:text-status-danger hover:border-status-danger/40'
                      : 'hover:bg-status-success/15 hover:text-status-success hover:border-status-success/40'
                  )}
                  aria-label={cat.is_active ? `Deactivate ${cat.name}` : `Reactivate ${cat.name}`}
                >
                  {cat.is_active ? (
                    <>
                      <Power className="h-3.5 w-3.5 text-status-danger" />
                      <span>Deactivate</span>
                    </>
                  ) : (
                    <>
                      <Power className="h-3.5 w-3.5 text-status-success" />
                      <span>Reactivate</span>
                    </>
                  )}
                </Button>

                {/* Permanent deletion guard tooltip */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span tabIndex={0} className="inline-block">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled
                        className="h-8 w-8 text-muted-foreground/40 cursor-not-allowed opacity-50"
                        aria-label="Delete category disabled"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs text-xs">
                    Categories in use can only be deactivated, never deleted, to preserve historical incident integrity.
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
