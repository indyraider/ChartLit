/**
 * PRD §7.4 — Admin Authentication (Mock)
 * Simple token-based authentication for admin routes.
 * Production would use JWT or session-based auth with role verification.
 */

import { NextRequest, NextResponse } from 'next/server';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'dev-admin-token';

/**
 * Verify admin authorization from request headers.
 * Returns null if authorized, or a NextResponse error if not.
 */
export function verifyAdmin(request: NextRequest): NextResponse | null {
  const authHeader = request.headers.get('authorization');

  // In development, allow requests without auth for easier testing
  if (process.env.NODE_ENV === 'development' && !authHeader) {
    return null;
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized: missing token' }, { status: 401 });
  }

  const token = authHeader.slice(7);
  if (token !== ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized: invalid token' }, { status: 401 });
  }

  return null;
}
