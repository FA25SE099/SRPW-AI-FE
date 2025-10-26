import { ContentLayout } from '@/components/layouts';
import { useUser } from '@/lib/auth';
import { Authorization, ROLES } from '@/lib/authorization';

const DashboardRoute = () => {
  const user = useUser();
  return (
    <ContentLayout title="Admin Dashboard">
      <Authorization
        forbiddenFallback={<div>Only admin can view this dashboard.</div>}
        allowedRoles={[ROLES.Admin]}
      >
        <h1 className="text-xl">
          Welcome <b>{`${user.data?.firstName} ${user.data?.lastName}`}</b>
        </h1>
        <h4 className="my-3">
          Your role is : <b>{user.data?.role}</b>
        </h4>
        <p className="font-medium">As an Admin, you can:</p>
        <ul className="my-4 list-inside list-disc">
          <li>Create discussions</li>
          <li>Edit discussions</li>
          <li>Delete discussions</li>
          <li>Comment on discussions</li>
          <li>Delete all comments</li>
          <li>View all users</li>
          <li>Manage system settings</li>
        </ul>
      </Authorization>
    </ContentLayout>
  );
};

export default DashboardRoute;
