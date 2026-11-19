'use client';

import * as React from 'react';
import { Plus, Tag, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCategories } from '../hooks/use-categories';
import { CategoriesList } from './categories-list';
import { CategoryFormDialog } from './category-form-dialog';
import { CategoryDeactivateDialog } from './category-deactivate-dialog';
import type { Category } from '../types';

export function CategoriesView() {
  const { data: categories = [], isLoading, error } = useCategories();

  const [formOpen, setFormOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null);

  const [deactivateOpen, setDeactivateOpen] = React.useState(false);
  const [targetCategory, setTargetCategory] = React.useState<Category | null>(null);

  const totalCount = categories.length;
  const activeCount = categories.filter((c) => c.is_active).length;
  const highUrgencyCount = categories.filter((c) => c.urgency === 'high').length;
  const manualReviewCount = categories.filter((c) => c.require_manual_review).length;

  const handleCreate = () => {
    setSelectedCategory(null);
    setFormOpen(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setFormOpen(true);
  };

  const handleToggleStatus = (category: Category) => {
    setTargetCategory(category);
    setDeactivateOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/80">
        <div>
          <h1 className="text-2xl font-bold font-sans text-foreground">
            Category Taxonomy
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Configure incident classifications, map marker styles, urgency tiers, and retention rules.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleCreate}
          className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add Category</span>
        </Button>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-border/70 bg-surface flex items-center gap-3">
          <div className="p-2 rounded-lg bg-surface-elevated text-foreground">
            <Tag className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider block">
              Total Defined
            </span>
            <span className="text-lg font-bold font-mono text-foreground">
              {totalCount}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-border/70 bg-surface flex items-center gap-3">
          <div className="p-2 rounded-lg bg-status-success/15 text-status-success">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider block">
              Active Intake
            </span>
            <span className="text-lg font-bold font-mono text-status-success">
              {activeCount}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-border/70 bg-surface flex items-center gap-3">
          <div className="p-2 rounded-lg bg-status-danger/15 text-status-danger">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider block">
              High Urgency
            </span>
            <span className="text-lg font-bold font-mono text-status-danger">
              {highUrgencyCount}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-border/70 bg-surface flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/15 text-accent">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider block">
              Manual Review
            </span>
            <span className="text-lg font-bold font-mono text-accent">
              {manualReviewCount}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl bg-surface-elevated" />
          ))}
        </div>
      ) : error ? (
        <div className="p-6 rounded-xl border border-status-danger/40 bg-status-danger/10 text-status-danger text-sm">
          Failed to load category taxonomy. Please refresh the page.
        </div>
      ) : (
        <CategoriesList
          categories={categories}
          onEditCategory={handleEdit}
          onToggleCategoryStatus={handleToggleStatus}
        />
      )}

      {/* Add / Edit Dialog */}
      <CategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        category={selectedCategory}
      />

      {/* Deactivate / Reactivate Dialog */}
      <CategoryDeactivateDialog
        open={deactivateOpen}
        onOpenChange={setDeactivateOpen}
        category={targetCategory}
      />
    </div>
  );
}
