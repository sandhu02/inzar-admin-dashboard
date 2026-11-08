import * as React from 'react';
import {
  Flame,
  AlertTriangle,
  ShieldAlert,
  Droplets,
  Users,
  HelpCircle,
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CategoryInfo {
  id?: string;
  slug: string;
  name: string;
  color_hex?: string;
  icon_key?: string;
}

interface CategoryGlyphConfig {
  glyph: string; // unicode / shape representation
  icon: LucideIcon;
  defaultColor: string;
  shapeClass: string;
}

const CATEGORY_MAP: Record<string, CategoryGlyphConfig> = {
  accident: {
    glyph: '▲',
    icon: AlertTriangle,
    defaultColor: '#FFC14D',
    shapeClass: 'text-[10px]',
  },
  road_block: {
    glyph: '■',
    icon: ShieldAlert,
    defaultColor: '#E2DDD5',
    shapeClass: 'text-[9px]',
  },
  fire: {
    glyph: '●',
    icon: Flame,
    defaultColor: '#FF6B2C',
    shapeClass: 'text-[10px]',
  },
  flooding: {
    glyph: '◆',
    icon: Droplets,
    defaultColor: '#7CC4FF',
    shapeClass: 'text-[11px]',
  },
  gathering: {
    glyph: '⬬',
    icon: Users,
    defaultColor: '#A8A094',
    shapeClass: 'text-[10px]',
  },
  other: {
    glyph: '●',
    icon: HelpCircle,
    defaultColor: '#706B63',
    shapeClass: 'text-[9px]',
  },
};

interface CategoryChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  category: CategoryInfo | string;
  variant?: 'glyph' | 'icon' | 'dot' | 'minimal';
  showLabel?: boolean;
}

export function CategoryChip({
  category,
  variant = 'glyph',
  showLabel = true,
  className,
  ...props
}: CategoryChipProps) {
  const slug =
    typeof category === 'string'
      ? category.toLowerCase().replace(/[\s-]/g, '_')
      : category.slug.toLowerCase().replace(/[\s-]/g, '_');

  const name =
    typeof category === 'string'
      ? category.replace(/_/g, ' ')
      : category.name;

  const config = CATEGORY_MAP[slug] || {
    glyph: '●',
    icon: HelpCircle,
    defaultColor: '#A8A094',
    shapeClass: 'text-[9px]',
  };

  const color =
    typeof category !== 'string' && category.color_hex
      ? category.color_hex
      : config.defaultColor;

  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider font-semibold text-foreground select-none',
        className
      )}
      data-category={slug}
      {...props}
    >
      {variant === 'icon' ? (
        <span
          className="flex h-4 w-4 items-center justify-center rounded-sm shrink-0"
          style={{ color }}
          aria-hidden="true"
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
      ) : variant === 'dot' ? (
        <span
          className="h-2 w-2 rounded-full shrink-0"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
      ) : (
        <span
          className={cn('shrink-0 leading-none', config.shapeClass)}
          style={{ color }}
          aria-hidden="true"
        >
          {config.glyph}
        </span>
      )}

      {showLabel && <span className="truncate">{name}</span>}
    </span>
  );
}
