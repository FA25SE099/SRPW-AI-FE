import Cookies from 'js-cookie';
import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';

import { db, persistDb } from '../db';
import {
  authenticate,
  hash,
  requireAuth,
  AUTH_COOKIE,
  networkDelay,
} from '../utils';

type RegisterBody = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  teamId?: string;
  teamName?: string;
};

type LoginBody = {
  email: string;
  password: string;
};

type ChangePasswordBody = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type ForgotPasswordBody = {
  email?: string;
  phoneNumber?: string;
};

export const authHandlers = [
  http.post(`${env.API_URL}/auth/register`, async ({ request }) => {
    await networkDelay();
    try {
      const userObject = (await request.json()) as RegisterBody;

      const existingUser = db.user.findFirst({
        where: {
          email: {
            equals: userObject.email,
          },
        },
      });

      if (existingUser) {
        return HttpResponse.json(
          { message: 'The user already exists' },
          { status: 400 },
        );
      }

      let teamId;
      let role;

      if (!userObject.teamId) {
        const team = db.team.create({
          name: userObject.teamName ?? `${userObject.firstName} Team`,
        });
        await persistDb('team');
        teamId = team.id;
        role = 'ADMIN';
      } else {
        const existingTeam = db.team.findFirst({
          where: {
            id: {
              equals: userObject.teamId,
            },
          },
        });

        if (!existingTeam) {
          return HttpResponse.json(
            {
              message: 'The team you are trying to join does not exist!',
            },
            { status: 400 },
          );
        }
        teamId = userObject.teamId;
        role = 'USER';
      }

      db.user.create({
        ...userObject,
        role,
        password: hash(userObject.password),
        teamId,
      });

      await persistDb('user');

      const result = authenticate({
        email: userObject.email,
        password: userObject.password,
      });

      // todo: remove once tests in Github Actions are fixed
      Cookies.set(AUTH_COOKIE, result.jwt, { path: '/' });

      return HttpResponse.json(result, {
        headers: {
          // with a real API servier, the token cookie should also be Secure and HttpOnly
          'Set-Cookie': `${AUTH_COOKIE}=${result.jwt}; Path=/;`,
        },
      });
    } catch (error: any) {
      return HttpResponse.json(
        { message: error?.message || 'Server Error' },
        { status: 500 },
      );
    }
  }),

  http.post(`${env.API_URL}/auth/login`, async ({ request }) => {
    await networkDelay();

    try {
      const credentials = (await request.json()) as LoginBody;
      const result = authenticate(credentials);

      // todo: remove once tests in Github Actions are fixed
      Cookies.set(AUTH_COOKIE, result.jwt, { path: '/' });

      return HttpResponse.json(result, {
        headers: {
          // with a real API servier, the token cookie should also be Secure and HttpOnly
          'Set-Cookie': `${AUTH_COOKIE}=${result.jwt}; Path=/;`,
        },
      });
    } catch (error: any) {
      return HttpResponse.json(
        { message: error?.message || 'Server Error' },
        { status: 500 },
      );
    }
  }),

  http.post(`${env.API_URL}/auth/logout`, async () => {
    await networkDelay();

    // todo: remove once tests in Github Actions are fixed
    Cookies.remove(AUTH_COOKIE);

    return HttpResponse.json(
      { message: 'Logged out' },
      {
        headers: {
          'Set-Cookie': `${AUTH_COOKIE}=; Path=/;`,
        },
      },
    );
  }),

  http.get(`${env.API_URL}/auth/me`, async ({ cookies }) => {
    await networkDelay();

    try {
      const { user } = requireAuth(cookies);
      return HttpResponse.json({ data: user });
    } catch (error: any) {
      return HttpResponse.json(
        { message: error?.message || 'Server Error' },
        { status: 500 },
      );
    }
  }),

  http.post(`${env.API_URL}/auth/change-password`, async ({ request, cookies }) => {
    await networkDelay();

    try {
      const { user, error } = requireAuth(cookies);

      if (error || !user) {
        return HttpResponse.json(
          { message: 'Unauthorized' },
          { status: 401 },
        );
      }

      const body = (await request.json()) as ChangePasswordBody;

      // Validate passwords match
      if (body.newPassword !== body.confirmPassword) {
        return HttpResponse.json(
          { message: "Passwords don't match" },
          { status: 400 },
        );
      }

      // Find the user in the database
      const dbUser = db.user.findFirst({
        where: {
          id: {
            equals: user.id,
          },
        },
      });

      if (!dbUser) {
        return HttpResponse.json(
          { message: 'User not found' },
          { status: 404 },
        );
      }

      // Verify current password
      const hashedCurrentPassword = hash(body.currentPassword);
      if (dbUser.password !== hashedCurrentPassword) {
        return HttpResponse.json(
          { message: 'Current password is incorrect' },
          { status: 400 },
        );
      }

      // Update password in database
      db.user.update({
        where: {
          id: {
            equals: user.id,
          },
        },
        data: {
          password: hash(body.newPassword),
        },
      });

      await persistDb('user');

      return HttpResponse.json({
        message: 'Password changed successfully',
      });
    } catch (error: any) {
      return HttpResponse.json(
        { message: error?.message || 'Server Error' },
        { status: 500 },
      );
    }
  }),

  http.post(`${env.API_URL}/auth/forgot-password`, async ({ request }) => {
    await networkDelay();

    try {
      const body = (await request.json()) as ForgotPasswordBody;

      // Validate email is provided
      if (!body.email) {
        return HttpResponse.json(
          { message: 'Email không được để trống' },
          { status: 400 },
        );
      }

      // Find user by email
      const user = db.user.findFirst({
        where: {
          email: {
            equals: body.email,
          },
        },
      });

      // Check if user exists
      if (!user) {
        return HttpResponse.json(
          { message: 'Email không tồn tại trong hệ thống' },
          { status: 400 },
        );
      }

      // Success - send password reset email
      return HttpResponse.json({
        message: 'Mật khẩu mới đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư và đổi mật khẩu sau khi đăng nhập',
      });
    } catch (error: any) {
      return HttpResponse.json(
        { message: error?.message || 'Server Error' },
        { status: 500 },
      );
    }
  }),
];
