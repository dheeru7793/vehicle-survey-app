import { NextResponse } from 'next/server';
import { backendFetch, BackendError } from '@/lib/server/backend';
import { setSessionCookie } from '@/lib/server/session';

type LoginResponse = { token: string; user: { role: string; name: string; employeeId: string } };

export async function POST(req: Request) {
  let body: { employeeId?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: { message: 'Invalid body' } }, { status: 400 });
  }

  if (!body.employeeId || !body.password) {
    return NextResponse.json(
      { error: { message: 'employeeId and password required' } },
      { status: 400 },
    );
  }

  try {
    const data = await backendFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body,
    });
    if (data.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: { message: 'This portal is for admin users only.' } },
        { status: 403 },
      );
    }
    setSessionCookie(data.token);
    return NextResponse.json({ user: data.user });
  } catch (e) {
    const err = e as BackendError;
    return NextResponse.json(
      { error: { message: err.message } },
      { status: err.status || 500 },
    );
  }
}
