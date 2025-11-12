import {
    Bell,
    CheckCircle,
    AlertTriangle,
    Clock,
    FileText,
} from 'lucide-react';

import { ContentLayout } from '@/components/layouts';
import { useUser } from '@/lib/auth';

type StatCardProps = {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ElementType;
    color: string;
};

const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    color,
}: StatCardProps) => (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
            <div>
                <p className="mb-1 text-sm text-gray-600">{title}</p>
                <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
                <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
            </div>
            <div className={`rounded-lg p-3 ${color}`}>
                <Icon className="h-6 w-6 text-white" />
            </div>
        </div>
    </div>
);

type ApprovalItemProps = {
    id: number;
    supervisor: string;
    group: string;
    type: string;
    priority: string;
    time: string;
};

const ApprovalItem = ({
    supervisor,
    group,
    type,
    priority,
    time,
}: ApprovalItemProps) => (
    <div className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md">
        <div className="mb-3 flex items-start justify-between">
            <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">Group {group}</h4>
                    <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${priority === 'Critical'
                                ? 'bg-red-100 text-red-700'
                                : priority === 'Urgent'
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'bg-blue-100 text-blue-700'
                            }`}
                    >
                        {priority}
                    </span>
                </div>
                <p className="text-sm text-gray-600">Supervisor: {supervisor}</p>
                <p className="mt-1 text-xs text-gray-500">{type}</p>
            </div>
            <span className="text-xs text-gray-400">{time}</span>
        </div>
        <div className="flex gap-2">
            <button className="flex-1 rounded bg-green-600 px-3 py-2 text-sm text-white transition-colors hover:bg-green-700">
                Approve
            </button>
            <button className="flex-1 rounded bg-gray-100 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-200">
                Review
            </button>
            <button className="rounded bg-red-50 px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-100">
                Reject
            </button>
        </div>
    </div>
);

type AlertItemProps = {
    type: string;
    severity: string;
    message: string;
    source: string;
    time: string;
    affected: string;
};

const AlertItem = ({
    type,
    severity,
    message,
    source,
    time,
    affected,
}: AlertItemProps) => (
    <div
        className={`rounded-r-lg border-l-4 p-4 ${severity === 'Critical'
                ? 'border-red-500 bg-red-50'
                : severity === 'High'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-yellow-500 bg-yellow-50'
            }`}
    >
        <div className="mb-2 flex items-start justify-between">
            <div className="flex items-center gap-2">
                <AlertTriangle
                    className={`h-5 w-5 ${severity === 'Critical'
                            ? 'text-red-600'
                            : severity === 'High'
                                ? 'text-orange-600'
                                : 'text-yellow-600'
                        }`}
                />
                <h4 className="font-semibold text-gray-900">{type}</h4>
            </div>
            <span className="text-xs text-gray-500">{time}</span>
        </div>
        <p className="mb-2 text-sm text-gray-700">{message}</p>
        <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Source: {source}</span>
            <span className="text-gray-600">{affected} plots affected</span>
        </div>
        <button className="mt-3 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm transition-colors hover:bg-gray-50">
            Review & Respond
        </button>
    </div>
);

const ExpertDashboardRoute = () => {
    const user = useUser();

    return (
        <ContentLayout title="Expert Dashboard - Overview">
            {/* User Info Section */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
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
                    <Bell className="h-5 w-5 text-gray-600" />
                    <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
                </button>
            </div>

            {/* Stats Grid */}
            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Groups Supervised"
                    value="47"
                    subtitle="Across 3 regions"
                    icon={FileText}
                    color="bg-blue-600"
                />
                <StatCard
                    title="Pending Approvals"
                    value="12"
                    subtitle="8 urgent, 4 normal"
                    icon={Clock}
                    color="bg-orange-600"
                />
                <StatCard
                    title="Active Alerts"
                    value="5"
                    subtitle="3 critical, 2 high"
                    icon={AlertTriangle}
                    color="bg-red-600"
                />
                <StatCard
                    title="Avg Response Time"
                    value="2.4h"
                    subtitle="Target: < 4h"
                    icon={CheckCircle}
                    color="bg-green-600"
                />
            </div>

            {/* Two Column Layout */}
            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Urgent Approvals */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">
                            Urgent Approvals
                        </h2>
                        <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700">
                            8 Pending
                        </span>
                    </div>
                    <div className="space-y-3">
                        <ApprovalItem
                            id={1}
                            supervisor="Nguyen Van A"
                            group="G-034"
                            type="Emergency Spraying Plan"
                            priority="Critical"
                            time="15 min ago"
                        />
                        <ApprovalItem
                            id={2}
                            supervisor="Tran Thi B"
                            group="G-021"
                            type="Modified Fertilization Schedule"
                            priority="Urgent"
                            time="1h ago"
                        />
                    </div>
                    <button className="mt-4 w-full rounded-lg px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50">
                        View All Approvals
                    </button>
                </div>

                {/* Emergency Alerts */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">
                            Emergency Alerts
                        </h2>
                        <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                            5 Active
                        </span>
                    </div>
                    <div className="space-y-3">
                        <AlertItem
                            type="Pest Outbreak"
                            severity="Critical"
                            message="Brown planthopper detected above threshold in 12 plots"
                            source="AI Detection"
                            time="30 min ago"
                            affected="12"
                        />
                        <AlertItem
                            type="Heavy Rain Warning"
                            severity="High"
                            message="Severe weather expected in next 24h"
                            source="Weather API"
                            time="2h ago"
                            affected="23"
                        />
                    </div>
                    <button className="mt-4 w-full rounded-lg px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50">
                        View All Alerts
                    </button>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-gray-900">
                    Recent Activity
                </h2>
                <div className="space-y-4">
                    {[
                        {
                            action: 'Approved production plan',
                            target: 'Group G-045',
                            time: '2h ago',
                            status: 'success',
                        },
                        {
                            action: 'Modified standard plan',
                            target: 'OM5451 Rice Variety',
                            time: '5h ago',
                            status: 'info',
                        },
                        {
                            action: 'Emergency protocol activated',
                            target: 'Group G-021',
                            time: '1d ago',
                            status: 'warning',
                        },
                        {
                            action: 'Approved material substitute',
                            target: 'Group G-018',
                            time: '2d ago',
                            status: 'success',
                        },
                    ].map((item, idx) => (
                        <div
                            key={idx}
                            className="flex items-center gap-4 border-b border-gray-100 pb-4 last:border-0"
                        >
                            <div
                                className={`h-2 w-2 rounded-full ${item.status === 'success'
                                        ? 'bg-green-500'
                                        : item.status === 'warning'
                                            ? 'bg-orange-500'
                                            : 'bg-blue-500'
                                    }`}
                            ></div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-900">{item.action}</p>
                                <p className="text-xs text-gray-500">{item.target}</p>
                            </div>
                            <span className="text-xs text-gray-400">{item.time}</span>
                        </div>
                    ))}
                </div>
            </div>
        </ContentLayout>
    );
};

export default ExpertDashboardRoute;
