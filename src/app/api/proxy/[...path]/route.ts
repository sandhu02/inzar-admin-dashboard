import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import {
  getSession,
  sealSession,
  setSessionCookie,
  clearSessionCookie,
} from '@/lib/auth/session';
import { refreshSingleFlight } from '@/lib/auth/refresh';
import { enrichIncidentDetail } from '@/features/incidents/api/mock-detail';
import type { Incident, IncidentDetail } from '@/features/incidents/types';

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

// In-memory cache for status overrides (e.g. actions approved, rejected, resolved)
const updatedIncidentsCache = new Map<string, Partial<IncidentDetail>>();

const CATEGORY_STYLE_LOOKUP: Record<string, { color_hex: string; icon_key: string }> = {
  fire: { color_hex: '#EF4444', icon_key: 'flame' },
  accident: { color_hex: '#F97316', icon_key: 'alert-triangle' },
  road_block: { color_hex: '#EAB308', icon_key: 'shield-alert' },
  road_blockage: { color_hex: '#EAB308', icon_key: 'shield-alert' },
  flooding: { color_hex: '#3B82F6', icon_key: 'droplets' },
  gathering: { color_hex: '#8B5CF6', icon_key: 'users' },
  public_gathering: { color_hex: '#8B5CF6', icon_key: 'users' },
  other: { color_hex: '#6B7280', icon_key: 'help-circle' },
  other_hazard: { color_hex: '#6B7280', icon_key: 'help-circle' },
};

