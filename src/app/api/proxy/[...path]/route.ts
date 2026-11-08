import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import {
  getSession,
  sealSession,
  setSessionCookie,
  clearSessionCookie,
} from '@/lib/auth/session';
import { refreshSingleFlight } from '@/lib/auth/refresh';

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function handleProxy(req: NextRequest, { params }: RouteContext) {
  const { path } = await params;
  const pathString = path.join('/');
  const search = req.nextUrl.search;
  const targetUrl = `${env.API_BASE_URL}/${pathString}${search}`;

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

  let backendRes = await fetch(targetUrl, {
    method,
    headers: forwardHeaders,
    body,
  });

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

  // 6. Return backend response
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
