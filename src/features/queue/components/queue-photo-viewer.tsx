'use client';

import * as React from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ZoomIn, ImageIcon } from 'lucide-react';

interface QueuePhotoViewerProps {
  thumbnailUrl: string | null;
  mediaUrls?: string[];
  title: string;
}

export function QueuePhotoViewer({ thumbnailUrl, mediaUrls, title }: QueuePhotoViewerProps) {
  const [zoomOpen, setZoomOpen] = React.useState(false);
  const primaryUrl = thumbnailUrl || (mediaUrls && mediaUrls[0]) || null;

  if (!primaryUrl) {
    return (
      <div
        className="w-full h-64 sm:h-80 md:h-96 rounded-xl border border-border bg-surface-elevated/40 flex flex-col items-center justify-center text-muted-foreground/50 p-6"
        data-testid="queue-photo-empty"
      >
        <ImageIcon className="h-12 w-12 mb-2 stroke-[1.2]" />
        <span className="text-xs font-mono">NO MEDIA ATTACHED</span>
      </div>
    );
  }

  return (
    <>
      <div
        className="relative group w-full h-72 sm:h-96 md:h-[420px] rounded-xl overflow-hidden border border-border bg-surface-elevated shadow-xs"
        data-testid="queue-photo-container"
      >
        <Image
          src={primaryUrl}
          alt={title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 720px"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.01]"
        />

        {/* Hover / tap zoom button */}
        <button
          type="button"
          onClick={() => setZoomOpen(true)}
          className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface/85 backdrop-blur-md border border-border text-xs font-medium text-foreground opacity-90 hover:opacity-100 transition-opacity shadow-sm"
          aria-label="Zoom photo"
          data-testid="queue-photo-zoom-btn"
        >
          <ZoomIn className="h-3.5 w-3.5 text-accent" />
          <span>Zoom</span>
        </button>
      </div>

      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogContent
          className="max-w-4xl bg-surface border-border p-2 sm:p-4"
          data-testid="queue-photo-zoom-dialog"
        >
          <DialogTitle className="sr-only">Zoomed Photo: {title}</DialogTitle>
          <DialogDescription className="sr-only">High resolution view</DialogDescription>
          <div className="relative w-full h-[70vh] rounded-lg overflow-hidden bg-black/50">
            <Image
              src={primaryUrl}
              alt={title}
              fill
              sizes="90vw"
              className="object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
