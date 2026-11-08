'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorBanner } from '@/components/ui/error-banner';
import { StatusBadge } from '@/components/status/status-badge';
import { CategoryChip } from '@/components/status/category-chip';
import { DataTable } from '@/components/data-table/data-table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

interface SampleRow {
  id: string;
  category: string;
  status: string;
  title: string;
}

const sampleColumns: ColumnDef<SampleRow, unknown>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.getValue('id')}
      </span>
    ),
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => <CategoryChip category={row.getValue('category') as string} />,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.getValue('status') as string} />,
  },
  {
    accessorKey: 'title',
    header: 'Incident',
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue('title') as string}</span>
    ),
  },
];

const sampleData: SampleRow[] = [
  {
    id: 'inc_101',
    category: 'accident',
    status: 'published',
    title: 'Two-car collision on Kashmir Hwy',
  },
  {
    id: 'inc_102',
    category: 'fire',
    status: 'under_review',
    title: 'Brush fire near Trail 4',
  },
  {
    id: 'inc_103',
    category: 'flooding',
    status: 'false_report',
    title: 'Ponding water at underpass',
  },
];

export default function GalleryPage() {
  const { theme, setTheme } = useTheme();

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground p-8 space-y-10 max-w-6xl mx-auto">
        <header className="flex items-center justify-between border-b border-border pb-6">
          <div>
            <h1 className="text-2xl font-bold font-sans">
              Inzar UI Component Gallery
            </h1>
            <p className="text-sm text-muted-foreground">
              Phase 0 Foundation Design System & Token Verification
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="gap-2"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span>Toggle Theme ({theme})</span>
          </Button>
        </header>

        {/* Buttons */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold border-b border-border pb-2">
            Buttons
          </h2>
          <div className="flex flex-wrap gap-3 items-center">
            <Button variant="default">Primary Bone</Button>
            <Button variant="accent">Signal Orange CTA</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="ghost">Ghost</Button>
            <Button disabled>Disabled</Button>
          </div>
        </section>

        {/* Form Controls */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold border-b border-border pb-2">
            Inputs & Select
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input placeholder="Search incidents, users..." />
            <Input disabled placeholder="Disabled input" />
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="under_review">Under review</SelectItem>
                <SelectItem value="rejected">Not approved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* Status Badges */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold border-b border-border pb-2">
            Status Badges (Icon + Text Always)
          </h2>
          <div className="flex flex-wrap gap-3 items-center">
            <StatusBadge status="ai_reviewed" />
            <StatusBadge status="under_review" />
            <StatusBadge status="published" />
            <StatusBadge status="not_approved" />
            <StatusBadge status="removed" />
            <StatusBadge status="false_report" />
            <StatusBadge status="active" />
            <StatusBadge status="resolved" />
            <StatusBadge status="expired" />
          </div>
        </section>

        {/* Category Chips */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold border-b border-border pb-2">
            Category Chips (Distinct Glyphs & Colors)
          </h2>
          <div className="flex flex-wrap gap-4 items-center">
            <CategoryChip category="accident" />
            <CategoryChip category="road_block" />
            <CategoryChip category="fire" />
            <CategoryChip category="flooding" />
            <CategoryChip category="gathering" />
            <CategoryChip category="other" />
          </div>
        </section>

        {/* Dialog & Drawer */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold border-b border-border pb-2">
            Modals & Drawers
          </h2>
          <div className="flex gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Open Confirmation Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Moderation Action</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to approve this incident report?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button variant="accent">Confirm Approve</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline">Open Side Drawer</Button>
              </DrawerTrigger>
              <DrawerContent side="right">
                <DrawerHeader>
                  <DrawerTitle>Incident Inspection Drawer</DrawerTitle>
                  <DrawerDescription>
                    Review photo, flags, and metadata.
                  </DrawerDescription>
                </DrawerHeader>
                <div className="py-4">
                  <p className="text-sm text-muted-foreground">
                    Drawer content rendered here with full details.
                  </p>
                </div>
                <DrawerFooter>
                  <Button variant="secondary">Close</Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost">Hover for Tooltip</Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Local time: 14:22 PKT (UTC: 09:22:00Z)</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </section>

        {/* Error Banner, Skeletons & Empty State */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold border-b border-border pb-2">
            Error Banner, Skeletons & Empty States
          </h2>
          <ErrorBanner
            error={{
              code: 'RATE_LIMIT_EXCEEDED',
              message: 'Too many requests. Please wait 30 seconds before retrying.',
            }}
            onRetry={() => alert('Retry triggered')}
          />
          <div className="flex gap-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-24" />
          </div>
          <EmptyState
            title="No flagged incidents"
            description="All user reports have been cleared from the moderation queue."
            action={<Button size="sm" variant="outline">Refresh queue</Button>}
          />
        </section>

        {/* Data Table */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold border-b border-border pb-2">
            DataTable Component
          </h2>
          <DataTable columns={sampleColumns} data={sampleData} />
        </section>
      </div>
    </TooltipProvider>
  );
}
