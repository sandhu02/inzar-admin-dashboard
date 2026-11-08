'use client';

import * as React from 'react';
import { Columns3 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import type { VisibilityState } from '@tanstack/react-table';
import { COLUMN_LABELS } from '../hooks/use-column-visibility';

interface ColumnVisibilityProps {
  visibility: VisibilityState;
  onVisibilityChange: (
    updater: VisibilityState | ((prev: VisibilityState) => VisibilityState)
  ) => void;
}

export function IncidentColumnVisibility({
  visibility,
  onVisibilityChange,
}: ColumnVisibilityProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 font-mono text-xs border-border bg-surface hover:bg-surface-elevated text-foreground"
        >
          <Columns3 className="h-3.5 w-3.5 mr-1.5 opacity-70" />
          <span>Columns</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <div className="px-2 py-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          Toggle Columns
        </div>
        {Object.entries(COLUMN_LABELS).map(([columnId, label]) => {
          const isVisible = visibility[columnId] !== false;
          return (
            <DropdownMenuCheckboxItem
              key={columnId}
              checked={isVisible}
              onCheckedChange={(checked) => {
                onVisibilityChange((prev) => ({
                  ...prev,
                  [columnId]: checked,
                }));
              }}
              className="text-xs font-sans cursor-pointer"
            >
              {label}
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
