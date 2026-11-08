'use client';

import * as React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { IncidentDetailView } from './incident-detail-view';

interface IncidentDrawerProps {
  incidentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IncidentDetailDrawer({
  incidentId,
  open,
  onOpenChange,
}: IncidentDrawerProps) {
  if (!incidentId) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        side="right"
        className="w-full sm:max-w-2xl h-full overflow-y-auto p-4 sm:p-6 bg-card border-l border-border"
      >
        <DrawerHeader className="sr-only">
          <DrawerTitle>Incident Details</DrawerTitle>
          <DrawerDescription>Inspect and moderate incident record {incidentId}</DrawerDescription>
        </DrawerHeader>

        <div className="mt-6">
          <IncidentDetailView
            incidentId={incidentId}
            onClose={() => onOpenChange(false)}
            fullPage={false}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
