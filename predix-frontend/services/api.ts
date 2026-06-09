import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

/* ── Request interceptor: adjunta el token ─────────────── */
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('predix_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

/* ── Response interceptor: auto-refresh en 401 ─────────── */
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      const refreshToken =
        typeof window !== 'undefined'
          ? localStorage.getItem('predix_refresh_token')
          : null;

      if (!refreshToken) {
        isRefreshing = false;
        clearAuth();
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, {
          refresh_token: refreshToken,
        });
        setTokens(data.access_token, data.refresh_token);
        processQueue(null, data.access_token);
        original.headers.Authorization = `Bearer ${data.access_token}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuth();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('predix_token', accessToken);
  localStorage.setItem('predix_refresh_token', refreshToken);
  // Cookie para el middleware de Next.js
  document.cookie = `predix_token=${accessToken}; path=/; max-age=${7 * 24 * 3600}; SameSite=Strict`;
}

export function clearAuth() {
  localStorage.removeItem('predix_token');
  localStorage.removeItem('predix_refresh_token');
  document.cookie = 'predix_token=; path=/; max-age=0';
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

export default api;
