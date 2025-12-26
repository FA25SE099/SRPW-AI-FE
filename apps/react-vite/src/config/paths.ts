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
    forgotPassword: {
      path: '/auth/forgot-password',
      getHref: () => '/auth/forgot-password',
    },
    changePassword: {
      path: '/auth/change-password',
      getHref: () => '/auth/change-password',
    },
  },

  unauthorized: {
    path: '/unauthorized',
    getHref: () => '/unauthorized',
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
      emergencyProtocols: {
        path: 'expert/emergency-protocols',
        getHref: () => '/app/expert/emergency-protocols',
      },
      planMonitoring: {
        path: 'expert/plan-monitoring',
        getHref: () => '/app/expert/plan-monitoring',
      },
      reports: {
        path: 'expert/reports',
        getHref: () => '/app/expert/reports',
      },
      lateManagement: {
        path: 'expert/late-management',
        getHref: () => '/app/expert/late-management',
      },
      yearseasons: {
        path: 'expert/yearseasons',
        getHref: () => '/app/expert/yearseasons',
      },
    },
    yearseason: {
      dashboard: {
        path: 'yearseason/:yearSeasonId/dashboard',
        getHref: (yearSeasonId: string) => `/app/yearseason/${yearSeasonId}/dashboard`,
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
    supervisor: {
      root: {
        path: 'supervisor',
        getHref: () => '/app/supervisor',
      },
      dashboard: {
        path: 'supervisor',
        getHref: () => '/app/supervisor',
      },
      group: {
        path: 'supervisor/group',
        getHref: () => '/app/supervisor/group',
      },
      planDetails: {
        path: 'plan-details',
        getHref: (planId?: string) =>
          `/app/supervisor/plan-details${planId ? `?planId=${planId}` : ''}`,
      },
      planExecution: {
        path: 'supervisor/plan-execution/:planId',
        getHref: (planId: string) => `/app/supervisor/plan-execution/${planId}`,
      },
      plans: {
        path: 'supervisor/plans',
        getHref: () => '/app/supervisor/plans',
      },
      reports: {
        path: 'supervisor/reports',
        getHref: () => '/app/supervisor/reports',
      },
      maps: {
        path: 'supervisor/maps',
        getHref: () => '/app/supervisor/maps',
      },
      lateManagement: {
        path: 'supervisor/late-management',
        getHref: () => '/app/supervisor/late-management',
      },
      farmers: {
        path: 'supervisor/farmers',
        getHref: () => '/app/supervisor/farmers',
      },
      materialDistributions: {
        path: 'supervisor/material-distributions',
        getHref: (groupId?: string) =>
          groupId
            ? `/app/supervisor/material-distributions?groupId=${groupId}`
            : '/app/supervisor/material-distributions',
      },
    },
    cluster: {
      root: {
        path: 'cluster',
        getHref: () => '/app/cluster',
      },
      dashboard: {
        path: 'cluster',
        getHref: () => '/app/cluster',
      },
      plots: {
        path: 'cluster/plots',
        getHref: () => '/app/cluster/plots',
      },
      farmers: {
        path: 'cluster/farmers',
        getHref: () => '/app/cluster/farmers',
      },
      plans: {
        path: 'cluster/plans',
        getHref: () => '/app/cluster/plans',
      },
      groups: {
        path: 'cluster/groups',
        getHref: () => '/app/cluster/groups',
      },
      maps: {
        path: 'cluster/map',
        getHref: () => '/app/cluster/map',
      },
      uavOrders: {
        path: 'cluster/uav-orders',
        getHref: () => '/app/cluster/uav-orders',
      },
    },
  },
} as const;
