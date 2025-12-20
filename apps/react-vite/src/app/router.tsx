import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { paths } from '@/config/paths';
import { ProtectedRoute } from '@/lib/auth';

import {
  default as AppRoot,
  ErrorBoundary as AppRootErrorBoundary,
} from './routes/app/root';
import { queryByRole } from '@testing-library/react';

const convert = (queryClient: QueryClient) => (m: any) => {
  const { clientLoader, clientAction, default: Component, ...rest } = m;
  return {
    ...rest,
    loader: clientLoader?.(queryClient),
    action: clientAction?.(queryClient),
    Component,
  };
};

export const createAppRouter = (queryClient: QueryClient) =>
  createBrowserRouter([
    {
      path: paths.home.path,
      // lazy: () => import('./routes/landing').then(convert(queryClient)),
      lazy: () => import('./routes/auth/login').then(convert(queryClient)),
    },
    {
      path: paths.auth.register.path,
      lazy: () => import('./routes/auth/register').then(convert(queryClient)),
    },
    {
      path: paths.auth.login.path,
      lazy: () => import('./routes/auth/login').then(convert(queryClient)),
    },
    {
      path: paths.unauthorized.path,
      lazy: () => import('./routes/unauthorized').then(convert(queryClient)),
    },
    {
      path: paths.app.root.path,
      element: (
        <ProtectedRoute>
          <AppRoot />
        </ProtectedRoute>
      ),
      ErrorBoundary: AppRootErrorBoundary,
      children: [
        {
          path: paths.app.discussions.path,
          lazy: () =>
            import('./routes/app/discussions/discussions').then(
              convert(queryClient),
            ),
        },
        {
          // path: paths.app.discussion.path,
          // lazy: () =>
          //   import('./routes/app/discussions/discussion').then(
          //     convert(queryClient),
          //   ),
        },
        {
          path: paths.app.users.path,
          lazy: () => import('./routes/app/users').then(convert(queryClient)),
        },
        {
          path: paths.app.profile.path,
          lazy: () => import('./routes/app/profile').then(convert(queryClient)),
        },
        {
          path: paths.app.dashboard.path,
          lazy: () =>
            import('./routes/app/dashboard').then(convert(queryClient)),
        },
        {
          path: 'expert',
          children: [
            {
              index: true,
              lazy: () =>
                import('./routes/app/expert/dashboard').then(convert(queryClient)),
            },
            {
              path: 'approvals',
              lazy: () =>
                import('./routes/app/expert/approvals').then(convert(queryClient)),
            },
            {
              path: 'emergency',
              lazy: () =>
                import('./routes/app/expert/emergency').then(convert(queryClient)),
            },
            {
              path: 'standards',
              lazy: () =>
                import('./routes/app/expert/standards').then(convert(queryClient)),
            },
            {
              path: 'materials',
              lazy: () =>
                import('./routes/app/expert/materials').then(convert(queryClient)),
            },
            {
              path: 'rice-varieties',
              lazy: () =>
                import('./routes/app/expert/rice-varieties').then(convert(queryClient)),
            },
            {
              path: 'standard-plans',
              lazy: () =>
                import('./routes/app/expert/standard-plans').then(convert(queryClient)),
            },
            {
              path: 'emergency-protocols',
              lazy: () =>
                import('./routes/app/expert/emergency-protocols').then(convert(queryClient)),
            },
            {
              path: 'plan-monitoring',
              lazy: () =>
                import('./routes/app/expert/plan-monitoring').then(convert(queryClient)),
            },
            {
              path: 'reports',
              lazy: () =>
                import('./routes/app/expert/reports').then(convert(queryClient)),
            },
            {
              path: 'late-management',
              lazy: () =>
                import('./routes/app/expert/late-management').then(convert(queryClient)),
            },
          ],
        },
        {
          path: 'admin',
          children: [
            {
              index: true,
              lazy: () =>
                import('./routes/app/admin/dashboard').then(convert(queryClient)),
            },
            {
              path: 'users',
              lazy: () =>
                import('./routes/app/admin/users').then(convert(queryClient)),
            },
            {
              path: 'roles',
              lazy: () =>
                import('./routes/app/admin/roles').then(convert(queryClient)),
            },
            {
              path: 'settings',
              lazy: () =>
                import('./routes/app/admin/settings').then(convert(queryClient)),
            },
            {
              path: 'reports',
              lazy: () =>
                import('./routes/app/admin/reports').then(convert(queryClient)),
            },
            {
              path: 'clusters',
              lazy: () =>
                import('./routes/app/admin/clusters').then(convert(queryClient)),
            },
          ],
        },
        {
          path: 'supervisor',
          children: [
            {
              index: true,
              lazy: () =>
                import('./routes/app/supervisor/dashboard').then(convert(queryClient)),
            },
            {
              path: 'group',
              lazy: () =>
                import('./routes/app/supervisor/group').then(convert(queryClient)),
            },
            {
              path: 'plan-details',
              lazy: () =>
                import('./routes/app/supervisor/plan-details').then(convert(queryClient)),
            },
            {
              path: 'plan-execution/:planId',
              lazy: () =>
                import('./routes/app/supervisor/plan-execution').then(convert(queryClient)),
            },
            {
              path: 'plans',
              lazy: () =>
                import('./routes/app/supervisor/plans').then(convert(queryClient)),
            },
            {
              path: 'reports',
              lazy: () =>
                import('./routes/app/supervisor/reports').then(convert(queryClient)),
            },
            {
              path: 'maps',
              lazy: () =>
                import('./routes/app/supervisor/maps').then(convert(queryClient))
            },
            {
              path: 'late-management',
              lazy: () =>
                import('./routes/app/supervisor/late-management').then(convert(queryClient)),
            },
            {
              path: 'farmers',
              lazy: () =>
                import('./routes/app/supervisor/farmers').then(convert(queryClient)),
            },
          ],
        },
        {
          path: 'cluster',
          children: [
            {
              index: true,
              lazy: () =>
                import('./routes/app/cluster/dashboard').then(convert(queryClient)),
            },
            {
              path: 'plots',
              lazy: () =>
                import('./routes/app/cluster/plots').then(convert(queryClient)),
            },
            {
              path: 'farmers',
              lazy: () =>
                import('./routes/app/cluster/farmers').then(convert(queryClient)),
            },
            {
              path: 'groups',
              lazy: () =>
                import('./routes/app/cluster/groups').then(convert(queryClient)),
            },
            {
              path: 'map',
              lazy: () =>
                import('./routes/app/cluster/map').then(convert(queryClient)),
            },
            {
              path: 'uav-orders',
              lazy: () =>
                import('./routes/app/cluster/uav-orders').then(convert(queryClient)),
            },
          ],
        },
      ],
    },
    {
      path: '*',
      lazy: () => import('./routes/not-found').then(convert(queryClient)),
    },
  ]);

export const AppRouter = () => {
  const queryClient = useQueryClient();

  const router = useMemo(() => createAppRouter(queryClient), [queryClient]);

  return <RouterProvider router={router} />;
};
