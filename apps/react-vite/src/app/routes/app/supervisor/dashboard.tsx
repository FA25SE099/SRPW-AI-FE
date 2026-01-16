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
                    Chào mừng, {user.data?.firstName} {user.data?.lastName}!
                </h2>
                <p className="mt-2 text-gray-600">
                    Vai trò: <span className="font-medium">{user.data?.role}</span>
                </p>
                <p className="mt-1 text-sm text-gray-500">
                    Quản lý nhóm, điều phối nông dân và theo dõi kế hoạch sản xuất.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Tổng Nông Dân"
                    value="24"
                    subtitle="Trong nhóm của bạn"
                    icon={Users}
                    color="bg-blue-600"
                />
                <StatCard
                    title="Tổng Diện Tích"
                    value="45.8 ha"
                    subtitle="Trên 32 thửa đất"
                    icon={MapPin}
                    color="bg-green-600"
                />
                <StatCard
                    title="Kế Hoạch Hoạt Động"
                    value="3"
                    subtitle="Đang thực hiện"
                    icon={Calendar}
                    color="bg-purple-600"
                />
                <StatCard
                    title="Chờ Duyệt"
                    value="2"
                    subtitle="Đang chờ chuyên gia xem xét"
                    icon={Clock}
                    color="bg-orange-600"
                />
            </div>

            {/* Quick Actions */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-gray-900">
                    Hành Động Nhanh
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
                            <p className="font-medium text-gray-900">Tạo Kế Hoạch</p>
                            <p className="text-xs text-gray-500">Kế hoạch sản xuất mới</p>
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
                            <p className="font-medium text-gray-900">Xem Chi Tiết Nhóm</p>
                            <p className="text-xs text-gray-500">Thông tin nông dân & thửa đất</p>
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
                            <p className="font-medium text-gray-900">Xem Báo Cáo</p>
                            <p className="text-xs text-gray-500">Phân tích hiệu suất</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Group Summary */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-bold text-gray-900">
                        Tóm Tắt Nhóm
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                            <div>
                                <p className="text-sm font-medium text-gray-700">Mã Nhóm</p>
                                <p className="text-xs text-gray-500">G-034</p>
                            </div>
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                Hoạt Động
                            </span>
                        </div>
                        <div className="flex items-center justify-between border-b pb-3">
                            <div>
                                <p className="text-sm font-medium text-gray-700">Khu Vực</p>
                                <p className="text-xs text-gray-500">Tỉnh An Giang</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between border-b pb-3">
                            <div>
                                <p className="text-sm font-medium text-gray-700">Thành Viên</p>
                                <p className="text-xs text-gray-500">24 nông dân</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-700">Tổng Diện Tích</p>
                                <p className="text-xs text-gray-500">45.8 hécta</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Current Season Plans */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-bold text-gray-900">
                        Kế Hoạch Mùa Hiện Tại
                    </h2>
                    <div className="space-y-3">
                        <div className="rounded-lg border border-gray-200 p-4">
                            <div className="mb-2 flex items-start justify-between">
                                <div>
                                    <h4 className="font-semibold text-gray-900">Mùa Đông Xuân 2024</h4>
                                    <p className="text-xs text-gray-500">Giống Lúa OM5451</p>
                                </div>
                                <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                                    Đã Duyệt
                                </span>
                            </div>
                            <div className="text-xs text-gray-600">
                                <p>Diện tích: 45.8 ha • Bắt đầu: 15/01/2024</p>
                                <p className="mt-1">Giai đoạn: Sinh Trưởng (Ngày 45/120)</p>
                            </div>
                        </div>
                        <div className="rounded-lg border border-gray-200 p-4">
                            <div className="mb-2 flex items-start justify-between">
                                <div>
                                    <h4 className="font-semibold text-gray-900">Kế Hoạch Khẩn Cấp</h4>
                                    <p className="text-xs text-gray-500">Ứng Phó Kiểm Soát Sâu Bệnh</p>
                                </div>
                                <span className="rounded bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
                                    Chờ Duyệt
                                </span>
                            </div>
                            <div className="text-xs text-gray-600">
                                <p>Gửi: 2 giờ trước</p>
                                <p className="mt-1">Đang chờ chuyên gia phê duyệt</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-gray-900">
                    Hoạt Động Gần Đây
                </h2>
                <div className="space-y-4">
                    {[
                        {
                            action: 'Kế hoạch sản xuất đã được duyệt',
                            target: 'Kế Hoạch Mùa Đông Xuân 2024',
                            time: '2 giờ trước',
                            status: 'success',
                        },
                        {
                            action: 'Đã gửi kế hoạch khẩn cấp',
                            target: 'Ứng Phó Kiểm Soát Sâu Bệnh',
                            time: '2 giờ trước',
                            status: 'warning',
                        },
                        {
                            action: 'Nông dân báo cáo tiến độ',
                            target: 'Nguyễn Văn C - Thửa A-12',
                            time: '5 giờ trước',
                            status: 'info',
                        },
                        {
                            action: 'Đã hoàn thành nhiệm vụ',
                            target: 'Bón Phân - Giai Đoạn 2',
                            time: '1 ngày trước',
                            status: 'success',
                        },
                        {
                            action: 'Đã đặt hàng vật tư',
                            target: 'Phân NPK - 500kg',
                            time: '2 ngày trước',
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
                    <h2 className="text-lg font-bold text-gray-900">Thông Tin Nhóm</h2>
                    <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700">
                        Chỉnh Sửa Nhóm
                    </button>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <p className="text-sm font-medium text-gray-700">Mã Nhóm</p>
                        <p className="mt-1 text-base text-gray-900">G-034</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-700">Trạng Thái</p>
                        <p className="mt-1">
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                Hoạt Động
                            </span>
                        </p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-700">Khu Vực</p>
                        <p className="mt-1 text-base text-gray-900">Tỉnh An Giang</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-700">Cụm</p>
                        <p className="mt-1 text-base text-gray-900">Cụm Đồng Bằng Sông Cửu Long 1</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-700">Tổng Nông Dân</p>
                        <p className="mt-1 text-base text-gray-900">24 thành viên</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-700">Tổng Diện Tích</p>
                        <p className="mt-1 text-base text-gray-900">45.8 hecta</p>
                    </div>
                </div>
            </div>

            {/* Farmers List */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">Nông Dân Trong Nhóm</h2>
                    <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50">
                        Thêm Nông Dân
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-gray-200 bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">
                                    Tên Nông Dân
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">
                                    Thửa Đất
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">
                                    Tổng Diện Tích
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">
                                    Trạng Thái
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">
                                    Hành Động
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
                                            Xem Chi Tiết
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
                <h2 className="mb-4 text-lg font-bold text-gray-900">Tổng Quan Thửa Đất</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-lg border border-gray-200 p-4">
                        <p className="text-sm font-medium text-gray-600">Tổng Thửa Đất</p>
                        <p className="mt-1 text-2xl font-bold text-gray-900">32</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4">
                        <p className="text-sm font-medium text-gray-600">Thửa Đất Hoạt Động</p>
                        <p className="mt-1 text-2xl font-bold text-green-600">28</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4">
                        <p className="text-sm font-medium text-gray-600">Thửa Đất Trống</p>
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
                    <h2 className="text-lg font-bold text-gray-900">Kế Hoạch Sản Xuất</h2>
                    <button
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
                        onClick={() => navigate(paths.app.supervisor.group.getHref())}
                    >
                        Tạo Kế Hoạch Mới
                    </button>
                </div>

                {/* Plans List */}
                <div className="space-y-4">
                    {[
                        {
                            name: 'Vụ Đông Xuân 2024',
                            variety: 'OM5451',
                            area: '45.8 ha',
                            startDate: '15 tháng 1, 2024',
                            status: 'Đã Duyệt',
                            progress: 'Ngày 45/120',
                            statusColor: 'green',
                        },
                        {
                            name: 'Kế Hoạch Khẩn Cấp Kiểm Soát Sâu Bệnh',
                            variety: 'Không có',
                            area: '12.3 ha',
                            startDate: '1 tháng 3, 2024',
                            status: 'Chờ Duyệt',
                            progress: 'Đang chờ phê duyệt',
                            statusColor: 'orange',
                        },
                        {
                            name: 'Vụ Hè Thu 2024 (Bản Nháp)',
                            variety: 'IR50404',
                            area: '45.8 ha',
                            startDate: '1 tháng 5, 2024',
                            status: 'Bản Nháp',
                            progress: 'Giai đoạn lên kế hoạch',
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
                                        Giống Lúa: {plan.variety} • Diện tích: {plan.area}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Ngày Bắt Đầu: {plan.startDate}
                                    </p>
                                    <p className="text-xs text-gray-500">{plan.progress}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="flex-1 rounded bg-blue-600 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-700">
                                    Xem Chi Tiết
                                </button>
                                <button className="rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50">
                                    Chỉnh Sửa
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
                <h2 className="mb-4 text-lg font-bold text-gray-900">Báo Cáo & Phân Tích</h2>

                {/* Key Metrics */}
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-lg bg-blue-50 p-4">
                        <p className="text-sm font-medium text-blue-900">Năng Suất Trung Bình/Ha</p>
                        <p className="mt-1 text-2xl font-bold text-blue-600">6.8 tấn</p>
                        <p className="mt-1 text-xs text-blue-700">+12% so với mùa trước</p>
                    </div>
                    <div className="rounded-lg bg-green-50 p-4">
                        <p className="text-sm font-medium text-green-900">Tỷ Lệ Thành Công</p>
                        <p className="mt-1 text-2xl font-bold text-green-600">87%</p>
                        <p className="mt-1 text-xs text-green-700">Mục tiêu: 85%</p>
                    </div>
                    <div className="rounded-lg bg-purple-50 p-4">
                        <p className="text-sm font-medium text-purple-900">Hiệu Quả Chi Phí</p>
                        <p className="mt-1 text-2xl font-bold text-purple-600">93%</p>
                        <p className="mt-1 text-xs text-purple-700">Trong ngân sách</p>
                    </div>
                </div>

                {/* Reports List */}
                <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">Các Báo Cáo Khả Dụng</h3>
                    {[
                        { name: 'Tổng Kết Sản Xuất Tháng', date: 'Tháng 3 2024', type: 'PDF' },
                        { name: 'Phân Tích Hiệu Suất Nông Dân', date: 'Q1 2024', type: 'Excel' },
                        { name: 'Báo Cáo Sử Dụng Vật Liệu', date: 'Tháng 2 2024', type: 'PDF' },
                        { name: 'Báo Cáo So Sánh Năng Suất', date: '2023-2024', type: 'PDF' },
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
                                Tải Xuống
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
        { id: 'overview', label: 'Tổng Quan', icon: TrendingUp },
        { id: 'group', label: 'Quản Lý Nhóm', icon: Users },
        { id: 'plans', label: 'Kế Hoạch Sản Xuất', icon: Calendar },
        { id: 'reports', label: 'Báo Cáo', icon: CheckCircle },
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
        <ContentLayout title="Bảng Điều Khiển Giám Sát Viên">
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
