import { useNavigate, useSearchParams } from 'react-router';
import { Link } from 'react-router';
import { useUser } from '@/lib/auth';

import { paths } from '@/config/paths';
import { LoginForm } from '@/features/auth/components/login-form';

const LoginRoute = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');
  const user = useUser();

  return (
    <AuthLayout title="Đăng nhập vào tài khoản của bạn để tiếp tục">
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
    </AuthLayout>
  );
};

export default LoginRoute;
