import { http, HttpResponse } from 'msw';
import { mockUsers, mockCategories } from './fixtures';
import { mockIncidentsDataset } from './incidents-data';
import { enrichIncidentDetail } from '../features/incidents/api/mock-detail';

export { mockUsers, mockCategories };

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function queryMockIncidents(searchParams: URLSearchParams) {
  const cursorParam = searchParams.get('cursor');
  const limit = Math.min(
    Math.max(1, Number(searchParams.get('limit')) || 25),
    100
  );
  const q = searchParams.get('q')?.toLowerCase()?.trim();
  const reviewStatusParam = searchParams.get('review_status');
  const lifecycleStatusParam = searchParams.get('lifecycle_status');
  const categoryIdParams = searchParams.getAll('category_id');
  const flagged = searchParams.get('flagged');
  const hasMedia = searchParams.get('has_media');
  const removed = searchParams.get('removed');
  const reporterId = searchParams.get('reporter_id');
  const createdFrom = searchParams.get('created_from');
  const createdTo = searchParams.get('created_to');
  const near = searchParams.get('near');
  const bbox = searchParams.get('bbox');
  const sort = searchParams.get('sort') || 'reported_at:desc';

  let items = [...mockIncidentsDataset];

  // Filter: search text
  if (q) {
    items = items.filter(
      (inc) =>
        inc.title.toLowerCase().includes(q) ||
        inc.description.toLowerCase().includes(q) ||
        inc.place_label.toLowerCase().includes(q) ||
        inc.id.toLowerCase().includes(q)
    );
  }

  // Filter: review_status
  if (reviewStatusParam) {
    const statuses = reviewStatusParam
      .split(',')
      .map((s) => s.trim().toLowerCase());
    items = items.filter((inc) =>
      statuses.includes(inc.review_status.toLowerCase())
    );
  } else if (removed !== 'true') {
    // Exclude soft-deleted incidents by default unless requested
    items = items.filter((inc) => inc.review_status !== 'removed');
  }

  // Filter: lifecycle_status
  if (lifecycleStatusParam) {
    const statuses = lifecycleStatusParam
      .split(',')
      .map((s) => s.trim().toLowerCase());
    items = items.filter((inc) =>
      statuses.includes(inc.lifecycle_status.toLowerCase())
    );
  }

  // Filter: category_id (supports comma-separated or multiple query params)
  if (categoryIdParams.length > 0) {
    const allowedCategories = categoryIdParams
      .flatMap((c) => c.split(','))
      .map((c) => c.trim().toLowerCase());
    items = items.filter(
      (inc) =>
        allowedCategories.includes(inc.category.id.toLowerCase()) ||
        allowedCategories.includes(inc.category.slug.toLowerCase())
    );
  }

  // Filter: flagged
  if (flagged === 'true') {
    items = items.filter((inc) => inc.flags_count > 0);
  } else if (flagged === 'false') {
    items = items.filter((inc) => inc.flags_count === 0);
  }

  // Filter: has_media
  if (hasMedia === 'true') {
    items = items.filter((inc) => inc.has_media);
  } else if (hasMedia === 'false') {
    items = items.filter((inc) => !inc.has_media);
  }

  // Filter: reporter_id
  if (reporterId) {
    items = items.filter((inc) => inc.reporter_id === reporterId);
  }

  // Filter: created_from
  if (createdFrom) {
    const fromTime = new Date(createdFrom).getTime();
    if (!isNaN(fromTime)) {
      items = items.filter(
        (inc) => new Date(inc.reported_at).getTime() >= fromTime
      );
    }
  }

  // Filter: created_to
  if (createdTo) {
    const toTime = new Date(createdTo).getTime();
    if (!isNaN(toTime)) {
      items = items.filter(
        (inc) => new Date(inc.reported_at).getTime() <= toTime
      );
    }
  }

  // Filter: near (lat,lng,radius_km)
  if (near) {
    const [latStr, lngStr, radiusStr] = near.split(',');
    const centerLat = Number(latStr);
    const centerLng = Number(lngStr);
    const radiusKm = Number(radiusStr);
    if (!isNaN(centerLat) && !isNaN(centerLng) && !isNaN(radiusKm)) {
      items = items.filter((inc) => {
        const dist = getDistanceKm(
          centerLat,
          centerLng,
          inc.fuzzed_location.lat,
          inc.fuzzed_location.lng
        );
        return dist <= radiusKm;
      });
    }
  }

  // Filter: bbox (min_lon,min_lat,max_lon,max_lat)
  if (bbox) {
    const [minLon, minLat, maxLon, maxLat] = bbox.split(',').map(Number);
    if (
      minLon !== undefined &&
      minLat !== undefined &&
      maxLon !== undefined &&
      maxLat !== undefined &&
      !isNaN(minLon) &&
      !isNaN(minLat) &&
      !isNaN(maxLon) &&
      !isNaN(maxLat)
    ) {
      items = items.filter(
        (inc) =>
          inc.fuzzed_location.lng >= minLon &&
          inc.fuzzed_location.lng <= maxLon &&
          inc.fuzzed_location.lat >= minLat &&
          inc.fuzzed_location.lat <= maxLat
      );
    }
  }

  // Sorting
  const [sortField, sortDirection] = sort.split(':');
  items.sort((a, b) => {
    let comparison = 0;
    if (sortField === 'reported_at') {
      comparison =
        new Date(a.reported_at).getTime() - new Date(b.reported_at).getTime();
    } else if (sortField === 'flags_count' || sortField === 'flag_count') {
      comparison = a.flags_count - b.flags_count;
    } else if (sortField === 'status' || sortField === 'review_status') {
      comparison = a.review_status.localeCompare(b.review_status);
    } else if (sortField === 'title') {
      comparison = a.title.localeCompare(b.title);
    } else {
      comparison =
        new Date(a.reported_at).getTime() - new Date(b.reported_at).getTime();
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const totalCount = items.length;

  // Pagination with offset-based cursor
  let offset = 0;
  if (cursorParam) {
    const parsedOffset = parseInt(cursorParam, 10);
    if (!isNaN(parsedOffset) && parsedOffset >= 0) {
      offset = parsedOffset;
    }
  }

  const pagedItems = items.slice(offset, offset + limit);
  const nextOffset = offset + limit < totalCount ? offset + limit : null;
  const prevOffset = offset > 0 ? Math.max(0, offset - limit) : null;

  // Privacy Rule: strip reporter_id and exact location
  const sanitizedItems = pagedItems.map(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ reporter_id, ...item }) => item
  );

  return {
    items: sanitizedItems,
    next_cursor: nextOffset !== null ? String(nextOffset) : null,
    prev_cursor: prevOffset !== null ? String(prevOffset) : null,
    total_count: totalCount,
  };
}

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
