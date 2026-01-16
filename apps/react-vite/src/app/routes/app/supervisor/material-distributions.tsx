import { useSearchParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

import { ContentLayout } from '@/components/layouts';
import { Authorization, ROLES } from '@/lib/authorization';
import { useUser } from '@/lib/auth';
import { Spinner } from '@/components/ui/spinner';
import { GroupedDistributionDashboard } from '@/features/material-distribution';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const MaterialDistributionsRoute = () => {
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get('groupId');
  const user = useUser();

  return (
    <Authorization
      forbiddenFallback={<div>Only supervisors can view this page.</div>}
      allowedRoles={[ROLES.Supervisor]}
    >
      <ContentLayout title="Phân Phối Vật Tư">
        {user.isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : !groupId ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Chưa Chọn Nhóm</AlertTitle>
            <AlertDescription>
              Vui lòng chọn một nhóm để xem phân phối vật tư. Bạn có thể truy cập
              trang này từ bảng điều khiển quản lý nhóm của bạn.
            </AlertDescription>
          </Alert>
        ) : !user.data?.id ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Lỗi</AlertTitle>
            <AlertDescription>
              Không thể tải thông tin người dùng. Vui lòng thử làm mới trang.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            {/* Description */}
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm text-gray-600">
                Quản lý và theo dõi phân phối vật tư cho nhóm của bạn. Xác nhận
                phân phối và giám sát xác nhận của nông dân.
              </p>
            </div>

            {/* Dashboard */}
            <GroupedDistributionDashboard
              groupId={groupId}
              supervisorId={user.data.id}
            />
          </div>
        )}
      </ContentLayout>
    </Authorization>
  );
};

export default MaterialDistributionsRoute;

