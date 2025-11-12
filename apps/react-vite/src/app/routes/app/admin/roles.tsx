import { Shield, Users, CheckCircle } from 'lucide-react';
import { ContentLayout } from '@/components/layouts';

type RoleCardProps = {
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
  color: string;
};

const RoleCard = ({ name, description, userCount, permissions, color }: RoleCardProps) => (
  <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
    <div className="mb-4 flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div className={`rounded-lg p-2 ${color}`}>
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
        Edit
      </button>
    </div>
    
    <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
      <Users className="h-4 w-4" />
      <span>{userCount} users with this role</span>
    </div>

    <div>
      <p className="mb-2 text-xs font-medium uppercase text-gray-500">Permissions</p>
      <div className="space-y-1">
        {permissions.map((permission, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>{permission}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AdminRolesRoute = () => {
  return (
    <ContentLayout title="Roles & Permissions">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Manage user roles and their associated permissions
          </p>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Create New Role
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <RoleCard
            name="Admin"
            description="Full system access and control"
            userCount={3}
            permissions={[
              'Manage users and roles',
              'Configure system settings',
              'View all reports',
              'Manage content',
              'Access all features',
            ]}
            color="bg-purple-600"
          />
          
          <RoleCard
            name="Agronomy Expert"
            description="Expert-level access to agricultural features"
            userCount={12}
            permissions={[
              'Approve/reject plans',
              'Manage materials and varieties',
              'Create standard plans',
              'View expert reports',
              'Emergency management',
            ]}
            color="bg-blue-600"
          />
          
          <RoleCard
            name="Supervisor"
            description="Oversee groups and monitor activities"
            userCount={45}
            permissions={[
              'Manage assigned groups',
              'Submit plans for approval',
              'View group reports',
              'Monitor field activities',
            ]}
            color="bg-green-600"
          />
          
          <RoleCard
            name="Farmer"
            description="Basic user with limited access"
            userCount={1188}
            permissions={[
              'View own plans',
              'Participate in discussions',
              'View assigned fields',
              'Submit requests',
            ]}
            color="bg-gray-600"
          />
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Permission Management
          </h3>
          <p className="text-sm text-gray-600">
            Permissions control what users can see and do within the system. Each role
            can have multiple permissions assigned. Changes to role permissions will
            affect all users with that role immediately.
          </p>
        </div>
      </div>
    </ContentLayout>
  );
};

export default AdminRolesRoute;

