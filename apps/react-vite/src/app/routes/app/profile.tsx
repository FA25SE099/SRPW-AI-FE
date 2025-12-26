import { ChangePasswordModal } from '@/features/auth/components/change-password-modal';
import { ContentLayout } from '@/components/layouts';
import { useAdminUsers } from '@/features/users/api/get-admin-users';
import { UpdateProfile } from '@/features/users/components/update-profile';
import { useUser } from '@/lib/auth';
import { Spinner } from '@/components/ui/spinner';

type EntryProps = {
  label: string;
  value: string;
};

const Entry = ({ label, value }: EntryProps) => (
  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
      {value}
    </dd>
  </div>
);

const ProfileRoute = () => {
  const currentUserQuery = useUser();

  const adminUsersQuery = useAdminUsers({
    params: {
      searchEmailAndName: currentUserQuery.data?.email,
      pageSize: 1,
    },
    queryConfig: {
      enabled: !!currentUserQuery.data?.email,
    },
  });

  if (currentUserQuery.isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!currentUserQuery.data) return null;

  const userForDisplay = adminUsersQuery.data?.data[0] ?? currentUserQuery.data;

  return (
    <ContentLayout title="Profile">
      <div className="overflow-hidden bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {userForDisplay.firstName} {userForDisplay.lastName}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Personal and account details.
              </p>
            </div>
            <div className="flex gap-3">
              <UpdateProfile />
              <ChangePasswordModal />
            </div>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Personal details of the user.
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          {adminUsersQuery.isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Spinner size="lg" />
            </div>
          ) : (
            <dl className="sm:divide-y sm:divide-gray-200">
              <Entry label="First Name" value={userForDisplay.firstName} />
              <Entry label="Last Name" value={userForDisplay.lastName} />
              <Entry label="Email Address" value={userForDisplay.email} />
              <Entry label="Role" value={userForDisplay.role} />
              <Entry label="Bio" value={userForDisplay.bio} />
            </dl>
          )}
        </div>
      </div>
    </ContentLayout>
  );
};

export default ProfileRoute;
