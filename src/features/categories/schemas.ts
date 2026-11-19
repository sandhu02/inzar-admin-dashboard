import { z } from 'zod';

export const hexColorRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
export const slugRegex = /^[a-z0-9_-]+$/;

export const categorySchema = z
  .object({
    slug: z
      .string()
      .min(2, 'Slug must be at least 2 characters')
      .max(50, 'Slug must not exceed 50 characters')
      .regex(
        slugRegex,
        'Slug can only contain lowercase letters, numbers, hyphens, and underscores'
      ),
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(60, 'Name must not exceed 60 characters'),
    icon_key: z.string().min(1, 'Icon key is required'),
    color_hex: z
      .string()
      .regex(hexColorRegex, 'Must be a valid hex color code (e.g. #FF6B2C)'),
    is_active: z.boolean().default(true),
    sort_order: z.number().int().min(0).default(0),
    urgency: z.enum(['routine', 'high']),
    default_ttl_minutes: z
      .number()
      .int('Default TTL must be an integer')
      .positive('Default TTL must be a positive number'),
    stale_after_minutes: z
      .number()
      .int('Stale after minutes must be an integer')
      .positive('Stale after minutes must be a positive number'),
    resolve_flag_threshold: z
      .number()
      .int('Resolve flag threshold must be an integer')
      .positive('Resolve flag threshold must be a positive number'),
    notify_throttle_minutes: z
      .number()
      .int('Notify throttle must be an integer')
      .min(0, 'Notify throttle must be 0 or greater'),
    notify_by_default: z.boolean().default(true),
    require_manual_review: z.boolean().default(false),
    safety_note: z
      .string()
      .max(300, 'Safety note cannot exceed 300 characters')
      .optional()
      .or(z.literal('')),
  })
  .refine((data) => data.stale_after_minutes < data.default_ttl_minutes, {
    message: 'Stale after minutes must be less than default TTL',
    path: ['stale_after_minutes'],
  });

export type CategoryFormData = z.infer<typeof categorySchema>;

export const categoryUpdateSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(60, 'Name must not exceed 60 characters'),
    icon_key: z.string().min(1, 'Icon key is required'),
    color_hex: z
      .string()
      .regex(hexColorRegex, 'Must be a valid hex color code (e.g. #FF6B2C)'),
    is_active: z.boolean().default(true),
    sort_order: z.number().int().min(0).default(0),
    urgency: z.enum(['routine', 'high']),
    default_ttl_minutes: z
      .number()
      .int('Default TTL must be an integer')
      .positive('Default TTL must be a positive number'),
    stale_after_minutes: z
      .number()
      .int('Stale after minutes must be an integer')
      .positive('Stale after minutes must be a positive number'),
    resolve_flag_threshold: z
      .number()
      .int('Resolve flag threshold must be an integer')
      .positive('Resolve flag threshold must be a positive number'),
    notify_throttle_minutes: z
      .number()
      .int('Notify throttle must be an integer')
      .min(0, 'Notify throttle must be 0 or greater'),
    notify_by_default: z.boolean().default(true),
    require_manual_review: z.boolean().default(false),
    safety_note: z
      .string()
      .max(300, 'Safety note cannot exceed 300 characters')
      .optional()
      .or(z.literal('')),
  })
  .refine((data) => data.stale_after_minutes < data.default_ttl_minutes, {
    message: 'Stale after minutes must be less than default TTL',
    path: ['stale_after_minutes'],
  });

export type CategoryUpdateFormData = z.infer<typeof categoryUpdateSchema>;
