import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/server/backend';
import { clearSessionCookie } from '@/lib/server/session';

export async function POST() {
  try {
    await backendFetch('/auth/logout', { method: 'POST' });
  } catch {
    // best-effort
  }
  clearSessionCookie();
  return NextResponse.json({ ok: true });
}
