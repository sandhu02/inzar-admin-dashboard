import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

export async function GET() {
  try {
    const session = await getSession();

    if (!session || !session.user) {
      return NextResponse.json({ user: null });
    }

    // Only return safe user metadata, never backend tokens
    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        display_name: session.user.display_name,
        role: session.user.role,
      },
    });
  } catch (error) {
    console.error('Session retrieval error:', error);
    return NextResponse.json({ user: null });
  }
}
