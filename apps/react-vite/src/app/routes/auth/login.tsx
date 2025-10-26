import { useNavigate, useSearchParams } from 'react-router';
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
            navigate(
              `${redirectTo ? `${redirectTo}` : paths.app.root.getHref()}`,
              {
                replace: true,
              },
            );
          });
        }}
      />
    </AuthLayout>
  );
};

export default LoginRoute;
