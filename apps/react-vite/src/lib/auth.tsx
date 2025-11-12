import { configureAuth } from 'react-query-auth';
import { Navigate, useLocation } from 'react-router';
import { z } from 'zod';

import { paths } from '@/config/paths';
import { LoginResponse, User } from '@/types/api';

import { api } from './api-client';
import { tokenStorage } from './token-storage';

// api call definitions for auth (types, schemas, requests):
// these are not part of features as this is a module shared across features

const getUser = async (): Promise<User | null> => {
  // If no token exists, return null instead of throwing an error
  // This allows the app to render without authentication
  if (!tokenStorage.hasToken()) {
    return null;
  }

  try {
    // The api client will automatically attach the Authorization header
    // and unwrap the Result<User> response
    const user: User = await api.get('/auth/me');
    return user;
  } catch (error) {
    // If the token is invalid or expired, clear it and return null
    console.error('Failed to fetch user:', error);
    tokenStorage.clearTokens();
    return null;
  }
};

const logout = async (): Promise<void> => {
  try {
    // Call backend logout endpoint (optional, if it exists)
    await api.post('/auth/logout');
  } catch (error) {
    // If logout endpoint fails, still clear local tokens
    console.error('Logout API call failed:', error);
  } finally {
    // Always clear tokens from localStorage
    tokenStorage.clearTokens();
  }
};

export const loginInputSchema = z.object({
  email: z.string().min(1, 'Required').email('Invalid email'),
  password: z.string().min(5, 'Required'),
});

export type LoginInput = z.infer<typeof loginInputSchema>;

const loginWithEmailAndPassword = async (
  data: LoginInput,
): Promise<LoginResponse> => {
  // Add rememberMe: true as per requirements
  const response: LoginResponse = await api.post('/auth/login', {
    ...data,
    rememberMe: true,
  });

  // Store tokens in localStorage
  tokenStorage.setTokens(
    response.accessToken,
    response.refreshToken,
    response.expiresAt,
  );

  return response;
};

export const registerInputSchema = z
  .object({
    email: z.string().min(1, 'Required'),
    firstName: z.string().min(1, 'Required'),
    lastName: z.string().min(1, 'Required'),
    password: z.string().min(5, 'Required'),
  })
  .and(
    z
      .object({
        teamId: z.string().min(1, 'Required'),
        teamName: z.null().default(null),
      })
      .or(
        z.object({
          teamName: z.string().min(1, 'Required'),
          teamId: z.null().default(null),
        }),
      ),
  );

export type RegisterInput = z.infer<typeof registerInputSchema>;

const registerWithEmailAndPassword = async (
  data: RegisterInput,
): Promise<LoginResponse> => {
  // Registration also returns tokens and user
  const response: LoginResponse = await api.post('/auth/register', data);

  // Store tokens in localStorage
  tokenStorage.setTokens(
    response.accessToken,
    response.refreshToken,
    response.expiresAt,
  );

  return response;
};

const authConfig = {
  userFn: getUser,
  loginFn: async (data: LoginInput) => {
    const response = await loginWithEmailAndPassword(data);
    return response.user;
  },
  registerFn: async (data: RegisterInput) => {
    const response = await registerWithEmailAndPassword(data);
    return response.user;
  },
  logoutFn: logout,
};

export const { useUser, useLogin, useLogout, useRegister, AuthLoader } =
  configureAuth(authConfig);

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useUser();
  const location = useLocation();

  if (!user.data) {
    return (
      <Navigate to={paths.auth.login.getHref(location.pathname)} replace />
    );
  }

  return children;
};