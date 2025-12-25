import { Home, PanelLeft, Folder, Users, User2, ChevronLeft, ChevronRight, ChevronDown, Bell, HelpCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, useNavigate, useNavigation } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';

import logo from '@/assets/logo.svg';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { paths } from '@/config/paths';
import { useLogout, useUser } from '@/lib/auth';
import { ROLES, useAuthorization } from '@/lib/authorization';
import { cn } from '@/utils/cn';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown';
import { Link } from '../ui/link';

export type SideNavigationItem = {
  name: string;
  to: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  end?: boolean;
};

export type SideNavigationGroup = {
  title: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  items: SideNavigationItem[];
  defaultOpen?: boolean;
};

const Logo = () => {
  const user = useUser();
  const { checkAccess } = useAuthorization();

  // Determine default href based on user role
  const getDefaultHref = () => {
    if (!user.data?.role) return paths.home.getHref();

    switch (user.data.role) {
      case ROLES.Admin:
        return paths.app.admin.dashboard.getHref();
      case ROLES.AgronomyExpert:
        return paths.app.expert.reports.getHref();
      case ROLES.Supervisor:
        return paths.app.supervisor.dashboard.getHref();
      case ROLES.ClusterManager:
        return paths.app.cluster.dashboard.getHref();
      default:
        return paths.app.dashboard.getHref();
    }
  };

  return (
    <Link className="flex items-center text-white" to={getDefaultHref()}>
      <img
        className="h-8 w-auto"
        // src="https://ducthanhco.vn/wp-content/uploads/2021/10/logo-tab.png"
        src="https://ducthanhco.vn/wp-content/uploads/2023/06/logo-dt.webp"
        alt="Duc Thanh Logo"
      />
      <span className="text-sm font-semibold text-white ml-2">
        Duc Thanh Company
      </span>
    </Link>
  );
};

const Progress = () => {
  const { state, location } = useNavigation();

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
  }, [location?.pathname]);

  useEffect(() => {
    if (state === 'loading') {
      const timer = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress === 100) {
            clearInterval(timer);
            return 100;
          }
          const newProgress = oldProgress + 10;
          return newProgress > 100 ? 100 : newProgress;
        });
      }, 300);

      return () => {
        clearInterval(timer);
      };
    }
  }, [state]);

  if (state !== 'loading') {
    return null;
  }

  return (
    <div
      className="fixed left-0 top-0 h-1 bg-blue-500 transition-all duration-200 ease-in-out"
      style={{ width: `${progress}%` }}
    ></div>
  );
};

type DashboardLayoutProps = {
  children: React.ReactNode;
  navigationItems?: SideNavigationItem[];
  navigationGroups?: SideNavigationGroup[];
};

