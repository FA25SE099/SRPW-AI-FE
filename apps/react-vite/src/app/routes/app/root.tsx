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
  Clock,
  Plane,
  ReceiptText,
  Package,
  Calendar,
} from 'lucide-react';
import { Navigate, Outlet, useLocation, useRouteError } from 'react-router';

import { DashboardLayout, SideNavigationItem, SideNavigationGroup } from '@/components/layouts';
import { paths } from '@/config/paths';
import { useUser } from '@/lib/auth';
import { ROLES, useAuthorization } from '@/lib/authorization';

// Example: Import custom SVG icon (you can download any SVG and import it like this)
import ExampleIcon from '@/assets/icons/example-icon.svg?react';

export const ErrorBoundary = () => {
  const error = useRouteError();
  console.error('Route Error:', error);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="rounded-lg border border-red-200 bg-white p-8 shadow-lg max-w-lg">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong!</h1>
        <p className="text-gray-700 mb-4">
          {error instanceof Error ? error.message : 'An unexpected error occurred'}
        </p>
        {error instanceof Error && error.stack && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-gray-600">Error details</summary>
            <pre className="mt-2 text-xs bg-gray-100 p-4 rounded overflow-auto">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

const AppRoot = () => {
  const user = useUser();
  const location = useLocation();
  const { checkAccess } = useAuthorization();
  console.log('location.pathname', user.data?.role);

  // Role-based redirect when accessing /app root
  if (location.pathname === paths.app.root.path) {
    if (user.data?.role === ROLES.Admin) {
      return <Navigate to={paths.app.admin.roles.getHref()} replace />;
    }
    if (user.data?.role === ROLES.AgronomyExpert) {
      return <Navigate to={paths.app.expert.reports.getHref()} replace />;
    }
    if (user.data?.role === ROLES.Supervisor) {
      return <Navigate to={paths.app.supervisor.group.getHref()} replace />;
    }
    if (user.data?.role === ROLES.ClusterManager) {
      return <Navigate to={paths.app.cluster.farmers.getHref()} replace />;
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
  let navigationGroups: SideNavigationGroup[] | undefined;

  // Expert Dashboard specific navigation - Mixed flat and grouped navigation
  if (location.pathname.startsWith('/app/expert')) {
    // Main items as flat navigation (always visible)
    navigationItems = [
      // {
      //   name: 'Overview',
      //   to: paths.app.expert.dashboard.getHref(),
      //   icon: Home,
      //   end: true,
      // },
      {
        name: 'Approvals',
        to: paths.app.expert.approvals.getHref(),
        icon: CheckCircle,
        end: true,
      },
      {
        name: 'Plot Reports',
        to: paths.app.expert.reports.getHref(),
        icon: AlertTriangle,
        end: true,
      },
      {
        name: 'Late Management',
        to: paths.app.expert.lateManagement.getHref(),
        icon: Clock,
        end: true,
      },
      {
        name: 'YearSeasons',
        to: paths.app.expert.yearseasons.getHref(),
        icon: Calendar,
        end: true,
      },
      // Example: Uncomment to use a custom downloaded SVG icon
      // {
      //   name: 'Custom Page',
      //   to: paths.app.expert.custompage.getHref(),
      //   icon: ExampleIcon, // Your custom SVG icon!
      //   end: true,
      // },
    ];

    // Grouped navigation for Plans and Resources
    navigationGroups = [
      {
        title: 'Plans',
        icon: Folder, // Group header icon
        items: [
          // {
          //   name: 'Emergency Plans',
          //   to: paths.app.expert.emergency.getHref(),
          //   icon: ShieldAlert,
          //   end: true,
          // },
          {
            name: 'Emergency Protocols',
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
          // {
          //   name: 'Plan Monitoring',
          //   to: paths.app.expert.planMonitoring.getHref(),
          //   icon: ClipboardList,
          //   end: true,
          // },
        ],
        defaultOpen: true,
      },
      {
        title: 'Resources',
        icon: Settings, // Group header icon
        items: [
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
        ],
        defaultOpen: true,
      },
    ];
  }
  // Supervisor Dashboard specific navigation
  else if (location.pathname.startsWith('/app/supervisor')) {
    navigationItems = [
      // {
      //   name: 'Overview',
      //   to: paths.app.supervisor.dashboard.getHref(),
      //   icon: Home,
      //   end: true,
      // },
      {
        name: 'Group Management',
        to: paths.app.supervisor.group.getHref(),
        icon: Users,
        end: true,
      },
      // {
      //   name: 'Production Plans',
      //   to: paths.app.supervisor.plans.getHref(),
      //   icon: Folder,
      //   end: true,
      // },
      {
        name: 'Material Distributions',
        to: paths.app.supervisor.materialDistributions.getHref(),
        icon: Package,
        end: true,
      },
      {
        name: 'Farmers',
        to: paths.app.supervisor.farmers.getHref(),
        icon: Users,
        end: true,
      },
      {
        name: 'Reports',
        to: paths.app.supervisor.reports.getHref(),
        icon: AlertTriangle,
        end: true,
      },
      {
        name: 'Late Management',
        to: paths.app.supervisor.lateManagement.getHref(),
        icon: Clock,
        end: true,
      },
      {
        name: 'Maps',
        to: paths.app.supervisor.maps.getHref(),
        icon: Map,
        end: true,
      },
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
        name: 'Plots',
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
      // {
      //   name: 'Plans',
      //   to: paths.app.cluster.plans.getHref(),
      //   icon: ClipboardList,
      //   end: true,
      // },
      // {
      //   name: 'Groups',
      //   to: paths.app.cluster.groups.getHref(),
      //   icon: Users,
      //   end: true,
      // },
      {
        name: 'UAV Orders',
        to: paths.app.cluster.uavOrders.getHref(),
        icon: ReceiptText,
        end: true,
      },
      {
        name: 'Map',
        to: paths.app.cluster.maps.getHref(),
        icon: Map,
        end: true,
      },
    ];
  }
  // Admin Dashboard specific navigation
  else if (
    location.pathname.startsWith('/app/admin') &&
    checkAccess({ allowedRoles: [ROLES.Admin] })
  ) {
    navigationItems = [
      // {
      //   name: 'Overview',
      //   to: paths.app.admin.dashboard.getHref(),
      //   icon: Home,
      //   end: true,
      // },
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
      // {
      //   name: 'Reports',
      //   to: paths.app.admin.reports.getHref(),
      //   icon: BarChart3,
      //   end: true,
      // },
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
        to: paths.app.expert.reports.getHref(),
        icon: Home,
        end: true,
      },
      checkAccess({ allowedRoles: [ROLES.Supervisor] }) && {
        name: 'Supervisor Dashboard',
        to: paths.app.supervisor.dashboard.getHref(),
        icon: Home,
        end: true,
      },
      // {
      //   name: 'Discussions',
      //   to: paths.app.discussions.getHref(),
      //   icon: Folder,
      //   end: false,
      // },
      // checkAccess({ allowedRoles: [ROLES.Admin] }) && {
      //   name: 'Users',
      //   to: paths.app.users.getHref(),
      //   icon: Users,
      //   end: true,
      // },
      {
        name: 'Profile',
        to: paths.app.profile.getHref(),
        icon: Home,
        end: true,
      }
    ].filter(Boolean) as SideNavigationItem[];
  }

  return (
    <DashboardLayout
      navigationItems={navigationItems}
      navigationGroups={navigationGroups}
    >
      <Outlet />
    </DashboardLayout>
  );
};

export default AppRoot;
