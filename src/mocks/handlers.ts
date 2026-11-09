import { http, HttpResponse } from 'msw';
import { mockUsers, mockCategories } from './fixtures';
import { mockIncidentsDataset, queryMockIncidents } from './incidents-data';
import { enrichIncidentDetail } from '../features/incidents/api/mock-detail';

export { mockUsers, mockCategories, queryMockIncidents };

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

  // Perform moderation action on incident
  http.post(
    /.*\/admin\/incidents\/([a-zA-Z0-9_-]+)\/(approve|reject|mark_false|remove|restore|resolve|re_review)(\?|$)/,
    async ({ request, params }) => {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return HttpResponse.json(
          { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
          { status: 401 }
        );
      }
      const id = params[0] as string;
      const action = params[1] as string;
      const body = (await request.json().catch(() => ({}))) as {
        reason?: string;
        notes?: string;
      };
      if (!body?.reason || body.reason.trim().length === 0) {
        return HttpResponse.json(
          {
            error: {
              code: 'BAD_REQUEST',
              message: `Reason is required for action '${action}'.`,
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

      const updated = { ...incident };
      if (action === 'approve') updated.review_status = 'published';
      else if (action === 'reject') updated.review_status = 'not_approved';
      else if (action === 'mark_false') updated.review_status = 'false_report';
      else if (action === 'remove') updated.review_status = 'removed';
      else if (action === 'restore') updated.review_status = 'under_review';
      else if (action === 'resolve') updated.lifecycle_status = 'resolved';
      else if (action === 're_review') updated.review_status = 'under_review';

      const detail = enrichIncidentDetail(updated);
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
];
