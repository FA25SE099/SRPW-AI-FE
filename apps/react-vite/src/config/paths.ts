export const paths = {
  home: {
    path: '/',
    getHref: () => '/',
  },

  auth: {
    register: {
      path: '/auth/register',
      getHref: (redirectTo?: string | null | undefined) =>
        `/auth/register${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`,
    },
    login: {
      path: '/auth/login',
      getHref: (redirectTo?: string | null | undefined) =>
        `/auth/login${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`,
    },
  },

  app: {
    root: {
      path: '/app',
      getHref: () => '/app',
    },
    dashboard: {
      path: 'dashboard',
      getHref: () => '/app/dashboard',
    },
    discussions: {
      path: 'discussions',
      getHref: () => '/app/discussions',
    },
    discussion: {
      path: 'discussions/:discussionId',
      getHref: (id: string) => `/app/discussions/${id}`,
    },
    users: {
      path: 'users',
      getHref: () => '/app/users',
    },
    profile: {
      path: 'profile',
      getHref: () => '/app/profile',
    },
    expert: {
      root: {
        path: 'expert',
        getHref: () => '/app/expert',
      },
      dashboard: {
        path: 'expert',
        getHref: () => '/app/expert',
      },
      approvals: {
        path: 'expert/approvals',
        getHref: () => '/app/expert/approvals',
      },
      emergency: {
        path: 'expert/emergency',
        getHref: () => '/app/expert/emergency',
      },
      standards: {
        path: 'expert/standards',
        getHref: () => '/app/expert/standards',
      },
      materials: {
        path: 'expert/materials',
        getHref: () => '/app/expert/materials',
      },
      riceVarieties: {
        path: 'expert/rice-varieties',
        getHref: () => '/app/expert/rice-varieties',
      },
      standardPlans: {
        path: 'expert/standard-plans',
        getHref: () => '/app/expert/standard-plans',
      },
      reports: {
        path: 'expert/reports',
        getHref: () => '/app/expert/reports',
      },
    },
    admin: {
      root: {
        path: 'admin',
        getHref: () => '/app/admin',
      },
      dashboard: {
        path: 'admin',
        getHref: () => '/app/admin',
      },
      users: {
        path: 'admin/users',
        getHref: () => '/app/admin/users',
      },
      roles: {
        path: 'admin/roles',
        getHref: () => '/app/admin/roles',
      },
      settings: {
        path: 'admin/settings',
        getHref: () => '/app/admin/settings',
      },
      reports: {
        path: 'admin/reports',
        getHref: () => '/app/admin/reports',
      },
      clusters: {
        path: 'admin/clusters',
        getHref: () => '/app/admin/clusters',
      },
    },
  },
} as const;
