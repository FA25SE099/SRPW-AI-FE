import Axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';

import { useNotifications } from '@/components/ui/notifications';
import { env } from '@/config/env';
import { paths } from '@/config/paths';
import { tokenStorage } from './token-storage';
import { Result, TokenData } from '@/types/api';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

function authRequestInterceptor(config: InternalAxiosRequestConfig) {
  if (config.headers) {
    config.headers.Accept = 'application/json';
  }

  // Attach access token to requests if available
  const accessToken = tokenStorage.getAccessToken();
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  config.withCredentials = true;
  return config;
}

export const api = Axios.create({
  baseURL: env.API_URL,
});

api.interceptors.request.use(authRequestInterceptor);
api.interceptors.response.use(
  (response) => {
    // Handle Result<T> wrapper from backend
    const data = response.data;

    // If response has a 'succeeded' property, it's a Result<T> wrapper
    if (data && typeof data.succeeded === 'boolean') {
      if (!data.succeeded) {
        // Backend returned an error wrapped in Result<T>
        const error = new Error(data.message || 'Request failed') as Error & {
          errors?: string[];
        };
        error.errors = data.errors;

        // Show notification for errors
        const errorMessage = data.errors?.join(', ') || data.message || 'Request failed';
        useNotifications.getState().addNotification({
          type: 'error',
          title: 'Error',
          message: errorMessage,
        });

        return Promise.reject(error);
      }

      // Check if this is a PagedResult (has pagination fields)
      // PagedResult extends Result but includes pagination metadata
      if (
        'currentPage' in data &&
        'totalPages' in data &&
        'totalCount' in data
      ) {
        // Return the full PagedResult, don't unwrap
        return data;
      }

      // If response has pagination info (totalCount, currentPage, etc), return full response
      if (data.totalCount !== undefined || data.currentPage !== undefined) {
        return data;
      }

      // Return the unwrapped data for successful results
      return data.data;
    }

    // For responses without Result<T> wrapper, return as-is
    return data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Don't retry for login/refresh endpoints
      if (
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/refresh')
      ) {
        const message = (error.response?.data as any)?.message || error.message;
        useNotifications.getState().addNotification({
          type: 'error',
          title: 'Authentication Error',
          message,
        });
        return Promise.reject(error);
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenStorage.getRefreshToken();

      if (!refreshToken) {
        // No refresh token available, redirect to login
        isRefreshing = false;
        tokenStorage.clearTokens();
        const redirectTo = window.location.pathname;
        window.location.href = paths.auth.login.getHref(redirectTo);
        return Promise.reject(error);
      }

      try {
        // Try to refresh the token
        const response = await Axios.post<Result<TokenData>>(
          `${env.API_URL}/auth/refresh`,
          { refreshToken },
          { headers: { Accept: 'application/json' } },
        );

        const result = response.data;

        if (result.succeeded && result.data) {
          const { accessToken, refreshToken: newRefreshToken, expiresAt } = result.data;

          // Store new tokens
          tokenStorage.setTokens(accessToken, newRefreshToken, expiresAt);

          // Update the Authorization header for the original request
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }

          processQueue(null, accessToken);
          isRefreshing = false;

          // Retry the original request
          return api(originalRequest);
        } else {
          throw new Error('Token refresh failed');
        }
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        isRefreshing = false;
        tokenStorage.clearTokens();

        const redirectTo = window.location.pathname;
        window.location.href = paths.auth.login.getHref(redirectTo);

        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const responseData = error.response?.data as any;

    // Check for errors array first (validation errors), then message, then fallback
    let message: string;
    if (responseData?.errors && Array.isArray(responseData.errors) && responseData.errors.length > 0) {
      // Join all validation errors with line breaks for better readability
      message = responseData.errors.join('\n');
    } else {
      message = responseData?.message || error.message;
    }

    useNotifications.getState().addNotification({
      type: 'error',
      title: 'Error',
      message,
    });

    return Promise.reject(error); return Promise.reject(error);
  },
);
