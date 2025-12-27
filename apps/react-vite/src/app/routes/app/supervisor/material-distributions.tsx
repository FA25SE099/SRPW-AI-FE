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
      <ContentLayout title="Material Distributions">
        {user.isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : !groupId ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Group Selected</AlertTitle>
            <AlertDescription>
              Please select a group to view material distributions. You can access
              this page from your group management dashboard.
            </AlertDescription>
          </Alert>
        ) : !user.data?.id ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Unable to load user information. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            {/* Description */}
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm text-gray-600">
                Manage and track material distributions for your group. Confirm
                distributions and monitor farmer confirmations.
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

