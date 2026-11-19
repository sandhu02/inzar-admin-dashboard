'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  categorySchema,
  categoryUpdateSchema,
  type CategoryFormData,
} from '../schemas';
import {
  useCreateCategory,
  useUpdateCategory,
} from '../hooks/use-categories';
import { CategoryMarkerPreview } from './category-marker-preview';
import { CATEGORY_ICON_REGISTRY } from '@/components/status/category-chip';
import type { Category } from '../types';

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  onSuccess?: () => void;
}

const PALETTE_SWATCHES = [
  '#FF6B2C', // Signal Orange
  '#FFC14D', // Warning Amber
  '#7CC4FF', // Info Blue
  '#6FD8A0', // Success Mint
  '#FF7B6E', // Danger Coral
  '#E2DDD5', // Bone / Roadblock
  '#A8A094', // Gathering Muted
  '#706B63', // Other Grey
  '#EF4444', // Red Hazard
  '#3B82F6', // Deep Blue
  '#8B5CF6', // Purple
  '#EAB308', // Dark Yellow
];

const AVAILABLE_ICONS = Object.keys(CATEGORY_ICON_REGISTRY);

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  onSuccess,
}: CategoryFormDialogProps) {
  const isEditing = Boolean(category);
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const defaultValues: CategoryFormData = {
    slug: category?.slug || '',
    name: category?.name || '',
    icon_key: category?.icon_key || 'alert-triangle',
    color_hex: category?.color_hex || '#FF6B2C',
    is_active: category?.is_active ?? true,
    sort_order: category?.sort_order ?? 0,
    urgency: category?.urgency || 'routine',
    default_ttl_minutes: category?.default_ttl_minutes ?? 180,
    stale_after_minutes: category?.stale_after_minutes ?? 60,
    resolve_flag_threshold: category?.resolve_flag_threshold ?? 3,
    notify_throttle_minutes: category?.notify_throttle_minutes ?? 15,
    notify_by_default: category?.notify_by_default ?? true,
    require_manual_review: category?.require_manual_review ?? false,
    safety_note: category?.safety_note || '',
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(isEditing ? categoryUpdateSchema : categorySchema) as any,
    defaultValues,
  });

  // Reset form when dialog opens/closes or category prop changes
  React.useEffect(() => {
    if (open) {
      reset({
        slug: category?.slug || '',
        name: category?.name || '',
        icon_key: category?.icon_key || 'alert-triangle',
        color_hex: category?.color_hex || '#FF6B2C',
        is_active: category?.is_active ?? true,
        sort_order: category?.sort_order ?? 0,
        urgency: category?.urgency || 'routine',
        default_ttl_minutes: category?.default_ttl_minutes ?? 180,
        stale_after_minutes: category?.stale_after_minutes ?? 60,
        resolve_flag_threshold: category?.resolve_flag_threshold ?? 3,
        notify_throttle_minutes: category?.notify_throttle_minutes ?? 15,
        notify_by_default: category?.notify_by_default ?? true,
        require_manual_review: category?.require_manual_review ?? false,
        safety_note: category?.safety_note || '',
      });
    }
  }, [open, category, reset]);

  const watchedValues = watch();

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (isEditing && category) {
        await updateMutation.mutateAsync({
          id: category.id,
          input: {
            name: data.name,
            icon_key: data.icon_key,
            color_hex: data.color_hex,
            is_active: data.is_active,
            sort_order: data.sort_order,
            urgency: data.urgency,
            default_ttl_minutes: data.default_ttl_minutes,
            stale_after_minutes: data.stale_after_minutes,
            resolve_flag_threshold: data.resolve_flag_threshold,
            notify_throttle_minutes: data.notify_throttle_minutes,
            notify_by_default: data.notify_by_default,
            require_manual_review: data.require_manual_review,
            safety_note: data.safety_note,
          },
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      onOpenChange(false);
      onSuccess?.();
    } catch {
      // Error handled by mutation/toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-surface border-border p-6 text-foreground">
        <DialogHeader className="pb-3 border-b border-border">
          <DialogTitle className="text-xl font-bold font-sans text-foreground">
            {isEditing ? `Edit Category: ${category?.name}` : 'Create New Category'}
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Configure classification taxonomy, map marker appearance, retention timers, and moderation rules.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
          {/* Live Preview Card */}
          <CategoryMarkerPreview
            name={watchedValues.name}
            slug={watchedValues.slug}
            color_hex={watchedValues.color_hex}
            icon_key={watchedValues.icon_key}
            urgency={watchedValues.urgency}
            default_ttl_minutes={watchedValues.default_ttl_minutes}
            stale_after_minutes={watchedValues.stale_after_minutes}
            require_manual_review={watchedValues.require_manual_review}
          />

          {/* Section: Basic Identity */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
              Identity & Visuals
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="category-name"
                  className="text-xs font-medium text-foreground block"
                >
                  Category Name <span className="text-status-danger">*</span>
                </label>
                <Input
                  id="category-name"
                  placeholder="e.g. Landslide"
                  {...register('name')}
                  aria-invalid={!!errors.name}
                />
                {errors.name && (
                  <p className="text-xs text-status-danger mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Slug */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="category-slug"
                    className="text-xs font-medium text-foreground block"
                  >
                    Slug identifier <span className="text-status-danger">*</span>
                  </label>
                  {isEditing && (
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">
                      (Immutable)
                    </span>
                  )}
                </div>
                <Input
                  id="category-slug"
                  placeholder="e.g. landslide"
                  disabled={isEditing}
                  className="font-mono text-xs"
                  {...register('slug')}
                  aria-invalid={!!errors.slug}
                />
                {errors.slug && (
                  <p className="text-xs text-status-danger mt-1">
                    {errors.slug.message}
                  </p>
                )}
              </div>
            </div>

            {/* Color Hex & Swatches */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground block">
                Category Color <span className="text-status-danger">*</span>
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {PALETTE_SWATCHES.map((swatch) => (
                  <button
                    key={swatch}
                    type="button"
                    onClick={() => setValue('color_hex', swatch, { shouldValidate: true })}
                    className="h-6 w-6 rounded-md border border-border/80 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    style={{
                      backgroundColor: swatch,
                      boxShadow:
                        watchedValues.color_hex?.toLowerCase() === swatch.toLowerCase()
                          ? '0 0 0 2px var(--color-background), 0 0 0 4px #FF6B2C'
                          : 'none',
                    }}
                    aria-label={`Select color ${swatch}`}
                  />
                ))}
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xs font-mono text-muted-foreground">HEX:</span>
                  <Input
                    {...register('color_hex')}
                    className="w-28 font-mono text-xs uppercase"
                    placeholder="#FF6B2C"
                    aria-invalid={!!errors.color_hex}
                  />
                </div>
              </div>
              {errors.color_hex && (
                <p className="text-xs text-status-danger mt-1">
                  {errors.color_hex.message}
                </p>
              )}
            </div>

            {/* Icon Key & Urgency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Icon Selector */}
              <div className="space-y-1.5">
                <label
                  htmlFor="category-icon"
                  className="text-xs font-medium text-foreground block"
                >
                  Marker Icon <span className="text-status-danger">*</span>
                </label>
                <select
                  id="category-icon"
                  className="w-full h-9 rounded-md border border-border bg-surface px-3 py-1 text-xs text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-accent"
                  {...register('icon_key')}
                >
                  {AVAILABLE_ICONS.map((iconName) => (
                    <option key={iconName} value={iconName}>
                      {iconName}
                    </option>
                  ))}
                </select>
                {errors.icon_key && (
                  <p className="text-xs text-status-danger mt-1">
                    {errors.icon_key.message}
                  </p>
                )}
              </div>

              {/* Urgency */}
              <div className="space-y-1.5">
                <label
                  htmlFor="category-urgency"
                  className="text-xs font-medium text-foreground block"
                >
                  Urgency Tier <span className="text-status-danger">*</span>
                </label>
                <select
                  id="category-urgency"
                  className="w-full h-9 rounded-md border border-border bg-surface px-3 py-1 text-xs text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-accent"
                  {...register('urgency')}
                >
                  <option value="routine">routine (Normal intake)</option>
                  <option value="high">high (Urgent alerts & highlighted pins)</option>
                </select>
                {errors.urgency && (
                  <p className="text-xs text-status-danger mt-1">
                    {errors.urgency.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section: Timers & Retention */}
          <div className="space-y-4 pt-2 border-t border-border/60">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
              Lifecycle & Retention Timers
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Default TTL */}
              <div className="space-y-1.5">
                <label
                  htmlFor="category-ttl"
                  className="text-xs font-medium text-foreground block"
                >
                  Default TTL (minutes) <span className="text-status-danger">*</span>
                </label>
                <Input
                  id="category-ttl"
                  type="number"
                  min="1"
                  className="font-mono text-xs"
                  placeholder="180"
                  {...register('default_ttl_minutes', { valueAsNumber: true })}
                  aria-invalid={!!errors.default_ttl_minutes}
                />
                <span className="text-[11px] text-muted-foreground">
                  Time until report automatically expires if not confirmed.
                </span>
                {errors.default_ttl_minutes && (
                  <p className="text-xs text-status-danger mt-1">
                    {errors.default_ttl_minutes.message}
                  </p>
                )}
              </div>

              {/* Stale After Minutes */}
              <div className="space-y-1.5">
                <label
                  htmlFor="category-stale"
                  className="text-xs font-medium text-foreground block"
                >
                  Stale After (minutes) <span className="text-status-danger">*</span>
                </label>
                <Input
                  id="category-stale"
                  type="number"
                  min="1"
                  className="font-mono text-xs"
                  placeholder="60"
                  {...register('stale_after_minutes', { valueAsNumber: true })}
                  aria-invalid={!!errors.stale_after_minutes}
                />
                <span className="text-[11px] text-muted-foreground">
                  Must be less than Default TTL ({watchedValues.default_ttl_minutes || 0}m).
                </span>
                {errors.stale_after_minutes && (
                  <p className="text-xs text-status-danger mt-1">
                    {errors.stale_after_minutes.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section: Moderation & Alerts */}
          <div className="space-y-4 pt-2 border-t border-border/60">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
              Moderation & Notification Controls
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Resolve Flag Threshold */}
              <div className="space-y-1.5">
                <label
                  htmlFor="category-resolve-flags"
                  className="text-xs font-medium text-foreground block"
                >
                  Resolve Flag Threshold <span className="text-status-danger">*</span>
                </label>
                <Input
                  id="category-resolve-flags"
                  type="number"
                  min="1"
                  className="font-mono text-xs"
                  placeholder="3"
                  {...register('resolve_flag_threshold', { valueAsNumber: true })}
                  aria-invalid={!!errors.resolve_flag_threshold}
                />
                <span className="text-[11px] text-muted-foreground">
                  Citizen resolved flags required to trigger auto-resolve review.
                </span>
                {errors.resolve_flag_threshold && (
                  <p className="text-xs text-status-danger mt-1">
                    {errors.resolve_flag_threshold.message}
                  </p>
                )}
              </div>

              {/* Notify Throttle Minutes */}
              <div className="space-y-1.5">
                <label
                  htmlFor="category-notify-throttle"
                  className="text-xs font-medium text-foreground block"
                >
                  Notify Throttle (minutes) <span className="text-status-danger">*</span>
                </label>
                <Input
                  id="category-notify-throttle"
                  type="number"
                  min="0"
                  className="font-mono text-xs"
                  placeholder="15"
                  {...register('notify_throttle_minutes', { valueAsNumber: true })}
                  aria-invalid={!!errors.notify_throttle_minutes}
                />
                <span className="text-[11px] text-muted-foreground">
                  Minimum interval between push alerts for the same zone.
                </span>
                {errors.notify_throttle_minutes && (
                  <p className="text-xs text-status-danger mt-1">
                    {errors.notify_throttle_minutes.message}
                  </p>
                )}
              </div>
            </div>

            {/* Checkbox Toggles */}
            <div className="space-y-3 pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <Checkbox
                  checked={watchedValues.notify_by_default}
                  onCheckedChange={(checked) =>
                    setValue('notify_by_default', !!checked, { shouldValidate: true })
                  }
                  className="mt-0.5"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-foreground">
                    Send push notification alerts by default
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    When published, nearby users receive proactive safety alerts.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <Checkbox
                  checked={watchedValues.require_manual_review}
                  onCheckedChange={(checked) =>
                    setValue('require_manual_review', !!checked, { shouldValidate: true })
                  }
                  className="mt-0.5"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-foreground">
                    Always require manual moderator review
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Reports in this category bypass auto-approval pipelines.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <Checkbox
                  checked={watchedValues.is_active}
                  onCheckedChange={(checked) =>
                    setValue('is_active', !!checked, { shouldValidate: true })
                  }
                  className="mt-0.5"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-foreground">
                    Category is Active
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Active categories appear in citizen capture and filter menus.
                  </span>
                </div>
              </label>
            </div>

            {/* Safety Note */}
            <div className="space-y-1.5 pt-2">
              <label
                htmlFor="category-safety-note"
                className="text-xs font-medium text-foreground block"
              >
                Safety Guidance Note (Optional)
              </label>
              <textarea
                id="category-safety-note"
                rows={2}
                maxLength={300}
                placeholder="e.g. Critical hazard. Do not approach active fires. Alert Margalla Fire Rescue."
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                {...register('safety_note')}
              />
              {errors.safety_note && (
                <p className="text-xs text-status-danger mt-1">
                  {errors.safety_note.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border flex items-center justify-between sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={isSubmitting}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {isSubmitting
                ? 'Saving...'
                : isEditing
                ? 'Save Changes'
                : 'Create Category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
