import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { IncidentThumbnail } from './incident-thumbnail';
import { ProgressiveMediaProvider } from '../context/progressive-media-context';
import type { Incident } from '../types';

function createMockIncident(id: string, thumbnailUrl: string | null = 'https://example.com/photo.jpg'): Incident {
  return {
    id,
    title: `Incident ${id}`,
    description: 'Test incident description',
    category: { id: 'fires', name: 'Fires', slug: 'fires', color_hex: '#e25822', icon_key: 'flame', is_active: true, sort_order: 1 },
    review_status: 'needs_review',
    lifecycle_status: 'active',
    flags_count: 0,
    place_label: 'Main Street',
    reported_at: new Date().toISOString(),
    fuzzed_location: { lat: 34.0, lng: -118.0 },
    has_media: Boolean(thumbnailUrl),
    thumbnail_url: thumbnailUrl,
  };
}

describe('IncidentThumbnail', () => {
  it('renders fallback icon directly when thumbnailUrl is null/empty', () => {
    render(
      <IncidentThumbnail
        id="inc-no-media"
        thumbnailUrl={null}
        title="Incident without media"
      />
    );

    expect(screen.getByTestId('incident-thumbnail-empty-inc-no-media')).toBeInTheDocument();
    expect(screen.queryByTestId('incident-thumbnail-skeleton-inc-no-media')).not.toBeInTheDocument();
  });

  it('renders skeleton initially while media is queued or loading', () => {
    const items = [
      createMockIncident('inc-1', 'https://example.com/img1.jpg'),
      createMockIncident('inc-2', 'https://example.com/img2.jpg'),
    ];

    render(
      <ProgressiveMediaProvider items={items}>
        <IncidentThumbnail
          id="inc-2"
          thumbnailUrl="https://example.com/img2.jpg"
          title="Incident 2"
        />
      </ProgressiveMediaProvider>
    );

    // inc-2 is second in queue, so it immediately starts in skeleton state
    expect(screen.getByTestId('incident-thumbnail-skeleton-inc-2')).toBeInTheDocument();
  });
});
