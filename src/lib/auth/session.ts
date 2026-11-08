import { EncryptJWT, jwtDecrypt } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

export interface SessionUser {
  id: string;
  email: string;
  display_name: string;
  role: 'admin' | 'moderator' | 'user';
}

export interface SessionPayload {
  user: SessionUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // timestamp in ms
}

export const SESSION_COOKIE_NAME = 'inzar_admin_session';

// Derive CryptoKey for AES-256-GCM via standard Web Crypto API (realm-agnostic)
async function getCryptoKey(): Promise<CryptoKey> {
  const secret = env.SESSION_SECRET;
  const encoder = new TextEncoder();
  const secretBytes = encoder.encode(secret);
  const keyBytes = new Uint8Array(32);
  if (secretBytes.length >= 32) {
    keyBytes.set(secretBytes.slice(0, 32));
  } else {
    keyBytes.set(secretBytes);
  }

  return crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Seals session payload into an encrypted JWE (AES-256-GCM)
 */
export async function sealSession(payload: SessionPayload): Promise<string> {
  const key = await getCryptoKey();
  return new EncryptJWT({ ...payload })
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .encrypt(key);
}

/**
 * Decrypts and verifies the encrypted JWE session token
 */
export async function unsealSession(token: string): Promise<SessionPayload | null> {
  try {
    const key = await getCryptoKey();
    const { payload } = await jwtDecrypt(token, key);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Read session in Server Components or Route Handlers
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (!sessionCookie?.value) {
    return null;
  }
  return unsealSession(sessionCookie.value);
}

/**
 * Write session cookie to a NextResponse
 */
export function setSessionCookie(
  response: NextResponse,
  encryptedToken: string
): void {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: encryptedToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

/**
 * Delete session cookie
 */
export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
