import {
  Home,
  Folder,
  Users,
  CheckCircle,
  AlertTriangle,
  FileText,
  Beaker,
  TrendingUp,
  MapPin,
  UserCheck,
  ClipboardList,
  Sprout,
  Map,
  Shield,
  Settings,
  BarChart3,
  Network,
  ShieldAlert,
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
  console.log('location.pathname', user.data?.role);

  // Role-based redirect when accessing /app root
  if (location.pathname === paths.app.root.path) {
    if (user.data?.role === ROLES.Admin) {
      return <Navigate to={paths.app.admin.dashboard.getHref()} replace />;
    }
    if (user.data?.role === ROLES.AgronomyExpert) {
      return <Navigate to={paths.app.expert.dashboard.getHref()} replace />;
    }
    if (user.data?.role === ROLES.Supervisor) {
      return <Navigate to={paths.app.supervisor.dashboard.getHref()} replace />;
    }
    if (user.data?.role === ROLES.ClusterManager) {
      return <Navigate to={paths.app.cluster.dashboard.getHref()} replace />;
    }
    return <Navigate to={paths.app.dashboard.getHref()} replace />;
  }

  // Role-based route protection - Redirect unauthorized users to 403 page
  if (location.pathname.startsWith('/app/expert')) {
    if (!checkAccess({ allowedRoles: [ROLES.AgronomyExpert] })) {
      return <Navigate to={paths.unauthorized.getHref()} replace />;
    }
  }

  if (location.pathname.startsWith('/app/supervisor')) {
    if (!checkAccess({ allowedRoles: [ROLES.Supervisor] })) {
      return <Navigate to={paths.unauthorized.getHref()} replace />;
    }
  }

  if (location.pathname.startsWith('/app/cluster')) {
    if (!checkAccess({ allowedRoles: [ROLES.ClusterManager] })) {
      return <Navigate to={paths.unauthorized.getHref()} replace />;
    }
  }

  if (location.pathname.startsWith('/app/admin')) {
    if (!checkAccess({ allowedRoles: [ROLES.Admin] })) {
      return <Navigate to={paths.unauthorized.getHref()} replace />;
    }
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
        name: 'Emergency',
        to: paths.app.expert.emergencyProtocols.getHref(),
        icon: ShieldAlert,
        end: true,
      },
      {
        name: 'Standard Plans',
        to: paths.app.expert.standardPlans.getHref(),
        icon: FileText,
        end: true,
      },
      {
        name: 'Plan Monitoring',
        to: paths.app.expert.planMonitoring.getHref(),
        icon: ClipboardList,
        end: true,
      },
      {
        name: 'Materials',
        to: paths.app.expert.materials.getHref(),
        icon: Beaker,
        end: true,
      },
      {
        name: 'Rice Varieties',
        to: paths.app.expert.riceVarieties.getHref(),
        icon: Sprout,
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
  // Supervisor Dashboard specific navigation
  else if (location.pathname.startsWith('/app/supervisor')) {
    navigationItems = [
      {
        name: 'Overview',
        to: paths.app.supervisor.dashboard.getHref(),
        icon: Home,
        end: true,
      },
      {
        name: 'Group Management',
        to: paths.app.supervisor.group.getHref(),
        icon: Users,
        end: true,
      },
      {
        name: 'Production Plans',
        to: paths.app.supervisor.plans.getHref(),
        icon: Folder,
        end: true,
      },
      {
        name: 'Reports',
        to: paths.app.supervisor.reports.getHref(),
        icon: TrendingUp,
        end: true,
      },
      {
        name: 'Maps',
        to: paths.app.supervisor.maps.getHref(),
        icon: Map,
        end: true,
      }
    ];
  }
  // Cluster Dashboard specific navigation
  else if (location.pathname.startsWith('/app/cluster')) {
    navigationItems = [
      {
        name: 'Overview',
        to: paths.app.cluster.dashboard.getHref(),
        icon: Home,
        end: true,
      },
      {
        name: 'Fields',
        to: paths.app.cluster.plots.getHref(),
        icon: MapPin,
        end: true,
      },
      {
        name: 'Farmers',
        to: paths.app.cluster.farmers.getHref(),
        icon: UserCheck,
        end: true,
      },
      {
        name: 'Plans',
        to: paths.app.cluster.plans.getHref(),
        icon: ClipboardList,
        end: true,
      },
      {
        name: 'Groups',
        to: paths.app.cluster.groups.getHref(),
        icon: Users,
        end: true,
      },
      {
        name: 'Map',
        to: paths.app.cluster.maps.getHref(),
        icon: Map,
        end: true
      },
    ];
  }
  // Admin Dashboard specific navigation
  else if (
    location.pathname.startsWith('/app/admin') &&
    checkAccess({ allowedRoles: [ROLES.Admin] })
  ) {
    navigationItems = [
      {
        name: 'Overview',
        to: paths.app.admin.dashboard.getHref(),
        icon: Home,
        end: true,
      },
      {
        name: 'Clusters',
        to: paths.app.admin.clusters.getHref(),
        icon: Network,
        end: true,
      },
      {
        name: 'Roles & Users',
        to: paths.app.admin.roles.getHref(),
        icon: Shield,
        end: true,
      },
      {
        name: 'Users',
        to: paths.app.admin.users.getHref(),
        icon: Users,
        end: true,
      },
      {
        name: 'System Settings',
        to: paths.app.admin.settings.getHref(),
        icon: Settings,
        end: true,
      },
      {
        name: 'Reports',
        to: paths.app.admin.reports.getHref(),
        icon: BarChart3,
        end: true,
      },
    ];
  }
  // Default navigation (for other pages like Discussions, Users, Profile)
  else {
    navigationItems = [
      checkAccess({ allowedRoles: [ROLES.Admin] }) && {
        name: 'Admin Dashboard',
        to: paths.app.admin.dashboard.getHref(),
        icon: Home,
        end: true,
      },
      checkAccess({ allowedRoles: [ROLES.AgronomyExpert] }) && {
        name: 'Expert Dashboard',
        to: paths.app.expert.dashboard.getHref(),
        icon: Home,
        end: true,
      },
      checkAccess({ allowedRoles: [ROLES.Supervisor] }) && {
        name: 'Supervisor Dashboard',
        to: paths.app.supervisor.dashboard.getHref(),
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
