import { describe, it, expect } from 'vitest';
import {
  fetchIncidents,
  fetchIncidentDetail,
  revealReporter,
  revealExactLocation,
  performIncidentAction,
} from './incidents';

describe('fetchIncidents API integration with MSW', () => {
  it('fetches default paginated list of incidents without private fields', async () => {
    const res = await fetchIncidents({ limit: 25 });

    expect(res.items).toBeDefined();
    expect(res.items.length).toBe(25);
    expect(res.total_count).toBeGreaterThan(400);
    expect(res.next_cursor).toBe('25');

    // With removed=true, includes soft-deleted items reaching the full dataset of 520
    const allRes = await fetchIncidents({ removed: true, limit: 10 });
    expect(allRes.total_count).toBe(520);

    // Privacy verification: reporter_id must be stripped
    res.items.forEach((item) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((item as any).reporter_id).toBeUndefined();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((item as any).exact_location).toBeUndefined();
    });
  });

  it('filters incidents by review_status', async () => {
    const res = await fetchIncidents({
      review_status: ['under_review'],
      limit: 50,
    });

    expect(res.items.length).toBeGreaterThan(0);
    res.items.forEach((item) => {
      expect(item.review_status).toBe('under_review');
    });
  });

  it('filters incidents by category slug/id', async () => {
    const res = await fetchIncidents({
      category_id: ['fire'],
      limit: 50,
    });

    expect(res.items.length).toBeGreaterThan(0);
    res.items.forEach((item) => {
      expect(item.category.slug).toBe('fire');
    });
  });

  it('filters incidents by full-text search q', async () => {
    const res = await fetchIncidents({
      q: 'Trail 4',
      limit: 25,
    });

    expect(res.items.length).toBeGreaterThan(0);
    expect(res.items[0]?.title).toContain('Trail 4');
  });

  it('filters incidents by flagged only', async () => {
    const res = await fetchIncidents({
      flagged: true,
      limit: 50,
    });

    expect(res.items.length).toBeGreaterThan(0);
    res.items.forEach((item) => {
      expect(item.flags_count).toBeGreaterThan(0);
    });
  });

  it('filters incidents by media presence', async () => {
    const res = await fetchIncidents({
      has_media: true,
      limit: 50,
    });

    expect(res.items.length).toBeGreaterThan(0);
    res.items.forEach((item) => {
      expect(item.has_media).toBe(true);
    });
  });

  it('filters incidents by location radius (near)', async () => {
    const res = await fetchIncidents({
      near_lat: 33.7294,
      near_lng: 73.0551,
      radius_km: 3,
      limit: 50,
    });

    expect(res.items.length).toBeGreaterThan(0);
  });

  it('combines multiple filters correctly', async () => {
    const res = await fetchIncidents({
      category_id: ['fire'],
      flagged: true,
      limit: 50,
    });

    res.items.forEach((item) => {
      expect(item.category.slug).toBe('fire');
      expect(item.flags_count).toBeGreaterThan(0);
    });
  });

  it('sorts incidents by flag count descending', async () => {
    const res = await fetchIncidents({
      sort: 'flags_count:desc',
      limit: 20,
    });

    for (let i = 0; i < res.items.length - 1; i++) {
      const current = res.items[i]?.flags_count ?? 0;
      const next = res.items[i + 1]?.flags_count ?? 0;
      expect(current).toBeGreaterThanOrEqual(next);
    }
  });

  it('navigates with cursor pagination', async () => {
    const page1 = await fetchIncidents({ limit: 10 });
    expect(page1.items.length).toBe(10);
    expect(page1.next_cursor).toBe('10');

    const page2 = await fetchIncidents({ cursor: page1.next_cursor!, limit: 10 });
    expect(page2.items.length).toBe(10);
    expect(page2.prev_cursor).toBe('0');
    expect(page2.next_cursor).toBe('20');
    expect(page2.items[0]?.id).not.toBe(page1.items[0]?.id);
  });
});

describe('Incident detail, audited reveals, and moderation actions API', () => {
  const targetId = 'inc_001';

  it('fetches complete incident detail including timeline and flags', async () => {
    const detail = await fetchIncidentDetail(targetId);

    expect(detail.id).toBe(targetId);
    expect(detail.title).toBeDefined();
    expect(detail.timeline).toBeInstanceOf(Array);
    expect(detail.timeline?.length).toBeGreaterThan(0);
    expect(detail.fuzzed_location).toHaveProperty('lat');
    expect(detail.fuzzed_location).toHaveProperty('lng');
  });

  it('throws error when fetching non-existent incident', async () => {
    await expect(fetchIncidentDetail('non_existent_id')).rejects.toThrow();
  });

  it('requires a reason when revealing reporter identity', async () => {
    await expect(revealReporter(targetId, '')).rejects.toThrow(
      'Audit reason is required'
    );
  });

  it('reveals reporter profile when valid audit reason is provided', async () => {
    const reporter = await revealReporter(
      targetId,
      'Investigating duplicate emergency dispatch'
    );

    expect(reporter).toBeDefined();
    expect(reporter.id).toMatch(/^usr_/);
    expect(reporter.display_name).toBeDefined();
    expect(reporter.email).toContain('@');
    expect(typeof reporter.trust_score).toBe('number');
  });

  it('requires a reason when revealing exact GPS coordinates', async () => {
    await expect(revealExactLocation(targetId, '')).rejects.toThrow(
      'Audit reason is required'
    );
  });

  it('reveals exact coordinates when valid audit reason is provided', async () => {
    const coords = await revealExactLocation(
      targetId,
      'Dispatching emergency medical services unit'
    );

    expect(coords).toBeDefined();
    expect(typeof coords.lat).toBe('number');
    expect(typeof coords.lng).toBe('number');
    expect(coords.lat).toBeGreaterThan(0);
  });

  it('requires a reason to perform a moderation action', async () => {
    await expect(
      performIncidentAction(targetId, 'approve', '')
    ).rejects.toThrow('Reason is required');
  });

  it('approves an incident successfully and returns updated status', async () => {
    const updated = await performIncidentAction(
      targetId,
      'approve',
      'Verified by rescue squad dispatch'
    );

    expect(updated.review_status).toBe('published');
  });

  it('rejects an incident successfully and returns updated status', async () => {
    const updated = await performIncidentAction(
      targetId,
      'reject',
      'Insufficient verifiable information'
    );

    expect(updated.review_status).toBe('not_approved');
  });
});
