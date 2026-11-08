import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { unsealSession, SESSION_COOKIE_NAME } from '@/lib/auth/session';
import { canAccessPath, isStaff } from '@/lib/permissions';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read session cookie
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = sessionCookie ? await unsealSession(sessionCookie) : null;
  const isAuthenticated = !!(session && isStaff(session.user?.role));

  // 1. If visiting login page
  if (pathname === '/login') {
    if (isAuthenticated) {
      // Already logged in, redirect to dashboard
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // 2. Public / system routes bypass
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/gallery') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    pathname === '/403' ||
    pathname === '/404' ||
    pathname === '/500'
  ) {
    return NextResponse.next();
  }

  // 3. Unauthenticated access to dashboard routes
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('returnUrl', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 4. Role gating for staff
  const userRole = session?.user?.role;
  if (!canAccessPath(pathname, userRole)) {
    // Moderator attempting to access admin route
    return NextResponse.rewrite(new URL('/403', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
