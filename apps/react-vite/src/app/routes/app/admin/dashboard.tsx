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
          <p className="mt-2 text-xs font-medium text-green-600">↑ {trend}</p>
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

const ActivityItem = ({
  user,
  action,
  target,
  time,
  status,
}: ActivityItemProps) => (
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
    <ContentLayout title="Trang quản trị - Tổng quan">
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
          title="Tổng người dùng"
          value="1,248"
          subtitle="125 hoạt động hôm nay"
          icon={Users}
          color="bg-blue-600"
          trend="+12.5% so với tháng trước"
        />
        <StatCard
          title="Sức khỏe hệ thống"
          value="98.5%"
          subtitle="Tất cả dịch vụ hoạt động"
          icon={Activity}
          color="bg-green-600"
        />
        <StatCard
          title="Đang chờ duyệt"
          value="23"
          subtitle="Cần chú ý"
          icon={AlertCircle}
          color="bg-orange-600"
        />
        <StatCard
          title="Phiên đang hoạt động"
          value="342"
          subtitle="Cao điểm: 456 lúc 2PM"
          icon={TrendingUp}
          color="bg-purple-600"
        />
      </div>

      {/* Two Column Layout */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-900">
            Thao tác nhanh
          </h2>
          <div className="space-y-3">
            <QuickAction
              title="Quản lý người dùng"
              description="Xem và chỉnh sửa tài khoản người dùng"
              icon={Users}
              iconColor="text-blue-600"
            />
            <QuickAction
              title="Quản lý vai trò"
              description="Cấu hình quyền hạn"
              icon={Shield}
              iconColor="text-purple-600"
            />
            <QuickAction
              title="Cài đặt hệ thống"
              description="Cấu hình ứng dụng"
              icon={Settings}
              iconColor="text-gray-600"
            />
            <QuickAction
              title="Xem báo cáo"
              description="Phân tích và thống kê"
              icon={BarChart3}
              iconColor="text-green-600"
            />
          </div>
        </div>

        {/* System Alerts */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">
              Cảnh báo hệ thống
            </h2>
            <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
              2 Nguy hiểm
            </span>
          </div>
          <div className="space-y-3">
            <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900">
                    Sử dụng bộ nhớ cao
                  </h4>
                  <p className="text-xs text-gray-600">
                    Bộ nhớ máy chủ ở mức 92%
                  </p>
                  <span className="text-xs text-gray-500">10 phút trước</span>
                </div>
              </div>
            </div>
            <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-3">
              <div className="flex items-start gap-2">
                <Database className="h-5 w-5 text-red-600" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900">
                    Sự cố kết nối cơ sở dữ liệu
                  </h4>
                  <p className="text-xs text-gray-600">
                    Phát hiện hết thời gian kết nối không ổn định
                  </p>
                  <span className="text-xs text-gray-500">25 phút trước</span>
                </div>
              </div>
            </div>
            <div className="rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900">
                    Sao lưu chờ xử lý
                  </h4>
                  <p className="text-xs text-gray-600">
                    Database backup overdue
                  </p>
                  <span className="text-xs text-gray-500">2h ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-gray-900">
          Hoạt động gần đây
        </h2>
        <div className="space-y-4">
          <ActivityItem
            user="Quản trị viên John"
            action="đã cập nhật quyền người dùng cho"
            target="Nhóm chuyên gia #5"
            time="5 phút trước"
            status="success"
          />
          <ActivityItem
            user="Quản lý Sarah"
            action="đã tạo giống lúa mới"
            target="OM6976 Năng suất cao"
            time="1 giờ trước"
            status="info"
          />
          <ActivityItem
            user="Giám sát viên Mike"
            action="đã từ chối yêu cầu phê duyệt"
            target="Nhóm G-045"
            time="2 giờ trước"
            status="warning"
          />
          <ActivityItem
            user="Hệ thống"
            action="sao lưu tự động hoàn tất"
            target="Sao lưu cơ sở dữ liệu thành công"
            time="3 giờ trước"
            status="success"
          />
          <ActivityItem
            user="Quản trị viên"
            action="đã cập nhật cài đặt hệ thống"
            target="Cấu hình thông báo email"
            time="5 giờ trước"
            status="info"
          />
          <ActivityItem
            user="Hệ thống"
            action="quét bảo mật hoàn tất"
            target="Không phát hiện lỗ hổng"
            time="1 ngày trước"
            status="success"
          />
        </div>
      </div>
    </ContentLayout>
  );
};

export default AdminDashboardRoute;
