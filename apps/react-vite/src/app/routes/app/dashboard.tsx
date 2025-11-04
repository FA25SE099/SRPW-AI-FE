import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContentLayout } from '@/components/layouts';
import { useUser } from '@/lib/auth';
import { ROLES } from '@/lib/authorization';
import { Spinner } from '@/components/ui/spinner';

const DashboardRoute = () => {
  const user = useUser();
  const navigate = useNavigate();

  // Redirect based on role
  useEffect(() => {
    if (user.data?.role === ROLES.Admin) {
      navigate('/app/admin', { replace: true });
    } else if (user.data?.role === ROLES.AgronomyExpert) {
      navigate('/app/expert', { replace: true });
    }
  }, [user.data?.role, navigate]);

  // Show spinner while redirecting admins/experts
  if (user.data?.role === ROLES.Admin || user.data?.role === ROLES.AgronomyExpert) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Fallback dashboard for other roles (farmers, supervisors, etc.)
  return (
    <ContentLayout title="Dashboard">
      <div className="space-y-6">
        <div className="rounded-lg border bg-white p-6">
          <h1 className="text-2xl font-bold">
            Welcome, {user.data?.firstName} {user.data?.lastName}!
          </h1>
          <p className="mt-2 text-gray-600">
            Role: <span className="font-medium">{user.data?.role}</span>
          </p>
        </div>

        <div className="rounded-lg border bg-white p-6">
          <h2 className="text-lg font-semibold">Quick Links</h2>
          <p className="mt-4 text-sm text-gray-600">
            Select an option from the navigation menu to get started.
          </p>
        </div>
      </div>
    </ContentLayout>
  );
};

export default DashboardRoute;
