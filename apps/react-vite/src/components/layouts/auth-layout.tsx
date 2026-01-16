import * as React from 'react';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import logo from '@/assets/logo.svg';
import { Head } from '@/components/seo';
import { Link } from '@/components/ui/link';
import { paths } from '@/config/paths';
import { useUser } from '@/lib/auth';

type LayoutProps = {
  children: React.ReactNode;
  title: string;
};

export const AuthLayout = ({ children, title }: LayoutProps) => {
  const user = useUser();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');

  const navigate = useNavigate();

  useEffect(() => {
    if (user.data) {
      navigate(redirectTo ? redirectTo : paths.app.dashboard.getHref(), {
        replace: true,
      });
    }
  }, [user.data, navigate, redirectTo]);

  return (
    <>
      <Head title={title} />
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="flex w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
          {/* Left Side - Green Section */}
          <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-green-600 to-green-500 p-12 md:flex md:flex-col md:justify-center md:gap-8 animate-in slide-in-from-left duration-700">
            {/* Logo */}
            <div className="flex justify-center animate-in fade-in zoom-in-50 duration-1000 delay-300">
              <Link to={paths.home.getHref()}>
                <img
                  className="h-16 w-auto transition-transform duration-300 hover:scale-110"
                  src="https://ducthanhco.vn/wp-content/uploads/2021/10/logo-tab.png"
                  alt="Logo"
                />
              </Link>
            </div>

            {/* Welcome Message */}
            <div className="text-center text-white -mt-4">
              <h1 className="mb-3 text-4xl font-bold">Chào Mừng Trở Lại!</h1>
              <p className="mb-8 text-green-50">
                Để giữ kết nối với chúng tôi,<br />
                vui lòng đăng nhập bằng thông tin cá nhân của bạn
              </p>
            </div>

            {/* Decorative Wave - Fixed position */}
            <div className="absolute -right-8 top-0 h-full w-48">
              <div className="h-full w-full rounded-l-full bg-green-700 opacity-20"></div>
            </div>
          </div>

          {/* Right Side - White Section */}
          <div className="flex w-full items-center justify-center bg-white p-8 md:w-1/2 md:p-12 animate-in slide-in-from-right duration-700">
            <div className="w-full max-w-md">
              <h2 className="mb-2 text-3xl font-bold text-green-600">
                Chào mừng
              </h2>
              <p className="mb-8 text-sm text-gray-500">
                {title}
              </p>
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
