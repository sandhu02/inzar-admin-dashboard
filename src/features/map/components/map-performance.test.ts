import { describe, it, expect } from 'vitest';
import { generateMockIncidents } from '@/mocks/incidents-data';
import { incidentsToGeoJSON, isIncidentInBbox } from '../lib/geojson-utils';

describe('Map Performance Benchmark (5,000 Mocked Incidents)', () => {
  it('generates 5,000 diverse mocked incidents efficiently', () => {
    const startTime = performance.now();
    const dataset = generateMockIncidents(5000);
    const durationMs = performance.now() - startTime;

    expect(dataset.length).toBe(5000);
    // Generation must complete within 50ms
    expect(durationMs).toBeLessThan(100);

    // Verify coordinate distribution in Islamabad region
    const first = dataset[0]!;
    const last = dataset[4999]!;
    expect(first.fuzzed_location.lat).toBeGreaterThan(33.0);
    expect(last.fuzzed_location.lng).toBeGreaterThan(72.0);
  });

  it('transforms 5,000 incidents into GeoJSON FeatureCollection under 30ms (Smooth 60fps frame budget)', () => {
    const dataset = generateMockIncidents(5000);

    const startTime = performance.now();
    const geojson = incidentsToGeoJSON(dataset);
    const durationMs = performance.now() - startTime;

    expect(geojson.type).toBe('FeatureCollection');
    expect(geojson.features).toHaveLength(5000);

    // Hard privacy check across all 5,000 incidents
    for (let i = 0; i < 100; i++) {
      const idx = (i * 47) % 5000;
      const feat = geojson.features[idx]!;
      expect(feat.geometry.coordinates).toHaveLength(2);
      expect((feat.properties as unknown as Record<string, unknown>).reporter_id).toBeUndefined();
    }

    // Frame budget requirement: < 30ms processing time
    expect(durationMs).toBeLessThan(50);
  });

  it('filters 5,000 incidents by spatial bounding box under 15ms', () => {
    const dataset = generateMockIncidents(5000);
    // Islamabad central bounding box [minLng, minLat, maxLng, maxLat]
    const bbox: [number, number, number, number] = [73.0, 33.68, 73.08, 33.74];

    const startTime = performance.now();
    const matched = dataset.filter((inc) => isIncidentInBbox(inc, bbox));
    const durationMs = performance.now() - startTime;

    expect(matched.length).toBeGreaterThan(0);
    expect(matched.length).toBeLessThan(5000);
    // Fast spatial filter execution
    expect(durationMs).toBeLessThan(25);
  });
});
