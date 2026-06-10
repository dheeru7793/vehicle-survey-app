import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { backendFetch, BackendError } from '@/lib/server/backend';
import { getSessionToken } from '@/lib/server/session';
import { Shell } from '@/components/Shell';

export const dynamic = 'force-dynamic';

type Me = { user: { _id: string; employeeId: string; name: string; role: string } };

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  if (!getSessionToken()) redirect('/login');

  let me: Me;
  try {
    me = await backendFetch<Me>('/auth/me');
  } catch (e) {
    if ((e as BackendError).status === 401) redirect('/login');
    throw e;
  }

  if (me.user.role !== 'ADMIN') redirect('/login');

  return <Shell user={me.user}>{children}</Shell>;
}
