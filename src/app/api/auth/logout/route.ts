import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { getSession, clearSessionCookie } from '@/lib/auth/session';

export async function POST() {
  try {
    const session = await getSession();

    if (session?.accessToken) {
      await fetch(`${env.API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }).catch(() => {});
    }

    const response = NextResponse.json({ success: true });
    clearSessionCookie(response);
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    const response = NextResponse.json({ success: true });
    clearSessionCookie(response);
    return response;
  }
}
