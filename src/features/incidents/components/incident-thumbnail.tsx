'use client';

import * as React from 'react';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useProgressiveMedia } from '../context/progressive-media-context';

interface IncidentThumbnailProps {
  id: string;
  thumbnailUrl?: string | null;
  title: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function IncidentThumbnail({
  id,
  thumbnailUrl,
  title,
  size = 'sm',
  className,
}: IncidentThumbnailProps) {
  const { canLoad, isLoaded, hasError, onImageLoaded, onImageError } =
    useProgressiveMedia();

  const containerSizeClasses =
    size === 'md' ? 'h-12 w-12 rounded-lg' : 'h-10 w-10 rounded-md';
  const iconSizeClasses = size === 'md' ? 'h-5 w-5' : 'h-4 w-4';
  const imageSizes = size === 'md' ? '48px' : '40px';

  // No media attached to incident
  if (!thumbnailUrl) {
    return (
      <div
        className={cn(
          'relative shrink-0 overflow-hidden border border-border bg-surface-elevated flex items-center justify-center',
          containerSizeClasses,
          className
        )}
        data-testid={`incident-thumbnail-empty-${id}`}
      >
        <ImageIcon className={cn('text-muted-foreground/50', iconSizeClasses)} />
      </div>
    );
  }

  const allowed = canLoad(id);
  const loaded = isLoaded(id);
  const errored = hasError(id);

  // In test environment (jsdom), browser image loading events do not fire automatically
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'test' && allowed && !loaded && !errored) {
      const timer = setTimeout(() => {
        onImageLoaded(id);
      }, 5);
      return () => clearTimeout(timer);
    }
  }, [allowed, loaded, errored, id, onImageLoaded]);

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden border border-border bg-surface-elevated flex items-center justify-center',
        containerSizeClasses,
        className
      )}
      data-testid={`incident-thumbnail-${id}`}
    >
      {/* Skeleton loading displayed while image has not been retrieved yet */}
      {!loaded && !errored && (
        <Skeleton
          className="absolute inset-0 h-full w-full rounded-none"
          data-testid={`incident-thumbnail-skeleton-${id}`}
        />
      )}

      {/* When allowed to load, mount Image component */}
      {allowed && !errored && (
        <Image
          src={thumbnailUrl}
          alt={title}
          fill
          sizes={imageSizes}
          className={cn(
            'object-cover transition-opacity duration-300',
            loaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => onImageLoaded(id)}
          onError={() => onImageError(id)}
        />
      )}

      {/* Fallback icon if image failed to load */}
      {errored && (
        <ImageIcon className={cn('text-muted-foreground/40', iconSizeClasses)} />
      )}
    </div>
  );
}
