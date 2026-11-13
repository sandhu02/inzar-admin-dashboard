import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';
import { MapAccessibleList } from './map-accessible-list';
import type { Incident } from '@/features/incidents/types';

describe('MapAccessibleList', () => {
  const sampleIncidents: Incident[] = [
    {
      id: 'inc_acc_01',
      title: 'Traffic Collision at Blue Area',
      description: 'Multiple vehicle collision.',
      category: {
        id: 'cat_accident',
        slug: 'accident',
        name: 'Accident',
        color_hex: '#FFC14D',
        icon_key: 'alert-triangle',
        is_active: true,
        sort_order: 1,
      },
      review_status: 'needs_review',
      lifecycle_status: 'active',
      flags_count: 2,
      place_label: 'Blue Area · Jinnah Ave',
      fuzzed_location: { lat: 33.71, lng: 73.058 },
      reported_at: new Date(Date.now() - 3600000).toISOString(),
      has_media: true,
      thumbnail_url: null,
    },
    {
      id: 'inc_acc_02',
      title: 'Road Block on Kashmir Hwy',
      description: 'Police diversion in place.',
      category: {
        id: 'cat_road_block',
        slug: 'road_block',
        name: 'Road Block',
        color_hex: '#E2DDD5',
        icon_key: 'shield-alert',
        is_active: true,
        sort_order: 2,
      },
      review_status: 'published',
      lifecycle_status: 'active',
      flags_count: 0,
      place_label: 'Kashmir Hwy · I-8',
      fuzzed_location: { lat: 33.68, lng: 73.04 },
      reported_at: new Date(Date.now() - 7200000).toISOString(),
      has_media: false,
      thumbnail_url: null,
    },
  ];

  it('renders visible incidents count and list items with status badges and category chips', () => {
    const handleSelect = vi.fn();
    const handleClose = vi.fn();

    render(
      <MapAccessibleList
        incidents={sampleIncidents}
        selectedIncidentId={null}
        onSelectIncident={handleSelect}
        onClose={handleClose}
      />
    );

    expect(screen.getByText(/Visible Incidents \(2\)/i)).toBeInTheDocument();
    expect(screen.getByText('Traffic Collision at Blue Area')).toBeInTheDocument();
    expect(screen.getByText('Road Block on Kashmir Hwy')).toBeInTheDocument();
    expect(screen.getByText(/2 community flags/i)).toBeInTheDocument();
  });

  it('calls onSelectIncident when clicking an incident item', () => {
    const handleSelect = vi.fn();
    const handleClose = vi.fn();

    render(
      <MapAccessibleList
        incidents={sampleIncidents}
        selectedIncidentId={null}
        onSelectIncident={handleSelect}
        onClose={handleClose}
      />
    );

    const firstItem = screen.getByTestId('incident-list-item-inc_acc_01');
    fireEvent.click(firstItem);

    expect(handleSelect).toHaveBeenCalledWith('inc_acc_01');
  });

  it('calls onClose when clicking close button', () => {
    const handleSelect = vi.fn();
    const handleClose = vi.fn();

    render(
      <MapAccessibleList
        incidents={sampleIncidents}
        selectedIncidentId={null}
        onSelectIncident={handleSelect}
        onClose={handleClose}
      />
    );

    const closeBtn = screen.getByLabelText(/Close visible incidents list/i);
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders accessible empty state when incidents list is empty', () => {
    render(
      <MapAccessibleList
        incidents={[]}
        selectedIncidentId={null}
        onSelectIncident={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('No incidents in visible area')).toBeInTheDocument();
  });
});
