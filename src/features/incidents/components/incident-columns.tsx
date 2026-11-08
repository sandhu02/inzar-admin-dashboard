'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';
import {
  MoreHorizontal,
  ImageIcon,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { StatusBadge } from '@/components/status/status-badge';
import { CategoryChip } from '@/components/status/category-chip';
import {
  formatReportedTime,
  formatAge,
  formatUtcTooltip,
} from '@/lib/format/date';
import { cn } from '@/lib/utils';
import type { Incident } from '../types';

interface GetColumnsOptions {
  sort?: string;
  onSortChange?: (sortKey: string) => void;
  onRowAction?: (action: string, incident: Incident) => void;
}

export function getIncidentColumns({
  sort = 'reported_at:desc',
  onSortChange,
  onRowAction,
}: GetColumnsOptions = {}): ColumnDef<Incident>[] {
  const [currentSortKey, currentSortDir] = sort.split(':');

  const renderSortableHeader = (
    label: string,
    fieldKey: string,
    alignRight = false
  ) => {
    const isSorted = currentSortKey === fieldKey;
    const isAsc = isSorted && currentSortDir === 'asc';

    return (
      <button
        type="button"
        onClick={() => {
          if (!onSortChange) return;
          if (isSorted) {
            onSortChange(`${fieldKey}:${isAsc ? 'desc' : 'asc'}`);
          } else {
            onSortChange(`${fieldKey}:desc`);
          }
        }}
        className={cn(
          'flex items-center gap-1.5 hover:text-foreground font-mono text-xs uppercase transition-colors select-none py-1',
          alignRight && 'ml-auto'
        )}
      >
        <span>{label}</span>
        {isSorted ? (
          isAsc ? (
            <ArrowUp className="h-3 w-3 text-accent" />
          ) : (
            <ArrowDown className="h-3 w-3 text-accent" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-40 hover:opacity-100" />
        )}
      </button>
    );
  };

  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all rows"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={`Select incident ${row.original.id}`}
          className="translate-y-[2px]"
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'category',
      accessorKey: 'category',
      header: 'CATEGORY',
      cell: ({ row }) => <CategoryChip category={row.original.category} />,
    },
    {
      id: 'incident',
      accessorKey: 'title',
      header: 'INCIDENT',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-3 min-w-[220px] max-w-[340px]">
            {/* Thumbnail */}
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-border bg-surface-elevated flex items-center justify-center">
              {item.thumbnail_url ? (
                <Image
                  src={item.thumbnail_url}
                  alt={item.title}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              ) : (
                <ImageIcon className="h-4 w-4 text-muted-foreground/50" />
              )}
            </div>
            {/* Title & description */}
            <div className="truncate">
              <span className="font-sans font-medium text-foreground block truncate">
                {item.title}
              </span>
              {item.description && (
                <span className="font-sans text-xs text-muted-foreground block truncate">
                  {item.description}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      id: 'review_status',
      accessorKey: 'review_status',
      header: () => renderSortableHeader('REVIEW', 'status'),
      cell: ({ row }) => <StatusBadge status={row.original.review_status} />,
    },
    {
      id: 'lifecycle_status',
      accessorKey: 'lifecycle_status',
      header: 'LIFECYCLE',
      cell: ({ row }) => (
        <span className="font-mono text-xs capitalize text-muted-foreground">
          {row.original.lifecycle_status}
        </span>
      ),
    },
    {
      id: 'flags_count',
      accessorKey: 'flags_count',
      header: () => renderSortableHeader('FLAGS', 'flags_count'),
      cell: ({ row }) => {
        const count = row.original.flags_count || 0;
        return (
          <span
            className={cn(
              'font-mono text-xs font-semibold px-2 py-0.5 rounded',
              count > 0
                ? 'bg-status-warning/15 text-status-warning'
                : 'text-muted-foreground'
            )}
          >
            {count}
          </span>
        );
      },
    },
    {
      id: 'place_label',
      accessorKey: 'place_label',
      header: 'PLACE',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-foreground/90 whitespace-nowrap">
          {row.original.place_label || '-'}
        </span>
      ),
    },
    {
      id: 'reported_at',
      accessorKey: 'reported_at',
      header: () => renderSortableHeader('REPORTED', 'reported_at'),
      cell: ({ row }) => {
        const reportedIso = row.original.reported_at;
        const timeFormatted = formatReportedTime(reportedIso);
        const utcTooltip = formatUtcTooltip(reportedIso);

        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="font-mono text-xs text-muted-foreground whitespace-nowrap cursor-help">
                  {timeFormatted}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">
                <span className="font-mono text-xs">{utcTooltip}</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      id: 'age',
      header: 'AGE',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">
          {formatAge(row.original.reported_at)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const incident = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                aria-label={`Actions for incident ${incident.id}`}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => onRowAction?.('view', incident)}
                className="cursor-pointer font-sans"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  if (typeof navigator !== 'undefined') {
                    navigator.clipboard.writeText(incident.id);
                  }
                }}
                className="cursor-pointer font-sans"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onRowAction?.('approve', incident)}
                className="cursor-pointer font-sans text-status-success"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onRowAction?.('reject', incident)}
                className="cursor-pointer font-sans text-status-danger"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onRowAction?.('mark_false', incident)}
                className="cursor-pointer font-sans text-status-warning"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Mark as False
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