const SLUG_TO_BACKEND_UUID: Record<string, string> = {
  fire: '2106fae9-9695-45b4-b08b-f6f624de5296',
  cat_fire: '2106fae9-9695-45b4-b08b-f6f624de5296',
  accident: '82d37bb7-b0e5-44db-82da-5ff15601ae88',
  cat_accident: '82d37bb7-b0e5-44db-82da-5ff15601ae88',
  road_block: '171f646b-f87e-464d-bc9b-6c733f7ad707',
  road_blockage: '171f646b-f87e-464d-bc9b-6c733f7ad707',
  cat_road_block: '171f646b-f87e-464d-bc9b-6c733f7ad707',
  flooding: '25419791-7d94-4090-a348-178fec6b93fc',
  cat_flooding: '25419791-7d94-4090-a348-178fec6b93fc',
  gathering: '3168c7f2-3438-4834-a88a-253a2aa1e51e',
  public_gathering: '3168c7f2-3438-4834-a88a-253a2aa1e51e',
  cat_gathering: '3168c7f2-3438-4834-a88a-253a2aa1e51e',
  other: '223aa389-f240-4d8b-bd47-bb276a7add8d',
  other_hazard: '223aa389-f240-4d8b-bd47-bb276a7add8d',
  cat_other: '223aa389-f240-4d8b-bd47-bb276a7add8d',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function adaptBackendIncidents(backendData: any, searchParams: URLSearchParams) {
  const rawList = Array.isArray(backendData)
    ? backendData
    : Array.isArray(backendData?.items)
      ? backendData.items
      : Array.isArray(backendData?.data)
        ? backendData.data
        : [];

  const offset = parseInt(searchParams.get('cursor') || '0', 10) || 0;
  const limit = parseInt(searchParams.get('limit') || '25', 10) || 25;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items = rawList.map((item: any) => {
    const catSlug = item.category?.slug || item.category_slug || 'other';
    const style = CATEGORY_STYLE_LOOKUP[catSlug] || {
      color_hex: '#6B7280',
      icon_key: 'help-circle',
    };

    const id = String(item.id);
    const cachedOverride = updatedIncidentsCache.get(id);

    const category =
      item.category && typeof item.category === 'object'
        ? {
            id: String(item.category.id || item.category_id || ''),
            slug: item.category.slug || catSlug,
            name: item.category.name || item.category_name || 'General',
            color_hex: item.category.color_hex || item.color_hex || style.color_hex,
            icon_key: item.category.icon_key || item.icon_key || style.icon_key,
            is_active: item.category.is_active ?? true,
            sort_order: item.category.sort_order ?? 0,
          }
        : {
            id: String(item.category_id || ''),
            slug: catSlug,
            name: item.category_name || 'General',
            color_hex: item.color_hex || style.color_hex,
            icon_key: item.icon_key || style.icon_key,
            is_active: true,
            sort_order: 0,
          };

    const fuzzed_location =
      item.fuzzed_location && typeof item.fuzzed_location === 'object'
        ? item.fuzzed_location
        : {
            lat: typeof item.public_lat === 'number' ? item.public_lat : (item.lat ?? 0),
            lng: typeof item.public_lon === 'number' ? item.public_lon : (item.lng ?? 0),
          };

    return {
      id,
      title: item.title || '',
      description: item.description || '',
      category,
      review_status: cachedOverride?.review_status || item.review_status,
      lifecycle_status: cachedOverride?.lifecycle_status || item.lifecycle_status,
      place_label: item.place_label || 'Reported Location',
      fuzzed_location,
      reported_at: item.reported_at || new Date().toISOString(),
      has_media:
        typeof item.has_media === 'boolean'
          ? item.has_media
          : Array.isArray(item.media_urls) && item.media_urls.length > 0,
      thumbnail_url:
        item.thumbnail_url ??
        (Array.isArray(item.media_urls) && item.media_urls.length > 0
          ? item.media_urls[0]
          : null),
      flags_count: item.flags_count ?? 0,
    };
  });

  return {
    items,
    next_cursor:
      backendData?.next_cursor ?? (items.length >= limit ? String(offset + limit) : null),
    prev_cursor:
      backendData?.prev_cursor ?? (offset > 0 ? String(Math.max(0, offset - limit)) : null),
    total_count:
      typeof backendData?.total_count === 'number' ? backendData.total_count : items.length,
  };
}

async function findIncidentById(id: string, accessToken: string): Promise<Incident | null> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/json',
    'X-Tunnel-Skip-AntiPhishing-Page': 'true',
    'bypass-tunnel-reminder': 'true',
  };

  // 1. Try direct GET /admin/incidents/:id from real backend
  try {
    const singleRes = await fetch(
      `${env.API_BASE_URL}/admin/incidents/${encodeURIComponent(id)}`,
      { headers }
    );
    if (singleRes.ok) {
      const contentType = singleRes.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const item: any = await singleRes.json();
        if (item && item.id) {
          const catSlug = item.category?.slug || item.category_slug || 'other';
          const style = CATEGORY_STYLE_LOOKUP[catSlug] || {
            color_hex: '#6B7280',
            icon_key: 'help-circle',
          };
          const override = updatedIncidentsCache.get(id);

          return {
            id: String(item.id),
            title: String(item.title || ''),
            description: (item.description as string) || '',
            category:
              item.category && typeof item.category === 'object'
                ? item.category
                : {
                    id: String(item.category_id || ''),
                    slug: catSlug,
                    name: (item.category_name as string) || 'General',
                    color_hex: (item.color_hex as string) || style.color_hex,
                    icon_key: (item.icon_key as string) || style.icon_key,
                    is_active: true,
                    sort_order: 0,
                  },
            review_status:
              override?.review_status || (item.review_status as Incident['review_status']),
            lifecycle_status:
              override?.lifecycle_status || (item.lifecycle_status as Incident['lifecycle_status']),
            place_label: (item.place_label as string) || 'Reported Location',
            fuzzed_location:
              item.fuzzed_location && typeof item.fuzzed_location === 'object'
                ? item.fuzzed_location
                : {
                    lat: typeof item.public_lat === 'number' ? item.public_lat : (item.lat ?? 0),
                    lng: typeof item.public_lon === 'number' ? item.public_lon : (item.lng ?? 0),
                  },
            reported_at: String(item.reported_at || new Date().toISOString()),
            has_media:
              typeof item.has_media === 'boolean'
                ? item.has_media
                : Array.isArray(item.media_urls) && item.media_urls.length > 0,
            thumbnail_url:
              item.thumbnail_url ??
              (Array.isArray(item.media_urls) && item.media_urls[0]
                ? String(item.media_urls[0])
                : null),
            flags_count: typeof item.flags_count === 'number' ? item.flags_count : 0,
          };
        }
      }
    }
  } catch {
    // proceed to list query fallback
  }

  // 2. Query incidents list from real backend: GET /admin/incidents?q=:id
  try {
    const listRes = await fetch(
      `${env.API_BASE_URL}/admin/incidents?q=${encodeURIComponent(id)}`,
      { headers }
    );
    if (listRes.ok) {
      const contentType = listRes.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await listRes.json();
        const rawList = (
          Array.isArray(json)
            ? json
            : Array.isArray(json?.items)
              ? json.items
              : Array.isArray(json?.data)
                ? json.data
                : []
        ) as Record<string, unknown>[];

        const match = rawList.find((it) => String(it.id) === id);
        if (match) {
          const catSlug =
            (match.category_slug as string) ||
            ((match.category as Record<string, unknown>)?.slug as string) ||
            'other';
          const style = CATEGORY_STYLE_LOOKUP[catSlug] || {
            color_hex: '#6B7280',
            icon_key: 'help-circle',
          };
          const override = updatedIncidentsCache.get(id);

          return {
            id: String(match.id),
            title: String(match.title || ''),
            description: (match.description as string) || '',
            category:
              (match.category as Incident['category']) || {
                id: String(match.category_id || ''),
                slug: catSlug,
                name: (match.category_name as string) || 'General',
                color_hex: (match.color_hex as string) || style.color_hex,
                icon_key: (match.icon_key as string) || style.icon_key,
                is_active: true,
                sort_order: 0,
              },
            review_status:
              override?.review_status || (match.review_status as Incident['review_status']),
            lifecycle_status:
              override?.lifecycle_status || (match.lifecycle_status as Incident['lifecycle_status']),
            place_label: (match.place_label as string) || 'Reported Location',
            fuzzed_location:
              (match.fuzzed_location as Incident['fuzzed_location']) || {
                lat: typeof match.public_lat === 'number' ? match.public_lat : ((match.lat as number) ?? 0),
                lng: typeof match.public_lon === 'number' ? match.public_lon : ((match.lng as number) ?? 0),
              },
            reported_at: String(match.reported_at || new Date().toISOString()),
            has_media:
              typeof match.has_media === 'boolean'
                ? match.has_media
                : Array.isArray(match.media_urls) && match.media_urls.length > 0,
            thumbnail_url:
              (match.thumbnail_url as string | null) ??
              (Array.isArray(match.media_urls) && match.media_urls[0]
                ? String(match.media_urls[0])
                : null),
            flags_count: typeof match.flags_count === 'number' ? match.flags_count : 0,
          };
        }
      }
    }
  } catch {
    // live backend query failed
  }

  // Real backend did not find the incident
  return null;
}

