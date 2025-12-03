import {
    Users,
    Calendar,
    AlertCircle,
    CheckCircle,
    Clock,
    TrendingUp,
    MapPin,
    Activity,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ContentLayout } from '@/components/layouts';
import { Tabs } from '@/components/ui/tabs';
import { Tab } from '@/components/ui/tabs/tabs';
import { useUser } from '@/lib/auth';
import { paths } from '@/config/paths';

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

// Overview Tab Content
const OverviewTab = () => {
    const user = useUser();
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            {/* User Info Section */}
            <div className="rounded-lg border bg-white p-6">
                <h2 className="text-lg font-semibold text-gray-900">
                    Welcome, {user.data?.firstName} {user.data?.lastName}!
                </h2>
                <p className="mt-2 text-gray-600">
                    Role: <span className="font-medium">{user.data?.role}</span>
                </p>
                <p className="mt-1 text-sm text-gray-500">
                    Manage your group, coordinate farmers, and monitor production plans.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Farmers"
                    value="24"
                    subtitle="In your group"
                    icon={Users}
                    color="bg-blue-600"
                />
                <StatCard
                    title="Total Area"
                    value="45.8 ha"
                    subtitle="Across 32 plots"
                    icon={MapPin}
                    color="bg-green-600"
                />
                <StatCard
                    title="Active Plans"
                    value="3"
                    subtitle="Currently running"
                    icon={Calendar}
                    color="bg-purple-600"
                />
                <StatCard
                    title="Pending Approvals"
                    value="2"
                    subtitle="Awaiting expert review"
                    icon={Clock}
                    color="bg-orange-600"
                />
            </div>

            {/* Quick Actions */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-gray-900">
                    Quick Actions
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <button
                        className="flex items-center gap-3 rounded-lg border border-gray-300 p-4 text-left transition-colors hover:bg-gray-50"
                        onClick={() => navigate(paths.app.supervisor.group.getHref())}
                    >
                        <div className="rounded-lg bg-blue-100 p-2">
                            <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">Create Plan</p>
                            <p className="text-xs text-gray-500">New production plan</p>
                        </div>
                    </button>
                    <button
                        className="flex items-center gap-3 rounded-lg border border-gray-300 p-4 text-left transition-colors hover:bg-gray-50"
                        onClick={() => navigate(paths.app.supervisor.group.getHref())}
                    >
                        <div className="rounded-lg bg-green-100 p-2">
                            <Activity className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">View Group Details</p>
                            <p className="text-xs text-gray-500">Farmers & plots info</p>
                        </div>
                    </button>
                    <button
                        className="flex items-center gap-3 rounded-lg border border-gray-300 p-4 text-left transition-colors hover:bg-gray-50"
                        onClick={() => navigate(paths.app.supervisor.reports.getHref())}
                    >
                        <div className="rounded-lg bg-purple-100 p-2">
                            <TrendingUp className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">View Reports</p>
                            <p className="text-xs text-gray-500">Performance analytics</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Group Summary */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-bold text-gray-900">
                        Group Summary
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                            <div>
                                <p className="text-sm font-medium text-gray-700">Group ID</p>
                                <p className="text-xs text-gray-500">G-034</p>
                            </div>
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                Active
                            </span>
                        </div>
                        <div className="flex items-center justify-between border-b pb-3">
                            <div>
                                <p className="text-sm font-medium text-gray-700">Region</p>
                                <p className="text-xs text-gray-500">An Giang Province</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between border-b pb-3">
                            <div>
                                <p className="text-sm font-medium text-gray-700">Members</p>
                                <p className="text-xs text-gray-500">24 farmers</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-700">Total Land</p>
                                <p className="text-xs text-gray-500">45.8 hectares</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Current Season Plans */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-bold text-gray-900">
                        Current Season Plans
                    </h2>
                    <div className="space-y-3">
                        <div className="rounded-lg border border-gray-200 p-4">
                            <div className="mb-2 flex items-start justify-between">
                                <div>
                                    <h4 className="font-semibold text-gray-900">Winter-Spring 2024</h4>
                                    <p className="text-xs text-gray-500">OM5451 Rice Variety</p>
                                </div>
                                <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                                    Approved
                                </span>
                            </div>
                            <div className="text-xs text-gray-600">
                                <p>Area: 45.8 ha • Started: Jan 15, 2024</p>
                                <p className="mt-1">Stage: Growth Phase (Day 45/120)</p>
                            </div>
                        </div>
                        <div className="rounded-lg border border-gray-200 p-4">
                            <div className="mb-2 flex items-start justify-between">
                                <div>
                                    <h4 className="font-semibold text-gray-900">Emergency Plan</h4>
                                    <p className="text-xs text-gray-500">Pest Control Response</p>
                                </div>
                                <span className="rounded bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
                                    Pending
                                </span>
                            </div>
                            <div className="text-xs text-gray-600">
                                <p>Submitted: 2 hours ago</p>
                                <p className="mt-1">Awaiting expert approval</p>
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
                    {[
                        {
                            action: 'Production plan approved',
                            target: 'Winter-Spring 2024 Plan',
                            time: '2h ago',
                            status: 'success',
                        },
                        {
                            action: 'Emergency plan submitted',
                            target: 'Pest Control Response',
                            time: '2h ago',
                            status: 'warning',
                        },
                        {
                            action: 'Farmer reported progress',
                            target: 'Nguyen Van C - Plot A-12',
                            time: '5h ago',
                            status: 'info',
                        },
                        {
                            action: 'Task completed',
                            target: 'Fertilizer Application - Stage 2',
                            time: '1d ago',
                            status: 'success',
                        },
                        {
                            action: 'Material order placed',
                            target: 'NPK Fertilizer - 500kg',
                            time: '2d ago',
                            status: 'info',
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
        </div>
    );
};

// Group Management Tab Content
const GroupTab = () => {
    return (
        <div className="space-y-6">
            {/* Group Info Card */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">Group Information</h2>
                    <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700">
                        Edit Group
                    </button>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <p className="text-sm font-medium text-gray-700">Group ID</p>
                        <p className="mt-1 text-base text-gray-900">G-034</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-700">Status</p>
                        <p className="mt-1">
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                Active
                            </span>
                        </p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-700">Region</p>
                        <p className="mt-1 text-base text-gray-900">An Giang Province</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-700">Cluster</p>
                        <p className="mt-1 text-base text-gray-900">Mekong Delta Cluster 1</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-700">Total Farmers</p>
                        <p className="mt-1 text-base text-gray-900">24 members</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-700">Total Area</p>
                        <p className="mt-1 text-base text-gray-900">45.8 hectares</p>
                    </div>
                </div>
            </div>

            {/* Farmers List */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">Farmers in Group</h2>
                    <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50">
                        Add Farmer
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-gray-200 bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">
                                    Farmer Name
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">
                                    Plots
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">
                                    Total Area
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {[
                                { name: 'Nguyen Van A', plots: 2, area: '3.2 ha', status: 'Active' },
                                { name: 'Tran Thi B', plots: 1, area: '1.8 ha', status: 'Active' },
                                { name: 'Le Van C', plots: 3, area: '4.5 ha', status: 'Active' },
                                { name: 'Pham Thi D', plots: 1, area: '2.1 ha', status: 'Active' },
                            ].map((farmer, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                        {farmer.name}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {farmer.plots}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {farmer.area}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                                            {farmer.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button className="text-sm text-blue-600 hover:text-blue-700">
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Plots Overview */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-gray-900">Plots Overview</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-lg border border-gray-200 p-4">
                        <p className="text-sm font-medium text-gray-600">Total Plots</p>
                        <p className="mt-1 text-2xl font-bold text-gray-900">32</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4">
                        <p className="text-sm font-medium text-gray-600">Active Plots</p>
                        <p className="mt-1 text-2xl font-bold text-green-600">28</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4">
                        <p className="text-sm font-medium text-gray-600">Idle Plots</p>
                        <p className="mt-1 text-2xl font-bold text-gray-400">4</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Plans Tab Content
const PlansTab = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">Production Plans</h2>
                    <button
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
                        onClick={() => navigate(paths.app.supervisor.group.getHref())}
                    >
                        Create New Plan
                    </button>
                </div>

                {/* Plans List */}
                <div className="space-y-4">
                    {[
                        {
                            name: 'Winter-Spring 2024',
                            variety: 'OM5451',
                            area: '45.8 ha',
                            startDate: 'Jan 15, 2024',
                            status: 'Approved',
                            progress: 'Day 45/120',
                            statusColor: 'green',
                        },
                        {
                            name: 'Emergency Pest Control',
                            variety: 'N/A',
                            area: '12.3 ha',
                            startDate: 'Mar 1, 2024',
                            status: 'Pending',
                            progress: 'Awaiting approval',
                            statusColor: 'orange',
                        },
                        {
                            name: 'Summer-Autumn 2024 (Draft)',
                            variety: 'IR50404',
                            area: '45.8 ha',
                            startDate: 'May 1, 2024',
                            status: 'Draft',
                            progress: 'Planning phase',
                            statusColor: 'gray',
                        },
                    ].map((plan, idx) => (
                        <div
                            key={idx}
                            className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
                        >
                            <div className="mb-3 flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="mb-1 flex items-center gap-2">
                                        <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                                        <span
                                            className={`rounded px-2 py-0.5 text-xs font-medium ${plan.statusColor === 'green'
                                                ? 'bg-green-100 text-green-700'
                                                : plan.statusColor === 'orange'
                                                    ? 'bg-orange-100 text-orange-700'
                                                    : 'bg-gray-100 text-gray-700'
                                                }`}
                                        >
                                            {plan.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Rice Variety: {plan.variety} • Area: {plan.area}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Start Date: {plan.startDate}
                                    </p>
                                    <p className="text-xs text-gray-500">{plan.progress}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="flex-1 rounded bg-blue-600 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-700">
                                    View Details
                                </button>
                                <button className="rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50">
                                    Edit
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Reports Tab Content
const ReportsTab = () => {
    return (
        <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-gray-900">Reports & Analytics</h2>

                {/* Key Metrics */}
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-lg bg-blue-50 p-4">
                        <p className="text-sm font-medium text-blue-900">Avg Yield/Ha</p>
                        <p className="mt-1 text-2xl font-bold text-blue-600">6.8 tons</p>
                        <p className="mt-1 text-xs text-blue-700">+12% vs last season</p>
                    </div>
                    <div className="rounded-lg bg-green-50 p-4">
                        <p className="text-sm font-medium text-green-900">Plan Success Rate</p>
                        <p className="mt-1 text-2xl font-bold text-green-600">87%</p>
                        <p className="mt-1 text-xs text-green-700">Target: 85%</p>
                    </div>
                    <div className="rounded-lg bg-purple-50 p-4">
                        <p className="text-sm font-medium text-purple-900">Cost Efficiency</p>
                        <p className="mt-1 text-2xl font-bold text-purple-600">93%</p>
                        <p className="mt-1 text-xs text-purple-700">Within budget</p>
                    </div>
                </div>

                {/* Reports List */}
                <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">Available Reports</h3>
                    {[
                        { name: 'Monthly Production Summary', date: 'March 2024', type: 'PDF' },
                        { name: 'Farmer Performance Analysis', date: 'Q1 2024', type: 'Excel' },
                        { name: 'Material Usage Report', date: 'Feb 2024', type: 'PDF' },
                        { name: 'Yield Comparison Report', date: '2023-2024', type: 'PDF' },
                    ].map((report, idx) => (
                        <div
                            key={idx}
                            className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
                        >
                            <div>
                                <p className="font-medium text-gray-900">{report.name}</p>
                                <p className="text-xs text-gray-500">
                                    {report.date} • {report.type}
                                </p>
                            </div>
                            <button className="rounded bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700">
                                Download
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const SupervisorDashboardRoute = () => {
    const [activeTab, setActiveTab] = useState('overview');

    const tabs = [
        { id: 'overview', label: 'Overview', icon: TrendingUp },
        { id: 'group', label: 'Group Management', icon: Users },
        { id: 'plans', label: 'Production Plans', icon: Calendar },
        { id: 'reports', label: 'Reports', icon: CheckCircle },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return <OverviewTab />;
            case 'group':
                return <GroupTab />;
            case 'plans':
                return <PlansTab />;
            case 'reports':
                return <ReportsTab />;
            default:
                return <OverviewTab />;
        }
    };

    return (
        <ContentLayout title="Supervisor Dashboard">
            <div className="space-y-6">
                {/* Custom Tab Navigation */}
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 border-b-2 py-2 px-1 text-sm font-medium ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="mt-6">
                    {renderTabContent()}
                </div>
            </div>
        </ContentLayout>
    );
};

export default SupervisorDashboardRoute;
