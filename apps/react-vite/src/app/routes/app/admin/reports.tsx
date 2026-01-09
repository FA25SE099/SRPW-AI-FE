import { BarChart3, TrendingUp, Users, Activity, Download } from 'lucide-react';
import { ContentLayout } from '@/components/layouts';

type ReportCardProps = {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  lastGenerated: string;
};

const ReportCard = ({
  title,
  description,
  icon: Icon,
  color,
  lastGenerated,
}: ReportCardProps) => (
  <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
    <div className="mb-4 flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div className={`rounded-lg p-2 ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>

    <div className="mb-4 text-xs text-gray-500">
      Lần tạo cuối: {lastGenerated}
    </div>

    <div className="flex gap-2">
      <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
        <Download className="h-4 w-4" />
        Tải xuống
      </button>
      <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
        Xem
      </button>
    </div>
  </div>
);

const AdminReportsRoute = () => {
  return (
    <ContentLayout title="Báo cáo & Phân tích">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Tạo và tải xuống các báo cáo hệ thống
          </p>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Tạo báo cáo tùy chỉnh
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm text-gray-600">Tổng báo cáo</p>
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">247</p>
            <p className="text-xs text-gray-500">+12 tháng này</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm text-gray-600">Lượt tải</p>
              <Download className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">1,432</p>
            <p className="text-xs text-gray-500">+56 tuần này</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm text-gray-600">Đã lên lịch</p>
              <Activity className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">8</p>
            <p className="text-xs text-gray-500">Lịch hoạt động</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm text-gray-600">Dung lượng sử dụng</p>
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">4.2 GB</p>
            <p className="text-xs text-gray-500">trong 10 GB</p>
          </div>
        </div>

        {/* System Reports */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Báo cáo hệ thống
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ReportCard
              title="Báo cáo hoạt động người dùng"
              description="Thống kê chi tiết về sự tham gia và hoạt động của người dùng"
              icon={Users}
              color="bg-blue-600"
              lastGenerated="2 giờ trước"
            />

            <ReportCard
              title="Hiệu suất hệ thống"
              description="Sức khỏe máy chủ, thời gian phản hồi và thời gian hoạt động"
              icon={Activity}
              color="bg-green-600"
              lastGenerated="1 ngày trước"
            />

            <ReportCard
              title="Kiểm toán bảo mật"
              description="Thử đăng nhập, xác thực thất bại và mối đe dọa"
              icon={BarChart3}
              color="bg-red-600"
              lastGenerated="3 ngày trước"
            />

            <ReportCard
              title="Thống kê sử dụng"
              description="Sử dụng tính năng, trang phổ biến và hành vi người dùng"
              icon={TrendingUp}
              color="bg-purple-600"
              lastGenerated="1 tuần trước"
            />
          </div>
        </div>

        {/* Agricultural Reports */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Báo cáo nông nghiệp
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ReportCard
              title="Kế hoạch canh tác"
              description="Tóm tắt tất cả các kế hoạch đã duyệt và chờ duyệt"
              icon={BarChart3}
              color="bg-green-600"
              lastGenerated="Hôm nay"
            />

            <ReportCard
              title="Sử dụng vật tư"
              description="Thuốc trừ sâu, phân bón và tiêu thụ vật tư"
              icon={Activity}
              color="bg-orange-600"
              lastGenerated="Hôm qua"
            />

            <ReportCard
              title="Hiệu suất giống lúa"
              description="Dữ liệu năng suất và so sánh giống"
              icon={TrendingUp}
              color="bg-blue-600"
              lastGenerated="3 ngày trước"
            />

            <ReportCard
              title="Phê duyệt của chuyên gia"
              description="Tỉ lệ phê duyệt, thời gian phản hồi và từ chối"
              icon={Users}
              color="bg-purple-600"
              lastGenerated="1 tuần trước"
            />
          </div>
        </div>

        {/* Scheduled Reports */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Báo cáo theo lịch
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
              <div>
                <p className="font-medium text-gray-900">
                  Sức khỏe hệ thống hàng ngày
                </p>
                <p className="text-sm text-gray-600">
                  Tạo hàng ngày lúc 6:00 AM
                </p>
              </div>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                Hoạt động
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
              <div>
                <p className="font-medium text-gray-900">
                  Phân tích người dùng hàng tuần
                </p>
                <p className="text-sm text-gray-600">
                  Tạo mỗi thứ Hai lúc 8:00 AM
                </p>
              </div>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                Hoạt động
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
              <div>
                <p className="font-medium text-gray-900">
                  Tóm tắt tài chính hàng tháng
                </p>
                <p className="text-sm text-gray-600">
                  Tạo ngày 1 hàng tháng lúc 9:00 AM
                </p>
              </div>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                Hoạt động
              </span>
            </div>
          </div>
        </div>
      </div>
    </ContentLayout>
  );
};

export default AdminReportsRoute;
