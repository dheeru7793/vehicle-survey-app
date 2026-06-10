import { cookies } from 'next/headers';
import { config } from './config';

export function getSessionToken(): string | undefined {
  return cookies().get(config.cookieName)?.value;
}

export function setSessionCookie(token: string) {
  cookies().set({
    name: config.cookieName,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: config.cookieMaxAge,
  });
}

export function clearSessionCookie() {
  cookies().set({
    name: config.cookieName,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
