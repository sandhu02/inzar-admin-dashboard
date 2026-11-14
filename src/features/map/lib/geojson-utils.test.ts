import { describe, it, expect } from 'vitest';
import { queryMockIncidents } from '@/mocks/incidents-data';
import { incidentsToGeoJSON, isIncidentInBbox } from './geojson-utils';
import type { Incident } from '@/features/incidents/types';

describe('geojson-utils', () => {
  const sampleIncidents: Incident[] = [
    {
      id: 'inc_test_01',
      title: 'Commercial Fire on 7th Ave',
      description: 'Active structure fire in retail plaza.',
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
      flags_count: 3,
      place_label: 'F-7 · 7th Ave',
      fuzzed_location: { lat: 33.7294, lng: 73.0551 },
      reported_at: '2026-11-13T10:00:00Z',
      has_media: true,
      thumbnail_url: 'https://images.unsplash.com/test.jpg',
    },
    {
      id: 'inc_test_02',
      title: 'Road Blockage at Kashmir Hwy',
      description: 'Fallen tree blocking two lanes.',
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
      place_label: 'G-9 · Kashmir Hwy',
      fuzzed_location: { lat: 33.695, lng: 73.032 },
      reported_at: '2026-11-13T09:30:00Z',
      has_media: false,
      thumbnail_url: null,
    },
  ];

  it('converts an array of incidents into a valid GeoJSON FeatureCollection', () => {
    const geojson = incidentsToGeoJSON(sampleIncidents);

    expect(geojson.type).toBe('FeatureCollection');
    expect(geojson.features).toHaveLength(2);

    const f1 = geojson.features[0]!;
    expect(f1.type).toBe('Feature');
    expect(f1.geometry.type).toBe('Point');
    // GeoJSON order must be [longitude, latitude]
    expect(f1.geometry.coordinates).toEqual([73.0551, 33.7294]);
    expect(f1.properties.id).toBe('inc_test_01');
    expect(f1.properties.title).toBe('Commercial Fire on 7th Ave');
    expect(f1.properties.category_slug).toBe('fire');
    expect(f1.properties.category_color).toBe('#FF6B2C');
    expect(f1.properties.review_status).toBe('needs_review');
    expect(f1.properties.flags_count).toBe(3);
  });

  it('HARD PRIVACY CONSTRAINT: strictly places fuzzed_location into GeoJSON coordinates', () => {
    const geojson = incidentsToGeoJSON(sampleIncidents);

    sampleIncidents.forEach((inc, idx) => {
      const feature = geojson.features[idx]!;
      // Must match fuzzed coordinates exactly
      expect(feature.geometry.coordinates[0]).toBe(inc.fuzzed_location!.lng);
      expect(feature.geometry.coordinates[1]).toBe(inc.fuzzed_location!.lat);
      // Reporter identity must never be present in public properties
      expect((feature.properties as unknown as Record<string, unknown>).reporter_id).toBeUndefined();
      expect((feature.properties as unknown as Record<string, unknown>).reporter_email).toBeUndefined();
    });
  });

  it('correctly determines whether an incident is inside a bounding box', () => {
    const inc = sampleIncidents[0]!; // lat: 33.7294, lng: 73.0551
    // minLng, minLat, maxLng, maxLat
    const enclosingBbox: [number, number, number, number] = [73.0, 33.7, 73.1, 33.8];
    const outsideBbox: [number, number, number, number] = [72.0, 32.0, 72.5, 32.5];

    expect(isIncidentInBbox(inc, enclosingBbox)).toBe(true);
    expect(isIncidentInBbox(inc, outsideBbox)).toBe(false);
  });

  it('queryMockIncidents with bbox returns matching items', () => {
    const params = new URLSearchParams({
      bbox: '72.95,33.65,73.15,33.78',
    });
    const res = queryMockIncidents(params);
    expect(res.total_count).toBeGreaterThan(0);
  });

  it('checks MapLibre LngLatBounds methods', async () => {
    const maplibregl = await import('maplibre-gl');
    const bounds = new maplibregl.LngLatBounds([73.0, 33.6], [73.2, 33.8]);
    const sw = bounds.getSouthWest();
    expect(typeof sw.wrap).toBe('function');
    const wrapped = sw.wrap();
    expect(wrapped.lng).toBeCloseTo(73.0);
  });
});
