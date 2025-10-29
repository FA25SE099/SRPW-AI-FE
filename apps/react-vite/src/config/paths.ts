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
      reports: {
        path: 'expert/reports',
        getHref: () => '/app/expert/reports',
      },
    },
    cluster: {
      root: {
        path: 'cluster',
        getHref: () => '/app/cluster',
      },
      dashboard: {
        path: 'cluster/dashboard',
        getHref: () => '/app/cluster',
      },
      fields: {
        path: 'cluster/field',
        getHref: () => 'cluster/field',
      },
      farmers: {
        path: 'cluster/farmers',
        getHref: () => 'cluster/farmers'
      },
      plans: {
        path: 'cluster/plans',
        getHref: () => 'cluster/plans'
      },
      groups: {
        path: 'cluster/groups',
        getHref: () => 'cluster/groups'
      },
    },
  },
} as const;
