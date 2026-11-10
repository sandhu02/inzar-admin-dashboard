import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import {
  ProgressiveMediaProvider,
  useProgressiveMedia,
} from './progressive-media-context';
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

function TestConsumer({ incidentId }: { incidentId: string }) {
  const { canLoad, isLoaded, hasError, onImageLoaded, onImageError } = useProgressiveMedia();

  return (
    <div data-testid={`consumer-${incidentId}`}>
      <span data-testid={`canLoad-${incidentId}`}>{canLoad(incidentId) ? 'yes' : 'no'}</span>
      <span data-testid={`isLoaded-${incidentId}`}>{isLoaded(incidentId) ? 'yes' : 'no'}</span>
      <span data-testid={`hasError-${incidentId}`}>{hasError(incidentId) ? 'yes' : 'no'}</span>
      <button data-testid={`loadBtn-${incidentId}`} onClick={() => onImageLoaded(incidentId)}>
        Complete
      </button>
      <button data-testid={`errorBtn-${incidentId}`} onClick={() => onImageError(incidentId)}>
        Fail
      </button>
    </div>
  );
}

describe('ProgressiveMediaProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not allow media loading initially along with other data (instantaneous data, deferred media)', () => {
    const items = [
      createMockIncident('inc-1', 'https://example.com/1.jpg'),
      createMockIncident('inc-2', 'https://example.com/2.jpg'),
    ];

    render(
      <ProgressiveMediaProvider items={items}>
        <TestConsumer incidentId="inc-1" />
        <TestConsumer incidentId="inc-2" />
      </ProgressiveMediaProvider>
    );

    // Initial state: Neither item is allowed to load yet (deferred initially)
    expect(screen.getByTestId('canLoad-inc-1')).toHaveTextContent('no');
    expect(screen.getByTestId('canLoad-inc-2')).toHaveTextContent('no');
    expect(screen.getByTestId('isLoaded-inc-1')).toHaveTextContent('no');
    expect(screen.getByTestId('isLoaded-inc-2')).toHaveTextContent('no');
  });

  it('retrieves media one by one sequentially after initial deferral', () => {
    const items = [
      createMockIncident('inc-1', 'https://example.com/1.jpg'),
      createMockIncident('inc-2', 'https://example.com/2.jpg'),
    ];

    render(
      <ProgressiveMediaProvider items={items}>
        <TestConsumer incidentId="inc-1" />
        <TestConsumer incidentId="inc-2" />
      </ProgressiveMediaProvider>
    );

    // Fast-forward initial deferral
    act(() => {
      vi.advanceTimersByTime(20);
    });

    // First item is now allowed to load, but second is NOT yet allowed (one by one!)
    expect(screen.getByTestId('canLoad-inc-1')).toHaveTextContent('yes');
    expect(screen.getByTestId('canLoad-inc-2')).toHaveTextContent('no');

    // Complete the first image
    act(() => {
      screen.getByTestId('loadBtn-inc-1').click();
    });

    // First image is marked loaded
    expect(screen.getByTestId('isLoaded-inc-1')).toHaveTextContent('yes');

    // Advance pacing delay
    act(() => {
      vi.advanceTimersByTime(10);
    });

    // Now the second image is allowed to load!
    expect(screen.getByTestId('canLoad-inc-2')).toHaveTextContent('yes');

    // Complete the second image
    act(() => {
      screen.getByTestId('loadBtn-inc-2').click();
    });

    expect(screen.getByTestId('isLoaded-inc-2')).toHaveTextContent('yes');
  });

  it('resets queue when refreshKey changes', () => {
    const items = [
      createMockIncident('inc-1', 'https://example.com/1.jpg'),
    ];

    const { rerender } = render(
      <ProgressiveMediaProvider items={items} refreshKey={1}>
        <TestConsumer incidentId="inc-1" />
      </ProgressiveMediaProvider>
    );

    // Complete inc-1
    act(() => {
      vi.advanceTimersByTime(20);
    });
    act(() => {
      screen.getByTestId('loadBtn-inc-1').click();
    });
    expect(screen.getByTestId('isLoaded-inc-1')).toHaveTextContent('yes');

    // Simulate refresh button click (refreshKey changes)
    rerender(
      <ProgressiveMediaProvider items={items} refreshKey={2}>
        <TestConsumer incidentId="inc-1" />
      </ProgressiveMediaProvider>
    );

    // Should reset to not loaded initially
    expect(screen.getByTestId('isLoaded-inc-1')).toHaveTextContent('no');
  });
});
