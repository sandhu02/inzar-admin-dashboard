'use client';

import * as React from 'react';
import Image from 'next/image';
import { ZoomIn, ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface PhotoViewerProps {
  mediaUrls?: string[];
  thumbnailUrl?: string | null;
  title: string;
}

export function IncidentPhotoViewer({
  mediaUrls = [],
  thumbnailUrl,
  title,
}: PhotoViewerProps) {
  const allPhotos = React.useMemo(() => {
    const list = [...mediaUrls];
    if (thumbnailUrl && !list.includes(thumbnailUrl)) {
      list.unshift(thumbnailUrl);
    }
    return list.filter(Boolean);
  }, [mediaUrls, thumbnailUrl]);

  const [activeIndex, setActiveIndex] = React.useState(0);
  const [zoomOpen, setZoomOpen] = React.useState(false);
  const [imgError, setImgError] = React.useState<Record<string, boolean>>({});

  const currentPhoto = allPhotos[activeIndex];
  const hasError = currentPhoto ? imgError[currentPhoto] : false;

  if (allPhotos.length === 0 || hasError) {
    return (
      <div className="w-full h-56 sm:h-72 rounded-xl border border-dashed border-border bg-surface-elevated/40 flex flex-col items-center justify-center p-6 text-center">
        <div className="h-12 w-12 rounded-full bg-surface-elevated flex items-center justify-center mb-2 border border-border">
          <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
        </div>
        <p className="text-sm font-sans font-medium text-muted-foreground">
          No photo attached
        </p>
        <p className="text-xs text-muted-foreground/60 mt-0.5">
          Citizen reported without visual evidence
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main Image Display */}
      <div
        className="group relative w-full h-64 sm:h-80 rounded-xl overflow-hidden border border-border bg-black/40 cursor-zoom-in"
        onClick={() => setZoomOpen(true)}
      >
        <Image
          src={currentPhoto!}
          alt={`${title} - Photo ${activeIndex + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 640px"
          priority
          className="object-contain transition-transform duration-300 group-hover:scale-[1.02]"
          onError={() => {
            if (currentPhoto) {
              setImgError((prev) => ({ ...prev, [currentPhoto]: true }));
            }
          }}
        />

        {/* Zoom overlay badge */}
        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md text-white text-xs font-mono flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity border border-white/10 pointer-events-none">
          <ZoomIn className="h-3.5 w-3.5" />
          <span>Click to zoom</span>
        </div>

        {allPhotos.length > 1 && (
          <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white text-[11px] font-mono border border-white/10">
            {activeIndex + 1} / {allPhotos.length}
          </div>
        )}
      </div>

      {/* Multiple Photos Carousel Bar */}
      {allPhotos.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {allPhotos.map((url, idx) => (
            <button
              key={url}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`relative h-16 w-16 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                activeIndex === idx
                  ? 'border-accent ring-2 ring-accent/30'
                  : 'border-border opacity-70 hover:opacity-100'
              }`}
            >
              <Image
                src={url}
                alt={`Thumbnail ${idx + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Full Screen Lightbox Zoom Modal */}
      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-2 bg-black/95 border-border/40 text-white">
          <DialogTitle className="sr-only">Incident Photo Zoom - {title}</DialogTitle>
          <div className="relative w-full h-[75vh] flex items-center justify-center">
            {currentPhoto && (
              <Image
                src={currentPhoto}
                alt={title}
                fill
                sizes="100vw"
                className="object-contain"
              />
            )}

            {allPhotos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex((prev) => (prev > 0 ? prev - 1 : allPhotos.length - 1));
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-black text-white transition-colors border border-white/20"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex((prev) => (prev < allPhotos.length - 1 ? prev + 1 : 0));
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-black text-white transition-colors border border-white/20"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setZoomOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/70 hover:bg-black text-white transition-colors border border-white/20"
              aria-label="Close photo zoom"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
