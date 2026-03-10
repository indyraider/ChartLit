/**
 * PRD §5.6 — Canva OAuth Callback (Mock)
 * GET /api/auth/canva/callback
 * Exchanges auth code for access token. In mock mode, returns a fake token.
 */

import { NextRequest, NextResponse } from 'next/server';

const CANVA_MOCK = process.env.CANVA_CLIENT_ID == null;

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');

  if (!code) {
    // Redirect back to app with error
    return NextResponse.redirect(new URL('/?canva_error=no_code', request.url));
  }

  if (CANVA_MOCK) {
    // Mock mode: return a fake token via redirect with token in fragment
    const redirectUrl = new URL('/', request.url);
    redirectUrl.searchParams.set('canva_connected', 'true');
    redirectUrl.searchParams.set('canva_token', 'mock_token_' + Date.now());
    return NextResponse.redirect(redirectUrl);
  }

  // Real token exchange (behind feature flag)
  try {
    const tokenRes = await fetch('https://api.canva.com/rest/v1/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: process.env.CANVA_CLIENT_ID!,
        client_secret: process.env.CANVA_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/canva/callback`,
      }),
    });

    if (!tokenRes.ok) {
      return NextResponse.redirect(new URL('/?canva_error=token_exchange_failed', request.url));
    }

    const tokenData = await tokenRes.json();
    const redirectUrl = new URL('/', request.url);
    redirectUrl.searchParams.set('canva_connected', 'true');
    // In production, store token server-side in session/DB, not in URL
    return NextResponse.redirect(redirectUrl);
  } catch {
    return NextResponse.redirect(new URL('/?canva_error=token_exchange_failed', request.url));
  }
}
