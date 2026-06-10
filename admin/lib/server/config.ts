export const config = {
  apiBaseUrl: process.env.API_BASE_URL ?? 'http://localhost:4000/api/v1',
  cookieName: 'vs_admin_token',
  cookieMaxAge: parseInt(process.env.SESSION_COOKIE_MAX_AGE ?? '604800', 10),
};
