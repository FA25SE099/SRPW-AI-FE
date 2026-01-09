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
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/background.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      </div>

      {/* Content Card */}
      <div className="relative z-10 w-full max-w-md p-8 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl mx-4">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Đăng nhập vào tài khoản
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Chào mừng trở lại! Vui lòng nhập thông tin của bạn.
          </p>
        </div>

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
        <div className="mt-6 text-center">
          <Link
            to={paths.auth.forgotPassword.getHref()}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
          >
            Quên mật khẩu?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginRoute;
