import {
  Home,
  Folder,
  Users,
  CheckCircle,
  AlertTriangle,
  FileText,
  Beaker,
  TrendingUp,
} from 'lucide-react';
import { Navigate, Outlet, useLocation } from 'react-router';

import { DashboardLayout, SideNavigationItem } from '@/components/layouts';
import { paths } from '@/config/paths';
import { useUser } from '@/lib/auth';
import { ROLES, useAuthorization } from '@/lib/authorization';

export const ErrorBoundary = () => {
  return <div>Something went wrong!</div>;
};

const AppRoot = () => {
  const user = useUser();
  const location = useLocation();
  const { checkAccess } = useAuthorization();

  // Role-based redirect when accessing /app root
  if (location.pathname === paths.app.root.path) {
    if (user.data?.role === ROLES.Admin) {
      return <Navigate to={paths.app.dashboard.getHref()} replace />;
    }
    if (user.data?.role === ROLES.AgronomyExpert) {
      return <Navigate to={paths.app.expert.dashboard.getHref()} replace />;
    }
    return <Navigate to={paths.app.dashboard.getHref()} replace />;
  }

  // Determine navigation based on current path and role
  let navigationItems: SideNavigationItem[] | undefined;

  // Expert Dashboard specific navigation
  if (location.pathname.startsWith('/app/expert')) {
    navigationItems = [
      {
        name: 'Overview',
        to: paths.app.expert.dashboard.getHref(),
        icon: Home,
        end: true,
      },
      {
        name: 'Approvals',
        to: paths.app.expert.approvals.getHref(),
        icon: CheckCircle,
        end: true,
      },
      {
        name: 'Emergency Center',
        to: paths.app.expert.emergency.getHref(),
        icon: AlertTriangle,
        end: true,
      },
      {
        name: 'Standard Plans',
        to: paths.app.expert.standards.getHref(),
        icon: FileText,
        end: true,
      },
      {
        name: 'Materials',
        to: paths.app.expert.materials.getHref(),
        icon: Beaker,
        end: true,
      },
      {
        name: 'Reports',
        to: paths.app.expert.reports.getHref(),
        icon: TrendingUp,
        end: true,
      },
    ];
  }
  // Admin Dashboard specific navigation
  else if (
    location.pathname.startsWith('/app/dashboard') &&
    checkAccess({ allowedRoles: [ROLES.Admin] })
  ) {
    navigationItems = [
      {
        name: 'Overview',
        to: paths.app.dashboard.getHref(),
        icon: Home,
        end: true,
      },
      {
        name: 'Users',
        to: paths.app.users.getHref(),
        icon: Users,
        end: true,
      },
      {
        name: 'Discussions',
        to: paths.app.discussions.getHref(),
        icon: Folder,
        end: false,
      },
    ];
  }
  // Default navigation (for other pages like Discussions, Users, Profile)
  else {
    navigationItems = [
      checkAccess({ allowedRoles: [ROLES.Admin] }) && {
        name: 'Admin Dashboard',
        to: paths.app.dashboard.getHref(),
        icon: Home,
        end: true,
      },
      checkAccess({ allowedRoles: [ROLES.AgronomyExpert] }) && {
        name: 'Expert Dashboard',
        to: paths.app.expert.dashboard.getHref(),
        icon: Home,
        end: true,
      },
      {
        name: 'Discussions',
        to: paths.app.discussions.getHref(),
        icon: Folder,
        end: false,
      },
      checkAccess({ allowedRoles: [ROLES.Admin] }) && {
        name: 'Users',
        to: paths.app.users.getHref(),
        icon: Users,
        end: true,
      },
    ].filter(Boolean) as SideNavigationItem[];
  }

  return (
    <DashboardLayout navigationItems={navigationItems}>
      <Outlet />
    </DashboardLayout>
  );
};

export default AppRoot;
