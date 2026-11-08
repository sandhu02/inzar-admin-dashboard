import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { env } from '@/lib/env';
import { sealSession, setSessionCookie, SessionPayload } from '@/lib/auth/session';
import { isStaff } from '@/lib/permissions';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: result.error.issues[0]?.message || 'Invalid input data',
          },
        },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // Call backend API (or MSW)
    const backendRes = await fetch(`${env.API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(
        {
          error: {
            code: data?.error?.code || 'AUTH_FAILED',
            message: data?.error?.message || 'Authentication failed. Please verify your credentials.',
          },
        },
        { status: backendRes.status }
      );
    }

    // Role check: Reject plain users (moderator and admin only)
    const user = data.user;
    if (!isStaff(user?.role)) {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN_ROLE',
            message: 'Access restricted to staff accounts only. Public user accounts cannot access this dashboard.',
          },
        },
        { status: 403 }
      );
    }

    // Seal session into encrypted cookie
    const expiresAt = Date.now() + (data.expires_in || 900) * 1000;
    const sessionPayload: SessionPayload = {
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        role: user.role,
      },
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt,
    };

    const sealed = await sealSession(sessionPayload);

    const response = NextResponse.json({
      success: true,
      user: sessionPayload.user,
    });

    setSessionCookie(response, sealed);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected authentication error occurred.',
        },
      },
      { status: 500 }
    );
  }
}
