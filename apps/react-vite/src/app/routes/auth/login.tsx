import { useNavigate, useSearchParams } from 'react-router';
import { Link } from 'react-router';
import { useUser } from '@/lib/auth';

import { AuthLayout } from '@/components/layouts/auth-layout';
import { paths } from '@/config/paths';
import { LoginForm } from '@/features/auth/components/login-form';

const LoginRoute = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');
  const user = useUser();

  return (
    <AuthLayout title="Log in to your account">
      <LoginForm
        onSuccess={() => {
          // Wait for user query to refetch before navigating
          user.refetch().then(() => {
            console.log('Refetched user role:', user.data?.role);
            navigate(
              `${redirectTo ? `${redirectTo}` : paths.app.root.getHref()}`,
              {
                replace: true,
              },
            );
          });
        }}
      />
      <div className="mt-4 text-center">
        <Link
          to={paths.auth.forgotPassword.getHref()}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Forgot your password?
        </Link>
      </div>
    </AuthLayout>
  );
};

export default LoginRoute;
