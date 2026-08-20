import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 90000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Token management — set by AuthContext
let getAccessTokenFn = () => null;
let refreshSessionFn = () => Promise.resolve(null);

export const setTokenHandlers = (getToken, refreshSession) => {
  getAccessTokenFn = getToken;
  refreshSessionFn = refreshSession;
};

// Request interceptor — attach access token
api.interceptors.request.use(
  (config) => {
    const token = getAccessTokenFn();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 and auto-refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried and not a refresh/login/register request
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/register')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshSessionFn();
        if (newToken) {
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
        processQueue(new Error('Refresh failed'));
      } catch (refreshError) {
        processQueue(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Normalize error
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';

    const normalizedError = {
      message,
      status: error.response?.status || 0,
      data: error.response?.data || null,
    };

    return Promise.reject(normalizedError);
  }
);

export const healthService = {
  check: () => api.get('/health').then((res) => res.data),
};

export default api;
