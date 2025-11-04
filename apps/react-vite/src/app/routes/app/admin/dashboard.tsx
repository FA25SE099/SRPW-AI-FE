import {
    Users,
    Shield,
    Activity,
    Settings,
    TrendingUp,
    AlertCircle,
    BarChart3,
    Database,
} from 'lucide-react';

import { ContentLayout } from '@/components/layouts';
import { useUser } from '@/lib/auth';

type StatCardProps = {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ElementType;
    color: string;
    trend?: string;
};

const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    color,
    trend,
}: StatCardProps) => (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
            <div>
                <p className="mb-1 text-sm text-gray-600">{title}</p>
                <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
                <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
                {trend && (
                    <p className="mt-2 text-xs font-medium text-green-600">
                        ↑ {trend}
                    </p>
                )}
            </div>
            <div className={`rounded-lg p-3 ${color}`}>
                <Icon className="h-6 w-6 text-white" />
            </div>
        </div>
    </div>
);

type ActivityItemProps = {
    user: string;
    action: string;
    target: string;
    time: string;
    status: 'success' | 'warning' | 'info' | 'error';
};

const ActivityItem = ({ user, action, target, time, status }: ActivityItemProps) => (
    <div className="flex items-center gap-4 border-b border-gray-100 pb-4 last:border-0">
        <div
            className={`h-2 w-2 rounded-full ${
                status === 'success'
                    ? 'bg-green-500'
                    : status === 'warning'
                    ? 'bg-orange-500'
                    : status === 'error'
                    ? 'bg-red-500'
                    : 'bg-blue-500'
            }`}
        ></div>
        <div className="flex-1">
            <p className="text-sm text-gray-900">
                <span className="font-medium">{user}</span> {action}
            </p>
            <p className="text-xs text-gray-500">{target}</p>
        </div>
        <span className="text-xs text-gray-400">{time}</span>
    </div>
);

type QuickActionProps = {
    title: string;
    description: string;
    icon: React.ElementType;
    iconColor: string;
    onClick?: () => void;
};

const QuickAction = ({
    title,
    description,
    icon: Icon,
    iconColor,
    onClick,
}: QuickActionProps) => (
    <button
        onClick={onClick}
        className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition-all hover:border-blue-500 hover:bg-blue-50"
    >
        <Icon className={`h-5 w-5 ${iconColor}`} />
        <div>
            <p className="text-sm font-medium text-gray-900">{title}</p>
            <p className="text-xs text-gray-500">{description}</p>
        </div>
    </button>
);

const AdminDashboardRoute = () => {
    const user = useUser();

    return (
        <ContentLayout title="Admin Dashboard - System Overview">
            {/* Admin Info Section */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 font-semibold text-white">
                        {user.data?.firstName?.[0]}
                        {user.data?.lastName?.[0]}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900">
                            {user.data?.firstName} {user.data?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{user.data?.role}</p>
                    </div>
                </div>
                <button className="relative rounded-lg border border-gray-300 bg-white p-2 hover:bg-gray-50">
                    <Settings className="h-5 w-5 text-gray-600" />
                </button>
            </div>

            {/* Stats Grid */}
            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Users"
                    value="1,248"
                    subtitle="125 active today"
                    icon={Users}
                    color="bg-blue-600"
                    trend="+12.5% from last month"
                />
                <StatCard
                    title="System Health"
                    value="98.5%"
                    subtitle="All services operational"
                    icon={Activity}
                    color="bg-green-600"
                />
                <StatCard
                    title="Pending Reviews"
                    value="23"
                    subtitle="Requires attention"
                    icon={AlertCircle}
                    color="bg-orange-600"
                />
                <StatCard
                    title="Active Sessions"
                    value="342"
                    subtitle="Peak: 456 at 2PM"
                    icon={TrendingUp}
                    color="bg-purple-600"
                />
            </div>

            {/* Two Column Layout */}
            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Quick Actions */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-bold text-gray-900">
                        Quick Actions
                    </h2>
                    <div className="space-y-3">
                        <QuickAction
                            title="Manage Users"
                            description="View and edit user accounts"
                            icon={Users}
                            iconColor="text-blue-600"
                        />
                        <QuickAction
                            title="Role Management"
                            description="Configure permissions"
                            icon={Shield}
                            iconColor="text-purple-600"
                        />
                        <QuickAction
                            title="System Settings"
                            description="Configure application"
                            icon={Settings}
                            iconColor="text-gray-600"
                        />
                        <QuickAction
                            title="View Reports"
                            description="Analytics and insights"
                            icon={BarChart3}
                            iconColor="text-green-600"
                        />
                    </div>
                </div>

                {/* System Alerts */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">
                            System Alerts
                        </h2>
                        <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                            2 Critical
                        </span>
                    </div>
                    <div className="space-y-3">
                        <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-3">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="h-5 w-5 text-red-600" />
                                <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-gray-900">
                                        High Memory Usage
                                    </h4>
                                    <p className="text-xs text-gray-600">
                                        Server memory at 92% capacity
                                    </p>
                                    <span className="text-xs text-gray-500">
                                        10 min ago
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-3">
                            <div className="flex items-start gap-2">
                                <Database className="h-5 w-5 text-red-600" />
                                <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-gray-900">
                                        Database Connection Issues
                                    </h4>
                                    <p className="text-xs text-gray-600">
                                        Intermittent connection timeouts detected
                                    </p>
                                    <span className="text-xs text-gray-500">
                                        25 min ago
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-3">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="h-5 w-5 text-yellow-600" />
                                <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-gray-900">
                                        Backup Pending
                                    </h4>
                                    <p className="text-xs text-gray-600">
                                        Database backup overdue
                                    </p>
                                    <span className="text-xs text-gray-500">
                                        2h ago
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-gray-900">
                    Recent Activity
                </h2>
                <div className="space-y-4">
                    <ActivityItem
                        user="John Admin"
                        action="updated user permissions for"
                        target="Expert Group #5"
                        time="5 min ago"
                        status="success"
                    />
                    <ActivityItem
                        user="Sarah Manager"
                        action="created new rice variety"
                        target="OM6976 High Yield"
                        time="1h ago"
                        status="info"
                    />
                    <ActivityItem
                        user="Mike Supervisor"
                        action="rejected approval request"
                        target="Group G-045"
                        time="2h ago"
                        status="warning"
                    />
                    <ActivityItem
                        user="System"
                        action="automated backup completed"
                        target="Database backup successful"
                        time="3h ago"
                        status="success"
                    />
                    <ActivityItem
                        user="Admin"
                        action="updated system settings"
                        target="Email notification configuration"
                        time="5h ago"
                        status="info"
                    />
                    <ActivityItem
                        user="System"
                        action="security scan completed"
                        target="No vulnerabilities detected"
                        time="1d ago"
                        status="success"
                    />
                </div>
            </div>
        </ContentLayout>
    );
};

export default AdminDashboardRoute;

