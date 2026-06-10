import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/server/config';
import { getSessionToken } from '@/lib/server/session';

export const dynamic = 'force-dynamic';

async function forward(req: NextRequest, params: { path: string[] }) {
  const token = getSessionToken();
  if (!token) {
    return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 });
  }
  const targetPath = '/' + params.path.join('/');
  const url = new URL(req.url);
  const target = `${config.apiBaseUrl}${targetPath}${url.search}`;

  const headers = new Headers(req.headers);
  headers.delete('host');
  headers.delete('cookie');
  headers.set('Authorization', `Bearer ${token}`);

  const init: RequestInit = {
    method: req.method,
    headers,
    cache: 'no-store',
  };
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    // Pass through the raw body (supports JSON, FormData, binary stream).
    init.body = await req.arrayBuffer();
  }

  const res = await fetch(target, init);

  // For ZIP / binary streams, pass through as-is.
  const ct = res.headers.get('content-type') ?? '';
  if (ct.startsWith('application/zip') || ct.startsWith('application/octet-stream')) {
    return new NextResponse(res.body, {
      status: res.status,
      headers: stripHopByHop(res.headers),
    });
  }

  const buf = await res.arrayBuffer();
  return new NextResponse(buf, {
    status: res.status,
    headers: stripHopByHop(res.headers),
  });
}

function stripHopByHop(h: Headers): Headers {
  const out = new Headers(h);
  ['transfer-encoding', 'connection', 'keep-alive', 'content-encoding'].forEach((k) =>
    out.delete(k),
  );
  return out;
}

export const GET = (req: NextRequest, ctx: { params: { path: string[] } }) => forward(req, ctx.params);
export const POST = (req: NextRequest, ctx: { params: { path: string[] } }) => forward(req, ctx.params);
export const PATCH = (req: NextRequest, ctx: { params: { path: string[] } }) => forward(req, ctx.params);
export const PUT = (req: NextRequest, ctx: { params: { path: string[] } }) => forward(req, ctx.params);
export const DELETE = (req: NextRequest, ctx: { params: { path: string[] } }) => forward(req, ctx.params);
