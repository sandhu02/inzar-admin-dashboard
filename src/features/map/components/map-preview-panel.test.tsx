import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';
import { MapPreviewPanel } from './map-preview-panel';
import { ToastProvider } from '@/components/ui/toast';
import type { Incident } from '@/features/incidents/types';

describe('MapPreviewPanel', () => {
  const sampleIncident: Incident = {
    id: 'inc_prev_01',
    title: 'Severe Structure Fire in F-7 Plaza',
    description: 'Black smoke billowing from second floor restaurant.',
    category: {
      id: 'cat_fire',
      slug: 'fire',
      name: 'Fire',
      color_hex: '#FF6B2C',
      icon_key: 'flame',
      is_active: true,
      sort_order: 1,
    },
    review_status: 'needs_review',
    lifecycle_status: 'active',
    flags_count: 1,
    place_label: 'F-7 Markaz · Jinnah Super',
    fuzzed_location: { lat: 33.7294, lng: 73.0551 },
    reported_at: new Date(Date.now() - 1800000).toISOString(),
    has_media: false,
    thumbnail_url: null,
  };

  it('renders incident preview details with title, category, status, and place label', () => {
    const handleClose = vi.fn();

    render(
      <ToastProvider>
        <MapPreviewPanel incident={sampleIncident} onClose={handleClose} />
      </ToastProvider>
    );

    expect(screen.getByText('Severe Structure Fire in F-7 Plaza')).toBeInTheDocument();
    expect(screen.getByText('F-7 Markaz · Jinnah Super')).toBeInTheDocument();
    expect(screen.getByText('Black smoke billowing from second floor restaurant.')).toBeInTheDocument();
    expect(screen.getByText('Incident inc_prev_01')).toBeInTheDocument();
    expect(screen.getByText('Full Details')).toBeInTheDocument();
  });

  it('HARD PRIVACY: strictly displays fuzzed coordinates with ~500M mask notice', () => {
    render(
      <ToastProvider>
        <MapPreviewPanel incident={sampleIncident} onClose={vi.fn()} />
      </ToastProvider>
    );

    expect(screen.getByText(/FUZZED ~500M/i)).toBeInTheDocument();
    expect(screen.getByText(/33.7294°, 73.0551°/i)).toBeInTheDocument();
    expect(screen.getByText(/Exact GPS masked/i)).toBeInTheDocument();
  });

  it('renders moderation action buttons and opens action dialog when clicking action', () => {
    render(
      <ToastProvider>
        <MapPreviewPanel incident={sampleIncident} onClose={vi.fn()} />
      </ToastProvider>
    );

    const approveBtn = screen.getByRole('button', { name: /Approve Incident/i });
    expect(approveBtn).toBeInTheDocument();

    fireEvent.click(approveBtn);

    // Confirmation dialog should open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Approve Incident')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked or Escape key is pressed', () => {
    const handleClose = vi.fn();

    render(
      <ToastProvider>
        <MapPreviewPanel incident={sampleIncident} onClose={handleClose} />
      </ToastProvider>
    );

    const closeBtn = screen.getByLabelText(/Close incident preview panel/i);
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});
