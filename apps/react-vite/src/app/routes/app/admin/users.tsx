import { ContentLayout } from '@/components/layouts';
import { UsersList } from '@/features/users/components/users-list';

const AdminUsersRoute = () => {
  return (
    <ContentLayout title="User Management">
      <div className="mb-6">
        <p className="text-sm text-gray-600">
          Manage all system users, roles, and permissions
        </p>
      </div>
      <UsersList />
    </ContentLayout>
  );
};

export default AdminUsersRoute;

