import { useState } from 'react';
import { ContentLayout } from '@/components/layouts';
import { SupervisorsPanel } from './component/supervisors-panel';
import { FarmersPanel } from './component/farmers-panel';
import { ClusterManagersPanel } from './component/cluster-managers-panel';
import { AgronomyExpertsPanel } from './component/agronomy-experts-panel';
import { UavVendorsPanel } from './component/uav-vendors-panel';

const RolesManager = () => {
  const [activeRole, setActiveRole] = useState<
    'supervisors' | 'farmers' | 'managers' | 'experts' | 'vendors'
  >('supervisors');

  return (
    <ContentLayout title="Quản lý vai trò">
      <div className="space-y-6">
        {/* Role Selection Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <button
            className={`border rounded-lg p-6 text-left hover:shadow-md transition-shadow ${
              activeRole === 'supervisors'
                ? 'ring-2 ring-blue-500 bg-blue-50'
                : 'bg-white'
            }`}
            onClick={() => setActiveRole('supervisors')}
          >
            <div className="font-semibold text-lg">Giám sát viên</div>
            <div className="text-sm text-gray-500 mt-1">
              Tạo và quản lý giám sát viên
            </div>
          </button>

          <button
            className={`border rounded-lg p-6 text-left hover:shadow-md transition-shadow ${
              activeRole === 'farmers'
                ? 'ring-2 ring-blue-500 bg-blue-50'
                : 'bg-white'
            }`}
            onClick={() => setActiveRole('farmers')}
          >
            <div className="font-semibold text-lg">Nông dân</div>
            <div className="text-sm text-gray-500 mt-1">
              Xem và quản lý tất cả nông dân
            </div>
          </button>

          <button
            className={`border rounded-lg p-6 text-left hover:shadow-md transition-shadow ${
              activeRole === 'managers'
                ? 'ring-2 ring-blue-500 bg-blue-50'
                : 'bg-white'
            }`}
            onClick={() => setActiveRole('managers')}
          >
            <div className="font-semibold text-lg">Quản lý cụm</div>
            <div className="text-sm text-gray-500 mt-1">
              Tạo và phân công quản lý
            </div>
          </button>

          <button
            className={`border rounded-lg p-6 text-left hover:shadow-md transition-shadow ${
              activeRole === 'experts'
                ? 'ring-2 ring-blue-500 bg-blue-50'
                : 'bg-white'
            }`}
            onClick={() => setActiveRole('experts')}
          >
            <div className="font-semibold text-lg">Chuyên gia nông học</div>
            <div className="text-sm text-gray-500 mt-1">
              Tạo và phân công chuyên gia nông học
            </div>
          </button>

          <button
            className={`border rounded-lg p-6 text-left hover:shadow-md transition-shadow ${
              activeRole === 'vendors'
                ? 'ring-2 ring-blue-500 bg-blue-50'
                : 'bg-white'
            }`}
            onClick={() => setActiveRole('vendors')}
          >
            <div className="font-semibold text-lg">Nhà cung cấp UAV</div>
            <div className="text-sm text-gray-500 mt-1">
              Tạo và quản lý nhà cung cấp UAV
            </div>
          </button>
        </div>

        {/* Panels */}
        {activeRole === 'supervisors' && <SupervisorsPanel />}
        {activeRole === 'farmers' && <FarmersPanel />}
        {activeRole === 'managers' && <ClusterManagersPanel />}
        {activeRole === 'experts' && <AgronomyExpertsPanel />}
        {activeRole === 'vendors' && <UavVendorsPanel />}
      </div>
    </ContentLayout>
  );
};

export default RolesManager;