async function handleProxy(req: NextRequest, { params }: RouteContext) {
  const { path } = await params;
  const pathString = path.join('/');
  const search = req.nextUrl.search;
  let targetUrl = `${env.API_BASE_URL}/${pathString}${search}`;

  // 1. Check session
  let session = await getSession();
  if (!session || !session.accessToken) {
    return NextResponse.json(
      {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication session expired or missing. Please log in.',
        },
      },
      { status: 401 }
    );
  }

  // 2. CSRF Origin check for state-changing methods
  const method = req.method.toUpperCase();
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const origin = req.headers.get('origin');
    const host = req.headers.get('host');
    if (origin) {
      try {
        const originHost = new URL(origin).host;
        if (host && originHost !== host) {
          return NextResponse.json(
            {
              error: {
                code: 'CSRF_BLOCKED',
                message: 'Cross-origin state-changing request blocked.',
              },
            },
            { status: 403 }
          );
        }
      } catch {
        return NextResponse.json(
          {
            error: {
              code: 'INVALID_ORIGIN',
              message: 'Invalid origin header.',
            },
          },
          { status: 403 }
        );
      }
    }
  }

  // 3. Special Handling: Incident Details and Moderation Actions
  // GET /admin/incidents/:id
  if (path.length === 3 && path[0] === 'admin' && path[1] === 'incidents' && method === 'GET') {
    const incidentId = path[2]!;
    const base = await findIncidentById(incidentId, session.accessToken);
    if (!base) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: `Incident ${incidentId} was not found.`,
          },
        },
        { status: 404 }
      );
    }

    const detail = enrichIncidentDetail(base);
    const cachedOverride = updatedIncidentsCache.get(incidentId);
    if (cachedOverride) {
      Object.assign(detail, cachedOverride);
    }

    return NextResponse.json(detail);
  }

  // POST /admin/incidents/:id/reveal-reporter
  if (
    path.length === 4 &&
    path[0] === 'admin' &&
    path[1] === 'incidents' &&
    path[3] === 'reveal-reporter' &&
    method === 'POST'
  ) {
    const incidentId = path[2]!;
    const body = await req.json().catch(() => ({}));
    const reason = body.reason?.trim();

    if (!reason) {
      return NextResponse.json(
        {
          error: {
            code: 'REASON_REQUIRED',
            message: 'A justification reason is required to reveal protected reporter identity.',
          },
        },
        { status: 400 }
      );
    }

    const base = await findIncidentById(incidentId, session.accessToken);
    if (!base) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: `Incident ${incidentId} was not found.`,
          },
        },
        { status: 404 }
      );
    }
    const detail = enrichIncidentDetail(base);

    console.info(
      `[AUDIT] Reporter identity revealed for incident ${incidentId} by ${session.user.email} (${session.user.role}). Reason: "${reason}"`
    );

    return NextResponse.json({ reporter: detail.reporter, reason });
  }

  // POST /admin/incidents/:id/reveal-location
  if (
    path.length === 4 &&
    path[0] === 'admin' &&
    path[1] === 'incidents' &&
    path[3] === 'reveal-location' &&
    method === 'POST'
  ) {
    const incidentId = path[2]!;
    const body = await req.json().catch(() => ({}));
    const reason = body.reason?.trim();

    if (!reason) {
      return NextResponse.json(
        {
          error: {
            code: 'REASON_REQUIRED',
            message: 'A justification reason is required to reveal exact coordinates.',
          },
        },
        { status: 400 }
      );
    }

    const base = await findIncidentById(incidentId, session.accessToken);
    if (!base) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: `Incident ${incidentId} was not found.`,
          },
        },
        { status: 404 }
      );
    }
    const detail = enrichIncidentDetail(base);

    console.info(
      `[AUDIT] Exact GPS coordinates revealed for incident ${incidentId} by ${session.user.email} (${session.user.role}). Reason: "${reason}"`
    );

    return NextResponse.json({ exact_location: detail.exact_location, reason });
  }

  // POST /admin/incidents/:id/:action (approve, reject, mark_false, remove, restore, resolve, re_review)
  if (
    path.length === 4 &&
    path[0] === 'admin' &&
    path[1] === 'incidents' &&
    method === 'POST' &&
    ['approve', 'reject', 'mark_false', 'remove', 'restore', 'resolve', 're_review'].includes(path[3]!)
  ) {
    const incidentId = path[2]!;
    const action = path[3]!;
    const body = await req.json().catch(() => ({}));
    const reason = body.reason?.trim();
    const notes = body.notes?.trim();

    if (!reason) {
      return NextResponse.json(
        {
          error: {
            code: 'REASON_REQUIRED',
            message: `A reason is required to perform moderation action "${action}".`,
          },
        },
        { status: 400 }
      );
    }

    // Try forwarding approve/reject to backend if available
    if (action === 'approve') {
      try {
        await fetch(`${env.API_BASE_URL}/admin/moderation/${incidentId}/approve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({ notes: notes || reason }),
        });
      } catch {
        // proceed
      }
    } else if (action === 'reject') {
      try {
        await fetch(`${env.API_BASE_URL}/admin/moderation/${incidentId}/reject`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({ reason }),
        });
      } catch {
        // proceed
      }
    }

    console.info(
      `[AUDIT] Moderation action "${action}" on incident ${incidentId} by ${session.user.email} (${session.user.role}). Reason: "${reason}"`
    );

    const base = await findIncidentById(incidentId, session.accessToken);
    if (!base) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: `Incident ${incidentId} was not found.`,
          },
        },
        { status: 404 }
      );
    }
    const detail = enrichIncidentDetail(base);

    const statusUpdates: Partial<IncidentDetail> = {};
    if (action === 'approve') {
      statusUpdates.review_status = 'published';
    } else if (action === 'reject') {
      statusUpdates.review_status = 'not_approved';
    } else if (action === 'mark_false') {
      statusUpdates.review_status = 'false_report';
    } else if (action === 'remove') {
      statusUpdates.review_status = 'removed';
    } else if (action === 'restore') {
      statusUpdates.review_status = 'under_review';
    } else if (action === 'resolve') {
      statusUpdates.lifecycle_status = 'resolved';
    } else if (action === 're_review') {
      statusUpdates.review_status = 'under_review';
    }

    // Store in cache
    updatedIncidentsCache.set(incidentId, statusUpdates);
    Object.assign(detail, statusUpdates);

    // Add new timeline event
    detail.timeline = [
      ...(detail.timeline || []),
      {
        id: `tl_${action}_${Date.now()}`,
        type: 'decision',
        title: `Action: ${action.replace('_', ' ').toUpperCase()}`,
        description: `Reason: ${reason}${notes ? ` · Note: ${notes}` : ''}`,
        timestamp: new Date().toISOString(),
        actor: session.user.display_name || session.user.email,
        notes,
      },
    ];

    return NextResponse.json(detail);
  }

  // Parameter mapping for admin/incidents (backend query parameter naming)
  if (pathString === 'admin/incidents' && method === 'GET') {
    const backendParams = new URLSearchParams();
    const q = req.nextUrl.searchParams.get('q');
    if (q) backendParams.set('query', q);

    const cursor = req.nextUrl.searchParams.get('cursor');
    if (cursor) backendParams.set('offset', cursor);

    const limit = req.nextUrl.searchParams.get('limit');
    if (limit) backendParams.set('limit', limit);

    const reviewStatus = req.nextUrl.searchParams.get('review_status');
    if (reviewStatus) {
      const firstStatus = reviewStatus.split(',')[0]?.trim();
      if (firstStatus) backendParams.set('review_status', firstStatus);
    }

    const lifecycleStatus = req.nextUrl.searchParams.get('lifecycle_status');
    if (lifecycleStatus) {
      const firstStatus = lifecycleStatus.split(',')[0]?.trim();
      if (firstStatus) backendParams.set('lifecycle_status', firstStatus);
    }

    const categoryId = req.nextUrl.searchParams.get('category_id');
    if (categoryId) {
      const firstCat = categoryId.split(',')[0]?.trim();
      if (firstCat) {
        const resolvedId = SLUG_TO_BACKEND_UUID[firstCat.toLowerCase()] || firstCat;
        backendParams.set('category_id', resolvedId);
      }
    }

    const reporterId = req.nextUrl.searchParams.get('reporter_id');
    if (reporterId) backendParams.set('reporter_id', reporterId);

    const qs = backendParams.toString();
    targetUrl = `${env.API_BASE_URL}/admin/incidents${qs ? `?${qs}` : ''}`;
  }

  // 4. Check if access token is expired or close to expiry (within 30 seconds)
  let updatedSessionToken: string | null = null;
  const isExpiringSoon = session.expiresAt - Date.now() < 30 * 1000;

  if (isExpiringSoon && session.refreshToken) {
    try {
      const refreshed = await refreshSingleFlight(session.refreshToken);
      session = {
        ...session,
        accessToken: refreshed.access_token,
        refreshToken: refreshed.refresh_token,
        expiresAt: Date.now() + (refreshed.expires_in || 900) * 1000,
      };
      updatedSessionToken = await sealSession(session);
    } catch {
      // If refresh fails before request, let request proceed with current token or fail
    }
  }

  // 5. Forward request to backend
  const forwardHeaders = new Headers();
  forwardHeaders.set('Authorization', `Bearer ${session.accessToken}`);
  forwardHeaders.set('Accept', 'application/json');
  forwardHeaders.set('X-Tunnel-Skip-AntiPhishing-Page', 'true');
  forwardHeaders.set('bypass-tunnel-reminder', 'true');

  const contentType = req.headers.get('content-type');
  if (contentType) {
    forwardHeaders.set('Content-Type', contentType);
  }

  let body: BodyInit | null = null;
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const rawBody = await req.arrayBuffer();
    if (rawBody.byteLength > 0) {
      body = rawBody;
    }
  }

  let backendRes: Response;
  try {
    backendRes = await fetch(targetUrl, {
      method,
      headers: forwardHeaders,
      body,
    });
  } catch (fetchErr) {
    console.error(`[BFF Proxy] Backend fetch failed for ${method} ${pathString}:`, fetchErr);
    return NextResponse.json(
      {
        error: {
          code: 'BACKEND_UNAVAILABLE',
          message: 'Unable to reach backend service. Please verify your backend server is running.',
        },
      },
      { status: 503 }
    );
  }

  // 6. If backend returns 401, attempt emergency single-flight refresh and retry once
  if (backendRes.status === 401 && session.refreshToken) {
    try {
      const refreshed = await refreshSingleFlight(session.refreshToken);
      session = {
        ...session,
        accessToken: refreshed.access_token,
        refreshToken: refreshed.refresh_token,
        expiresAt: Date.now() + (refreshed.expires_in || 900) * 1000,
      };
      updatedSessionToken = await sealSession(session);

      forwardHeaders.set('Authorization', `Bearer ${session.accessToken}`);
      backendRes = await fetch(targetUrl, {
        method,
        headers: forwardHeaders,
        body,
      });
    } catch {
      // Refresh failed, session invalid
      const response = NextResponse.json(
        {
          error: {
            code: 'SESSION_EXPIRED',
            message: 'Session has expired. Please sign in again.',
          },
        },
        { status: 401 }
      );
      clearSessionCookie(response);
      return response;
    }
  }

  // 7. Return backend response (adapted if admin/incidents)
  if (pathString === 'admin/incidents' && method === 'GET') {
    if (!backendRes.ok) {
      const responseData = await backendRes.arrayBuffer();
      const response = new NextResponse(responseData, {
        status: backendRes.status,
        statusText: backendRes.statusText,
      });
      const resContentType = backendRes.headers.get('content-type');
      if (resContentType) {
        response.headers.set('content-type', resContentType);
      }
      return response;
    }

    const resContentType = backendRes.headers.get('content-type') || '';
    if (!resContentType.includes('application/json')) {
      const rawText = await backendRes.text();
      const isRedirect =
        backendRes.redirected ||
        rawText.includes('devtunnels.ms') ||
        rawText.includes('visualstudio.com') ||
        rawText.includes('github.com/login');

      console.error(
        `[BFF Proxy] Expected JSON from backend at ${targetUrl}, but received Content-Type "${resContentType}". Redirected: ${backendRes.redirected} (${backendRes.url}). Preview: ${rawText.slice(0, 200)}`
      );

      return NextResponse.json(
        {
          error: {
            code: 'INVALID_BACKEND_RESPONSE',
            message: isRedirect
              ? 'Backend API redirected to an authentication/login page. If using VS Code Dev Tunnels, make sure Port 8000 is set to Public, or point API_BASE_URL to http://127.0.0.1:8000/api/v1 in .env.local.'
              : `Backend returned unexpected non-JSON response (${resContentType || 'HTML'}). Check backend API logs.`,
          },
        },
        { status: 502 }
      );
    }

    try {
      const json = await backendRes.json();
      const adapted = adaptBackendIncidents(json, req.nextUrl.searchParams);
      const response = NextResponse.json(adapted);
      if (updatedSessionToken) {
        setSessionCookie(response, updatedSessionToken);
      }
      return response;
    } catch (parseErr) {
      console.error('[BFF Proxy] Failed to parse backend JSON response:', parseErr);
      return NextResponse.json(
        {
          error: {
            code: 'JSON_PARSE_ERROR',
            message: 'Failed to parse backend response as JSON.',
          },
        },
        { status: 502 }
      );
    }
  }

  const responseData = await backendRes.arrayBuffer();
  const response = new NextResponse(responseData, {
    status: backendRes.status,
    statusText: backendRes.statusText,
  });

  // Forward response content-type
  const resContentType = backendRes.headers.get('content-type');
  if (resContentType) {
    response.headers.set('content-type', resContentType);
  }

  // If session was refreshed during proxy request, update cookie
  if (updatedSessionToken) {
    setSessionCookie(response, updatedSessionToken);
  }

  return response;
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;
