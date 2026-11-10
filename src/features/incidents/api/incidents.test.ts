import { describe, it, expect } from 'vitest';
import {
  fetchIncidents,
  fetchIncidentDetail,
  revealReporter,
  revealExactLocation,
  performIncidentAction,
  performBulkIncidentAction,
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

  it('marks an incident as false report successfully', async () => {
    const updated = await performIncidentAction(
      targetId,
      'mark_false',
      'Confirmed drill mistaken for emergency'
    );

    expect(updated.review_status).toBe('false_report');
  });

  it('removes and restores an incident within retention window', async () => {
    const removed = await performIncidentAction(
      targetId,
      'remove',
      'Content retention compliance'
    );
    expect(removed.review_status).toBe('removed');

    const restored = await performIncidentAction(
      targetId,
      'restore',
      'Erroneous removal rectified'
    );
    expect(restored.review_status).toBe('under_review');
  });

  it('resolves an incident and marks lifecycle_status as resolved', async () => {
    const resolved = await performIncidentAction(
      targetId,
      'resolve',
      'Emergency response completed on site'
    );
    expect(resolved.lifecycle_status).toBe('resolved');
  });

  it('re-queues incident for review', async () => {
    const rereviewed = await performIncidentAction(
      targetId,
      're_review',
      'New imagery uploaded by bystander'
    );
    expect(rereviewed.review_status).toBe('under_review');
  });

  it('returns 409 conflict when trying to approve an already removed incident', async () => {
    // Soft remove first
    await performIncidentAction(targetId, 'remove', 'Soft removal for test');

    // Attempting approve on removed incident triggers conflict
    await expect(
      performIncidentAction(targetId, 'approve', 'Attempting illegal approval')
    ).rejects.toThrow(/conflict/i);

    // Clean up by restoring
    await performIncidentAction(targetId, 'restore', 'Restoring after conflict test');
  });
});

describe('Bulk Incident Actions API integration', () => {
  it('requires a justification reason for bulk action', async () => {
    await expect(
      performBulkIncidentAction(['inc_001', 'inc_002'], 'approve', '')
    ).rejects.toThrow(/reason is required/i);
  });

  it('successfully bulk approves incidents', async () => {
    const res = await performBulkIncidentAction(
      ['inc_001', 'inc_002'],
      'approve',
      'Verified via dispatch confirmation'
    );

    expect(res.succeeded).toContain('inc_001');
    expect(res.succeeded).toContain('inc_002');
    expect(res.failed).toHaveLength(0);
  });

  it('handles partial failures reporting conflicts and non-existent IDs', async () => {
    // Put inc_001 into removed status
    await performIncidentAction('inc_001', 'remove', 'Remove for conflict test');

    const res = await performBulkIncidentAction(
      ['inc_001', 'non_existent_inc_999'],
      'approve',
      'Batch approval run'
    );

    // inc_001 should fail due to state conflict (cannot approve removed incident)
    // non_existent_inc_999 should fail due to NOT_FOUND
    expect(res.failed.length).toBeGreaterThanOrEqual(1);
    const removedFailure = res.failed.find((f) => f.id === 'inc_001');
    expect(removedFailure?.error.code).toBe('STATE_CONFLICT');

    const notFoundFailure = res.failed.find((f) => f.id === 'non_existent_inc_999');
    expect(notFoundFailure?.error.code).toBe('NOT_FOUND');

    // Restore inc_001
    await performIncidentAction('inc_001', 'restore', 'Restoring inc_001');
  });
});
