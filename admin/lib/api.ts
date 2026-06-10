import axios from 'axios';

/**
 * Client-side Axios instance. All requests hit our own /api/proxy/* route,
 * which forwards to the backend with the httpOnly JWT cookie attached
 * server-side.  This keeps the token out of the browser.
 */
export const api = axios.create({
  baseURL: '/api/proxy',
  headers: { 'Accept': 'application/json' },
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401 && typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);
