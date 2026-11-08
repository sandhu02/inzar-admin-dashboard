import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import {
  getSession,
  sealSession,
  setSessionCookie,
  clearSessionCookie,
} from '@/lib/auth/session';
import { refreshSingleFlight } from '@/lib/auth/refresh';
import { queryMockIncidents } from '@/mocks/handlers';

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

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
    : Array.isArray(backendData?.data)
      ? backendData.data
      : Array.isArray(backendData?.items)
        ? backendData.items
        : [];

  const offset = parseInt(searchParams.get('cursor') || '0', 10) || 0;
  const limit = parseInt(searchParams.get('limit') || '25', 10) || 25;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items = rawList.map((item: any) => {
    const catSlug = item.category_slug || 'other';
    const style = CATEGORY_STYLE_LOOKUP[catSlug] || {
      color_hex: '#6B7280',
      icon_key: 'help-circle',
    };

    return {
      id: String(item.id),
      title: item.title,
      description: item.description || '',
      category: {
        id: String(item.category_id || ''),
        slug: catSlug,
        name: item.category_name || 'General',
        color_hex: item.color_hex || style.color_hex,
        icon_key: item.icon_key || style.icon_key,
      },
      review_status: item.review_status,
      lifecycle_status: item.lifecycle_status,
      place_label: item.place_label || 'Reported Location',
      fuzzed_location: {
        lat: typeof item.public_lat === 'number' ? item.public_lat : 0,
        lng: typeof item.public_lon === 'number' ? item.public_lon : 0,
      },
      reported_at: item.reported_at,
      has_media: Array.isArray(item.media_urls) && item.media_urls.length > 0,
      thumbnail_url:
        Array.isArray(item.media_urls) && item.media_urls.length > 0
          ? item.media_urls[0]
          : null,
      flags_count: item.flags_count ?? 0,
    };
  });

  return {
    items,
    next_cursor: items.length >= limit ? String(offset + limit) : null,
    prev_cursor: offset > 0 ? String(Math.max(0, offset - limit)) : null,
    total_count: items.length,
  };
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

  // 3. Check if access token is expired or close to expiry (within 30 seconds)
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

  // 4. Forward request to backend
  const forwardHeaders = new Headers();
  forwardHeaders.set('Authorization', `Bearer ${session.accessToken}`);

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
    // Graceful fallback for documented gaps when backend is unreachable
    if (pathString === 'admin/incidents' && method === 'GET') {
      console.warn(
        '[BFF Proxy] Backend fetch failed for GET /admin/incidents. Serving mock fallback.',
        fetchErr
      );
      return NextResponse.json(queryMockIncidents(req.nextUrl.searchParams));
    }
    throw fetchErr;
  }

  // Fallback for documented backend contract gaps
  // When FastAPI returns 404 for GET /api/v1/admin/incidents (documented in docs/backend-gaps.md)
  if (pathString === 'admin/incidents' && method === 'GET' && backendRes.status === 404) {
    console.warn(
      '[BFF Proxy] Backend returned 404 for GET /api/v1/admin/incidents (known gap). Serving mock dataset fallback.'
    );
    return NextResponse.json(queryMockIncidents(req.nextUrl.searchParams));
  }

  // 5. If backend returns 401, attempt emergency single-flight refresh and retry once
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

      if (pathString === 'admin/incidents' && method === 'GET' && backendRes.status === 404) {
        return NextResponse.json(queryMockIncidents(req.nextUrl.searchParams));
      }
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

  // 6. Return backend response (adapted if admin/incidents)
  if (backendRes.ok && pathString === 'admin/incidents' && method === 'GET') {
    const json = await backendRes.json();
    const adapted = adaptBackendIncidents(json, req.nextUrl.searchParams);
    const response = NextResponse.json(adapted);
    if (updatedSessionToken) {
      setSessionCookie(response, updatedSessionToken);
    }
    return response;
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
