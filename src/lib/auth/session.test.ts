import { describe, it, expect } from 'vitest';
import { sealSession, unsealSession, SessionPayload } from './session';

describe('Auth Session Sealing & Unsealing', () => {
  const samplePayload: SessionPayload = {
    user: {
      id: 'usr_admin_123',
      email: 'admin@inzar.app',
      display_name: 'Sana Rehman',
      role: 'admin',
    },
    accessToken: 'mock_jwt_access_token_abc',
    refreshToken: 'mock_jwt_refresh_token_xyz',
    expiresAt: Date.now() + 15 * 60 * 1000,
  };

  it('seals session payload into encrypted JWE format (5 segments)', async () => {
    const sealed = await sealSession(samplePayload);
    expect(typeof sealed).toBe('string');
    // JWE Compact Serialization has 5 dot-separated parts: header.encrypted_key.iv.ciphertext.tag
    const parts = sealed.split('.');
    expect(parts.length).toBe(5);
    // Ciphertext must not contain plaintext tokens
    expect(sealed).not.toContain('mock_jwt_access_token_abc');
    expect(sealed).not.toContain('mock_jwt_refresh_token_xyz');
  });

  it('unseals a valid encrypted session back to its original payload', async () => {
    const sealed = await sealSession(samplePayload);
    const unsealed = await unsealSession(sealed);

    expect(unsealed).not.toBeNull();
    expect(unsealed?.user.id).toBe(samplePayload.user.id);
    expect(unsealed?.user.email).toBe(samplePayload.user.email);
    expect(unsealed?.user.role).toBe('admin');
    expect(unsealed?.accessToken).toBe(samplePayload.accessToken);
    expect(unsealed?.refreshToken).toBe(samplePayload.refreshToken);
  });

  it('returns null when unsealing an invalid or tampered token', async () => {
    const sealed = await sealSession(samplePayload);
    const tampered = sealed.substring(0, sealed.length - 8) + 'abcdefgh';
    const unsealed = await unsealSession(tampered);

    expect(unsealed).toBeNull();
  });

  it('returns null for arbitrary random strings', async () => {
    const unsealed = await unsealSession('not.a.valid.jwe.token');
    expect(unsealed).toBeNull();
  });
});
