import { ContentLayout } from '@/components/layouts';
import { Authorization, ROLES } from '@/lib/authorization';
import { SystemSettingsList } from '@/features/system-settings';

const AdminSettingsRoute = () => {
  return (
    <Authorization
      forbiddenFallback={<div>Only admins can view this page.</div>}
      allowedRoles={[ROLES.Admin]}
    >
      <ContentLayout title="System Settings">
        <SystemSettingsList />
      </ContentLayout>
    </Authorization>
  );
};

export default AdminSettingsRoute;

