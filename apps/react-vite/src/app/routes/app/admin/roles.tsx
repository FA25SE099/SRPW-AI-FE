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
    <ContentLayout title="Management Roles">
      <div className="space-y-6">
        {/* Role Selection Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <button
            className={`border rounded-lg p-6 text-left hover:shadow-md transition-shadow ${activeRole === 'supervisors'
              ? 'ring-2 ring-blue-500 bg-blue-50'
              : 'bg-white'
              }`}
            onClick={() => setActiveRole('supervisors')}
          >
            <div className="font-semibold text-lg">Supervisors</div>
            <div className="text-sm text-gray-500 mt-1">
              Create and manage supervisors
            </div>
          </button>

          <button
            className={`border rounded-lg p-6 text-left hover:shadow-md transition-shadow ${activeRole === 'farmers'
              ? 'ring-2 ring-blue-500 bg-blue-50'
              : 'bg-white'
              }`}
            onClick={() => setActiveRole('farmers')}
          >
            <div className="font-semibold text-lg">Farmers</div>
            <div className="text-sm text-gray-500 mt-1">
              View and manage all farmers
            </div>
          </button>

          <button
            className={`border rounded-lg p-6 text-left hover:shadow-md transition-shadow ${activeRole === 'managers'
              ? 'ring-2 ring-blue-500 bg-blue-50'
              : 'bg-white'
              }`}
            onClick={() => setActiveRole('managers')}
          >
            <div className="font-semibold text-lg">Cluster Managers</div>
            <div className="text-sm text-gray-500 mt-1">
              Create and assign managers
            </div>
          </button>

          <button
            className={`border rounded-lg p-6 text-left hover:shadow-md transition-shadow ${activeRole === 'experts'
              ? 'ring-2 ring-blue-500 bg-blue-50'
              : 'bg-white'
              }`}
            onClick={() => setActiveRole('experts')}
          >
            <div className="font-semibold text-lg">Agronomy Experts</div>
            <div className="text-sm text-gray-500 mt-1">
              Create and assign experts
            </div>
          </button>

          <button
            className={`border rounded-lg p-6 text-left hover:shadow-md transition-shadow ${activeRole === 'vendors'
              ? 'ring-2 ring-blue-500 bg-blue-50'
              : 'bg-white'
              }`}
            onClick={() => setActiveRole('vendors')}
          >
            <div className="font-semibold text-lg">UAV Vendors</div>
            <div className="text-sm text-gray-500 mt-1">
              Create and manage UAV vendors
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
