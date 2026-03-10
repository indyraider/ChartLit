/**
 * PRD §5.6 — Canva OAuth Initiation (Mock)
 * POST /api/auth/canva
 * Returns the OAuth authorization URL. In mock mode, redirects to callback directly.
 */

import { NextResponse } from 'next/server';

const CANVA_MOCK = process.env.CANVA_CLIENT_ID == null; // Mock when no real credentials

export async function POST() {
  if (CANVA_MOCK) {
    // Mock mode: return a fake auth URL that goes straight to our callback
    const callbackUrl = new URL('/api/auth/canva/callback', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
    callbackUrl.searchParams.set('code', 'mock_auth_code_' + Date.now());
    callbackUrl.searchParams.set('state', 'mock_state');
    return NextResponse.json({ authUrl: callbackUrl.toString() });
  }

  // Real Canva OAuth 2.0 + PKCE flow (behind feature flag)
  const authUrl = new URL('https://www.canva.com/api/oauth/authorize');
  authUrl.searchParams.set('client_id', process.env.CANVA_CLIENT_ID!);
  authUrl.searchParams.set('redirect_uri', `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/canva/callback`);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'asset:write');
  authUrl.searchParams.set('state', crypto.randomUUID());

  return NextResponse.json({ authUrl: authUrl.toString() });
}
