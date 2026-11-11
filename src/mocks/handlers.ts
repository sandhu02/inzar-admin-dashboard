import { http, HttpResponse } from 'msw';
import { mockUsers, mockCategories } from './fixtures';
import { mockIncidentsDataset, queryMockIncidents } from './incidents-data';
import { enrichIncidentDetail } from '../features/incidents/api/mock-detail';

export { mockUsers, mockCategories, queryMockIncidents };

export const flagsStatusOverrides = new Map<string, string>();

export const handlers = [
  // Auth login
  http.post(/.*\/auth\/login(\?|$)/, async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };

    if (body.password !== 'Password123!') {
      return HttpResponse.json(
        {
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password.',
          },
        },
        { status: 401 }
      );
    }

    if (body.email === 'admin@inzar.app') {
      return HttpResponse.json({
        access_token: 'mock_jwt_access_admin_token',
        refresh_token: 'mock_jwt_refresh_admin_token',
        token_type: 'bearer',
        expires_in: 900,
        user: mockUsers.admin,
      });
    }

    if (body.email === 'moderator@inzar.app') {
      return HttpResponse.json({
        access_token: 'mock_jwt_access_mod_token',
        refresh_token: 'mock_jwt_refresh_mod_token',
        token_type: 'bearer',
        expires_in: 900,
        user: mockUsers.moderator,
      });
    }

    if (body.email === 'user@inzar.app') {
      return HttpResponse.json({
        access_token: 'mock_jwt_access_user_token',
        refresh_token: 'mock_jwt_refresh_user_token',
        token_type: 'bearer',
        expires_in: 900,
        user: mockUsers.user,
      });
    }

    return HttpResponse.json(
      {
        error: {
          code: 'USER_NOT_FOUND',
          message: 'No account found with this email.',
        },
      },
      { status: 404 }
    );
  }),

  // Auth refresh
  http.post(/.*\/auth\/refresh(\?|$)/, async ({ request }) => {
    const body = (await request.json()) as { refresh_token?: string };
    if (!body.refresh_token || body.refresh_token.includes('invalid')) {
      return HttpResponse.json(
        {
          error: {
            code: 'INVALID_TOKEN',
            message: 'Refresh token is invalid or expired.',
          },
        },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      access_token: `mock_jwt_access_refreshed_${Date.now()}`,
      refresh_token: `mock_jwt_refresh_rotated_${Date.now()}`,
      expires_in: 900,
    });
  }),

  // Auth logout
  http.post(/.*\/auth\/logout(\?|$)/, () => {
    return HttpResponse.json({ success: true });
  }),

  // Get current user profile
  http.get(/.*\/me(\?|$)/, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication credentials were not provided.',
          },
        },
        { status: 401 }
      );
    }

    if (authHeader.includes('mod')) {
      return HttpResponse.json(mockUsers.moderator);
    }
    return HttpResponse.json(mockUsers.admin);
  }),

  // Categories list
  http.get(/.*\/admin\/categories(\?|$)/, () => {
    return HttpResponse.json(mockCategories);
  }),

  // Overview stats
  http.get(/.*\/admin\/stats\/overview(\?|$)/, () => {
    return HttpResponse.json({
      queue_size: 14,
      oldest_queue_item_age_minutes: 38,
      new_incidents_count: 212,
      flags_awaiting_action: 9,
      flags_distinct_incidents: 6,
      job_failures_count: 3,
      job_backlog_count: 27,
      active_users_count: 1284,
      alerts_sent_count: 3906,
    });
  }),

  // Incidents list with filtering, sorting, and cursor pagination
  http.get(/.*\/admin\/incidents(\?|$)/, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication credentials were not provided.',
          },
        },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const result = queryMockIncidents(url.searchParams);
    return HttpResponse.json(result);
  }),

  // Reveal reporter profile with audited reason
  http.post(
    /.*\/admin\/incidents\/([a-zA-Z0-9_-]+)\/reveal-reporter(\?|$)/,
    async ({ request, params }) => {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return HttpResponse.json(
          { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
          { status: 401 }
        );
      }
      const id = params[0] as string;
      const body = (await request.json().catch(() => ({}))) as {
        reason?: string;
      };
      if (!body?.reason || body.reason.trim().length === 0) {
        return HttpResponse.json(
          {
            error: {
              code: 'BAD_REQUEST',
              message: 'Audit reason is required to reveal reporter details.',
            },
          },
          { status: 400 }
        );
      }
      const incident = mockIncidentsDataset.find((inc) => inc.id === id);
      if (!incident) {
        return HttpResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Incident not found' } },
          { status: 404 }
        );
      }
      const detail = enrichIncidentDetail(incident);
      return HttpResponse.json(detail.reporter);
    }
  ),

  // Reveal exact GPS coordinates with audited reason
  http.post(
    /.*\/admin\/incidents\/([a-zA-Z0-9_-]+)\/reveal-location(\?|$)/,
    async ({ request, params }) => {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return HttpResponse.json(
          { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
          { status: 401 }
        );
      }
      const id = params[0] as string;
      const body = (await request.json().catch(() => ({}))) as {
        reason?: string;
      };
      if (!body?.reason || body.reason.trim().length === 0) {
        return HttpResponse.json(
          {
            error: {
              code: 'BAD_REQUEST',
              message: 'Audit reason is required to reveal exact GPS coordinates.',
            },
          },
          { status: 400 }
        );
      }
      const incident = mockIncidentsDataset.find((inc) => inc.id === id);
      if (!incident) {
        return HttpResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Incident not found' } },
          { status: 404 }
        );
      }
      const detail = enrichIncidentDetail(incident);
      return HttpResponse.json(detail.exact_location);
    }
  ),

  // Bulk incident moderation action
  http.post(/.*\/admin\/incidents\/bulk(\?|$)/, async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }
    if (authHeader.includes('user')) {
      return HttpResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to perform bulk moderation actions.',
          },
        },
        { status: 403 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      ids?: string[];
      action?: string;
      reason?: string;
    };

    if (!body?.action || !['approve', 'reject', 'mark_false', 'mark-false', 'remove'].includes(body.action)) {
      return HttpResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Valid action is required for bulk operation.' } },
        { status: 400 }
      );
    }

    if (!body?.reason || body.reason.trim().length === 0) {
      return HttpResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Reason is required for bulk action.' } },
        { status: 400 }
      );
    }

    if (!body?.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
      return HttpResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'At least one incident ID must be provided.' } },
        { status: 400 }
      );
    }

    if (body.ids.length > 100) {
      return HttpResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Maximum of 100 incidents can be processed in a bulk operation.' } },
        { status: 400 }
      );
    }

    const succeeded: string[] = [];
    const failed: Array<{ id: string; error: { code: string; message: string } }> = [];

    for (const id of body.ids) {
      const incident = mockIncidentsDataset.find((inc) => inc.id === id);
      if (!incident) {
        failed.push({
          id,
          error: { code: 'NOT_FOUND', message: `Incident ${id} was not found.` },
        });
        continue;
      }

      if (body.action === 'approve' && incident.review_status === 'removed') {
        failed.push({
          id,
          error: { code: 'STATE_CONFLICT', message: 'Cannot approve a removed incident. Restore it first.' },
        });
        continue;
      }
      if (body.action === 'reject' && incident.review_status === 'removed') {
        failed.push({
          id,
          error: { code: 'STATE_CONFLICT', message: 'Cannot reject a removed incident.' },
        });
        continue;
      }

      const normalizedAction = body.action.replace('-', '_');
      if (normalizedAction === 'approve') incident.review_status = 'published';
      else if (normalizedAction === 'reject') incident.review_status = 'not_approved';
      else if (normalizedAction === 'mark_false') incident.review_status = 'false_report';
      else if (normalizedAction === 'remove') incident.review_status = 'removed';

      succeeded.push(id);
    }

    return HttpResponse.json({ succeeded, failed });
  }),

  // Perform moderation action on incident
  http.post(
    /.*\/admin\/incidents\/([a-zA-Z0-9_-]+)\/(approve|reject|mark_false|mark-false|remove|restore|resolve|re_review|rereview)(\?|$)/,
    async ({ request, params }) => {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return HttpResponse.json(
          { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
          { status: 401 }
        );
      }
      if (authHeader.includes('user')) {
        return HttpResponse.json(
          {
            error: {
              code: 'FORBIDDEN',
              message: 'You do not have permission to moderate incidents.',
            },
          },
          { status: 403 }
        );
      }

      const id = params[0] as string;
      const rawAction = params[1] as string;
      const action = rawAction.replace('-', '_');
      const body = (await request.json().catch(() => ({}))) as {
        reason?: string;
        notes?: string;
      };
      if (!body?.reason || body.reason.trim().length === 0) {
        return HttpResponse.json(
          {
            error: {
              code: 'BAD_REQUEST',
              message: `Reason is required for action '${rawAction}'.`,
            },
          },
          { status: 400 }
        );
      }
      const incident = mockIncidentsDataset.find((inc) => inc.id === id);
      if (!incident) {
        return HttpResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Incident not found' } },
          { status: 404 }
        );
      }

      // Check conflict conditions
      if (action === 'approve' && incident.review_status === 'removed') {
        return HttpResponse.json(
          {
            error: {
              code: 'STATE_CONFLICT',
              message: 'State conflict: cannot approve a removed incident. Restore it first.',
            },
          },
          { status: 409 }
        );
      }
      if (action === 'restore' && incident.review_status !== 'removed') {
        return HttpResponse.json(
          {
            error: {
              code: 'STATE_CONFLICT',
              message: 'State conflict: incident is not removed and cannot be restored.',
            },
          },
          { status: 409 }
        );
      }

      if (action === 'approve') incident.review_status = 'published';
      else if (action === 'reject') incident.review_status = 'not_approved';
      else if (action === 'mark_false') incident.review_status = 'false_report';
      else if (action === 'remove') incident.review_status = 'removed';
      else if (action === 'restore') incident.review_status = 'under_review';
      else if (action === 'resolve') incident.lifecycle_status = 'resolved';
      else if (action === 're_review' || action === 'rereview') incident.review_status = 'under_review';

      const detail = enrichIncidentDetail(incident);
      detail.timeline = [
        ...(detail.timeline || []),
        {
          id: `tl_${action}_${Date.now()}`,
          type: 'decision',
          title: `Action: ${action.replace('_', ' ').toUpperCase()}`,
          description: `Reason: ${body.reason}${body.notes ? ` · Note: ${body.notes}` : ''}`,
          timestamp: new Date().toISOString(),
          actor: 'Moderator',
          notes: body.notes,
        },
      ];

      return HttpResponse.json(detail);
    }
  ),

  // Get incident detail by ID
  http.get(
    /.*\/admin\/incidents\/([a-zA-Z0-9_-]+)(\?|$)/,
    ({ request, params }) => {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return HttpResponse.json(
          { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
          { status: 401 }
        );
      }
      const id = params[0] as string;
      const incident = mockIncidentsDataset.find((inc) => inc.id === id);
      if (!incident) {
        return HttpResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Incident not found' } },
          { status: 404 }
        );
      }
      const detail = enrichIncidentDetail(incident);
      return HttpResponse.json(detail);
    }
  ),

  // Moderation queue list
  http.get(/.*\/admin\/moderation\/queue(\?|$)/, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const categoryFilter = url.searchParams.get('category_id') || url.searchParams.get('category');

    let pendingItems = mockIncidentsDataset.filter(
      (inc) => inc.review_status === 'under_review' || inc.review_status === 'needs_review'
    );

    if (categoryFilter && categoryFilter !== 'all') {
      const cats = categoryFilter.split(',').map((c) => c.trim().toLowerCase());
      pendingItems = pendingItems.filter(
        (inc) =>
          cats.includes(inc.category.id.toLowerCase()) ||
          cats.includes(inc.category.slug.toLowerCase())
      );
    }

    // Sort by reported_at ascending (oldest first for queue)
    pendingItems.sort(
      (a, b) => new Date(a.reported_at).getTime() - new Date(b.reported_at).getTime()
    );

    const now = Date.now();
    const oldestItem = pendingItems[0];
    const oldestItemAgeMinutes = oldestItem
      ? Math.max(1, Math.round((now - new Date(oldestItem.reported_at).getTime()) / 60000))
      : 0;

    const enrichedItems = pendingItems.map((inc) => enrichIncidentDetail(inc));

    return HttpResponse.json({
      items: enrichedItems,
      queue_size: pendingItems.length,
      oldest_item_age_minutes: oldestItemAgeMinutes,
      oldest_reported_at: oldestItem ? oldestItem.reported_at : null,
    });
  }),

  // Moderation approve & reject shortcuts endpoints (/admin/moderation/:id/approve, reject)
  http.post(
    /.*\/admin\/moderation\/([a-zA-Z0-9_-]+)\/(approve|reject)(\?|$)/,
    async ({ request, params }) => {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return HttpResponse.json(
          { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
          { status: 401 }
        );
      }
      if (authHeader.includes('user')) {
        return HttpResponse.json(
          {
            error: {
              code: 'FORBIDDEN',
              message: 'You do not have permission to moderate incidents.',
            },
          },
          { status: 403 }
        );
      }

      const id = params[0] as string;
      const action = params[1] as string;
      const body = (await request.json().catch(() => ({}))) as {
        reason?: string;
        notes?: string;
      };

      if (action === 'reject' && (!body?.reason || body.reason.trim().length === 0)) {
        return HttpResponse.json(
          {
            error: {
              code: 'BAD_REQUEST',
              message: 'Reason is required to reject an incident report.',
            },
          },
          { status: 400 }
        );
      }

      const incident = mockIncidentsDataset.find((inc) => inc.id === id);
      if (!incident) {
        return HttpResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Incident not found' } },
          { status: 404 }
        );
      }

      if (action === 'approve') {
        incident.review_status = 'published';
      } else {
        incident.review_status = 'not_approved';
      }

      const detail = enrichIncidentDetail(incident);
      detail.timeline = [
        ...(detail.timeline || []),
        {
          id: `tl_mod_${action}_${Date.now()}`,
          type: 'decision',
          title: action === 'approve' ? 'Approved by Moderator' : 'Rejected by Moderator',
          description: action === 'approve' ? 'Incident published from queue' : `Reason: ${body.reason}`,
          timestamp: new Date().toISOString(),
          actor: 'Moderator',
          notes: body.notes || body.reason,
        },
      ];

      return HttpResponse.json(detail);
    }
  ),

  // Flags list grouped by incident
  http.get(/.*\/admin\/flags(\?|$)/, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const typeFilter = url.searchParams.get('type') || 'all';
    const statusFilter = url.searchParams.get('status') || 'all';
    const categoryFilter = url.searchParams.get('category_id') || url.searchParams.get('category');
    const searchQuery = (url.searchParams.get('q') || '').toLowerCase().trim();

    // Collect all flagged incidents
    const flaggedIncidents = mockIncidentsDataset.filter((inc) => (inc.flags_count ?? 0) > 0);

    const groups: Array<{
      incident_id: string;
      incident_title: string;
      incident_description: string;
      incident_thumbnail_url: string | null;
      category: (typeof mockCategories)[number];
      review_status: string;
      lifecycle_status: string;
      place_label: string;
      reported_at: string;
      flags_count: number;
      distinct_flaggers_count: number;
      flags: Array<{
        id: string;
        incident_id: string;
        type: 'incorrect' | 'abuse' | 'resolved' | 'other';
        reason: string;
        created_at: string;
        flagger_count: number;
        status: 'pending' | 'reviewed' | 'dismissed';
      }>;
    }> = [];

    let totalAwaiting = 0;

    for (const inc of flaggedIncidents) {
      if (categoryFilter && categoryFilter !== 'all') {
        const cats = categoryFilter.split(',').map((c) => c.trim().toLowerCase());
        if (!cats.includes(inc.category.id.toLowerCase()) && !cats.includes(inc.category.slug.toLowerCase())) {
          continue;
        }
      }

      if (searchQuery) {
        const matchTitle = inc.title.toLowerCase().includes(searchQuery);
        const matchDesc = inc.description.toLowerCase().includes(searchQuery);
        const matchPlace = inc.place_label.toLowerCase().includes(searchQuery);
        if (!matchTitle && !matchDesc && !matchPlace) continue;
      }

      const detail = enrichIncidentDetail(inc);
      let flags = (detail.flags || []).map((fl) => {
        const overrideStatus = flagsStatusOverrides.get(fl.id);
        return {
          id: fl.id,
          incident_id: inc.id,
          type: fl.type as 'incorrect' | 'abuse' | 'resolved' | 'other',
          reason: fl.reason,
          created_at: fl.created_at,
          flagger_count: fl.flagger_count ?? 1,
          status: (overrideStatus || fl.status) as 'pending' | 'reviewed' | 'dismissed',
        };
      });

      if (typeFilter !== 'all') {
        flags = flags.filter((f) => f.type === typeFilter);
      }

      if (statusFilter !== 'all') {
        flags = flags.filter((f) => f.status === statusFilter);
      }

      if (flags.length === 0) continue;

      const distinctFlaggers = flags.reduce((sum, f) => sum + f.flagger_count, 0);
      totalAwaiting += flags.filter((f) => f.status === 'pending').length;

      groups.push({
        incident_id: inc.id,
        incident_title: inc.title,
        incident_description: inc.description,
        incident_thumbnail_url: inc.thumbnail_url,
        category: inc.category,
        review_status: inc.review_status,
        lifecycle_status: inc.lifecycle_status,
        place_label: inc.place_label,
        reported_at: inc.reported_at,
        flags_count: flags.length,
        distinct_flaggers_count: Math.max(flags.length, distinctFlaggers),
        flags,
      });
    }

    return HttpResponse.json({
      items: groups,
      total_count: groups.length,
      awaiting_count: totalAwaiting,
      distinct_incidents_count: groups.length,
    });
  }),

  // Update flag status (dismiss, resolve)
  http.patch(
    /.*\/admin\/flags\/([a-zA-Z0-9_-]+)(\?|$)/,
    async ({ request, params }) => {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return HttpResponse.json(
          { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
          { status: 401 }
        );
      }

      const flagId = params[0] as string;
      const body = (await request.json().catch(() => ({}))) as {
        status?: string;
        notes?: string;
      };

      if (!body?.status) {
        return HttpResponse.json(
          { error: { code: 'BAD_REQUEST', message: 'Status is required to update flag.' } },
          { status: 400 }
        );
      }

      flagsStatusOverrides.set(flagId, body.status);

      return HttpResponse.json({
        id: flagId,
        status: body.status,
        notes: body.notes,
        updated_at: new Date().toISOString(),
      });
    }
  ),
];