export function DashboardLayout({
  children,
  navigationItems,
  navigationGroups,
}: DashboardLayoutProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useUser();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const logout = useLogout({
    onSuccess: () => {
      queryClient.clear();
      navigate(paths.auth.login.getHref());
    },
  });
  const { checkAccess } = useAuthorization();

  // Initialize open groups
  useEffect(() => {
    if (navigationGroups) {
      const initial: Record<string, boolean> = {};
      navigationGroups.forEach(group => {
        initial[group.title] = group.defaultOpen ?? true;
      });
      setOpenGroups(initial);
    }
  }, [navigationGroups]);

  const toggleGroup = (title: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  // Default navigation if none provided
  const defaultNavigation = [
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

  const navigation = navigationItems || defaultNavigation;

  // Render flat navigation items
  const renderNavigationItems = (items: SideNavigationItem[], collapsed: boolean = false) => {
    return items.map((item) => (
      <NavLink
        key={item.name}
        to={item.to}
        end={item.end ?? true}
        className={({ isActive }) =>
          cn(
            'text-gray-300 hover:bg-gray-700 hover:text-white',
            collapsed
              ? 'group flex items-center justify-center rounded-md p-2'
              : 'group flex flex-1 w-full items-center rounded-md p-2 text-base font-medium',
            isActive && 'bg-gray-900 text-white',
          )
        }
        title={collapsed ? item.name : undefined}
      >
        <item.icon
          className={cn(
            'text-gray-400 group-hover:text-gray-300',
            collapsed ? 'size-6 shrink-0' : 'mr-4 size-6 shrink-0',
          )}
          aria-hidden="true"
        />
        {!collapsed && item.name}
      </NavLink>
    ));
  };

  // Render grouped navigation
  const renderGroupedNavigation = () => {
    if (!navigationGroups) return null;

    return navigationGroups.map((group) => {
      const GroupIcon = group.icon;

      return (
        <div key={group.title} className="w-full">
          {/* Group header - looks like a flat item */}
          <button
            onClick={() => toggleGroup(group.title)}
            className="flex w-full items-center justify-between rounded-md p-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors group"
          >
            <div className="flex items-center">
              {GroupIcon && (
                <GroupIcon
                  className={cn(
                    'text-gray-400 group-hover:text-gray-300',
                    'mr-4 size-6 shrink-0',
                  )}
                  aria-hidden="true"
                />
              )}
              <span>{group.title}</span>
            </div>
            <ChevronDown
              className={cn(
                "h-5 w-5 text-gray-400 group-hover:text-gray-300 transition-transform shrink-0",
                openGroups[group.title] && "rotate-180"
              )}
            />
          </button>
          {/* Sub-items - smaller and indented */}
          {openGroups[group.title] && (
            <div className="space-y-0">
              {group.items.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  end={item.end ?? true}
                  className={({ isActive }) =>
                    cn(
                      'text-gray-300 hover:bg-gray-700 hover:text-white',
                      'group flex flex-1 w-full items-center rounded-md py-1.5 pl-10 pr-2 text-sm',
                      isActive && 'bg-gray-900 text-white',
                    )
                  }
                >
                  <item.icon
                    className={cn(
                      'text-gray-400 group-hover:text-gray-300',
                      'mr-3 size-5 shrink-0',
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className={cn(
        "fixed inset-y-0 left-0 z-10 hidden flex-col border-r bg-black sm:flex transition-all duration-300",
        isSidebarCollapsed ? "w-16" : "w-60"
      )}>
        <nav className="flex flex-col items-center gap-2 px-2 py-4 h-full">
          <div className={cn(
            "flex h-16 w-full items-center shrink-0",
            isSidebarCollapsed ? "justify-center" : "justify-between px-2"
          )}>
            {!isSidebarCollapsed && <Logo />}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="text-white hover:bg-gray-700 shrink-0"
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </Button>
          </div>

          <div className="flex flex-col gap-1 w-full overflow-y-auto">
            {!isSidebarCollapsed ? (
              <>
                {/* Show flat navigation items if provided */}
                {navigationItems && renderNavigationItems(navigation)}

                {/* Show grouped navigation if provided */}
                {navigationGroups && renderGroupedNavigation()}
              </>
            ) : (
              /* Collapsed state - show only icons */
              <>
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.to}
                    end={item.end ?? true}
                    className={({ isActive }) =>
                      cn(
                        'text-gray-300 hover:bg-gray-700 hover:text-white',
                        'group flex items-center justify-center rounded-md p-2',
                        isActive && 'bg-gray-900 text-white',
                      )
                    }
                    title={item.name}
                  >
                    <item.icon className="h-6 w-6" aria-hidden="true" />
                  </NavLink>
                ))}
              </>
            )}
          </div>

          {/* Spacer to push bottom items to the bottom */}
          <div className="flex-1" />

          {/* Bottom section with notifications, support and user menu */}
          {/* Bottom section with notifications, support and user menu */}
          <div className={cn(
            "flex w-full border-t border-gray-800 pt-4",
            isSidebarCollapsed ? "flex-col gap-2 items-center" : "flex-col gap-2 px-2"
          )}>
            {/* Notification Bell
            <Button
              variant="ghost"
              size={isSidebarCollapsed ? "icon" : "default"}
              className={cn(
                "text-gray-300 hover:bg-gray-700 hover:text-white relative",
                isSidebarCollapsed ? "w-10 h-10" : "w-full justify-start h-auto py-2"
              )}
              title={isSidebarCollapsed ? "Notifications" : undefined}
            >
              <Bell className={cn("h-5 w-5 text-gray-400", !isSidebarCollapsed && "mr-3")} />
              {!isSidebarCollapsed && <span className="text-sm">Notifications</span>}
              {isSidebarCollapsed && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
                  5
                </span>
              )}
            </Button> */}



            {/* User Menu - No dropdown when expanded, just shows info */}
            {!isSidebarCollapsed ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-gray-700 transition-colors">
                    <img
                      src={`https://ui-avatars.com/api/?name=${user.data?.firstName}+${user.data?.lastName}&background=3b82f6&color=fff`}
                      alt={`${user.data?.firstName} ${user.data?.lastName}`}
                      className="h-10 w-10 rounded-full"
                    />
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-semibold text-white truncate">
                        {user.data?.firstName} {user.data?.lastName}
                      </span>
                      <span className="text-xs text-gray-400 truncate">
                        {user.data?.role}
                      </span>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="right">
                  <DropdownMenuItem
                    onClick={() => navigate(paths.app.profile.getHref())}
                    className={cn('block px-4 py-2 text-sm text-gray-700')}
                  >
                    Your Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className={cn('block px-4 py-2 text-sm text-gray-700 w-full')}
                    onClick={() => logout.mutate({})}
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-300 hover:bg-gray-700 hover:text-white w-10 h-10"
                    title="User menu"
                  >
                    <User2 className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="right">
                  <DropdownMenuItem
                    onClick={() => navigate(paths.app.profile.getHref())}
                    className={cn('block px-4 py-2 text-sm text-gray-700')}
                  >
                    Your Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className={cn('block px-4 py-2 text-sm text-gray-700 w-full')}
                    onClick={() => logout.mutate({})}
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </nav>
      </aside>
      <div className={cn(
        "flex flex-col transition-all duration-300",
        isSidebarCollapsed ? "sm:pl-16" : "sm:pl-60"
      )}>
        <Progress />
        {/* Mobile header - only visible on mobile */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:hidden">
          <Drawer>
            <DrawerTrigger asChild>
              <Button size="icon" variant="outline">
                <PanelLeft className="size-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </DrawerTrigger>
            <DrawerContent
              side="left"
              className="bg-black pt-10 text-white sm:max-w-60"
            >
              <nav className="grid gap-4 px-4 text-lg font-medium h-full">
                <div className="flex h-16 shrink-0 items-center">
                  <Logo />
                </div>

                {/* Flat navigation for mobile */}
                {navigationItems && renderNavigationItems(navigation)}

                {/* Grouped navigation for mobile */}
                {navigationGroups && renderGroupedNavigation()}

                {/* Mobile user section */}
                <div className="mt-auto border-t border-gray-800 pt-4 space-y-2">
                  <Button
                    variant="ghost"
                    size="default"
                    className="w-full justify-start text-gray-300 hover:bg-gray-700 hover:text-white relative h-auto py-2"
                  >
                    <Bell className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-sm">Notifications</span>
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
                      5
                    </span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="default"
                    className="w-full justify-start text-gray-300 hover:bg-gray-700 hover:text-white h-auto py-2"
                  >
                    <HelpCircle className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-sm">Support</span>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-gray-700 transition-colors">
                        <img
                          src={`https://ui-avatars.com/api/?name=${user.data?.firstName}+${user.data?.lastName}&background=3b82f6&color=fff`}
                          alt={`${user.data?.firstName} ${user.data?.lastName}`}
                          className="h-10 w-10 rounded-full"
                        />
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-sm font-semibold text-white truncate">
                            {user.data?.firstName} {user.data?.lastName}
                          </span>
                          <span className="text-xs text-gray-400 truncate">
                            {user.data?.role}
                          </span>
                        </div>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => navigate(paths.app.profile.getHref())}
                        className={cn('block px-4 py-2 text-sm text-gray-700')}
                      >
                        Your Profile
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className={cn('block px-4 py-2 text-sm text-gray-700 w-full')}
                        onClick={() => logout.mutate({})}
                      >
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </nav>
            </DrawerContent>
          </Drawer>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-4 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  );
}
