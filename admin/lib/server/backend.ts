import { config } from './config';
import { getSessionToken } from './session';

export type BackendRequestInit = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

/**
 * Server-only fetch to the backend. Attaches the JWT cookie value as a Bearer
 * token, JSON-encodes the body, and throws a structured error on non-2xx.
 */
export async function backendFetch<T = unknown>(
  path: string,
  init: BackendRequestInit = {},
): Promise<T> {
  const token = getSessionToken();
  const headers = new Headers(init.headers);
  if (!headers.has('Accept')) headers.set('Accept', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let bodyToSend: BodyInit | undefined;
  if (init.body !== undefined) {
    if (typeof init.body === 'object' && !(init.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
      bodyToSend = JSON.stringify(init.body);
    } else {
      bodyToSend = init.body as BodyInit;
    }
  }

  const url = `${config.apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...init,
    headers,
    body: bodyToSend,
    cache: 'no-store',
  });

  const text = await res.text();
  const data = text ? safeJson(text) : undefined;

  if (!res.ok) {
    const err = new BackendError(
      res.status,
      (data as { error?: { message?: string } })?.error?.message ?? res.statusText,
      data,
    );
    throw err;
  }
  return data as T;
}

export class BackendError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

function safeJson(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}
