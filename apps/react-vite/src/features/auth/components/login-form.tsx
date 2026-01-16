import { Link, useSearchParams } from 'react-router';

import { Button } from '@/components/ui/button';
import { Form, Input } from '@/components/ui/form';
import { paths } from '@/config/paths';
import { useLogin, loginInputSchema } from '@/lib/auth';

type LoginFormProps = {
  onSuccess: () => void;
};

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const login = useLogin({
    onSuccess,
  });
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');

  return (
    <div>
      <Form
        onSubmit={(values) => {
          login.mutate(values);
        }}
        schema={loginInputSchema}
      >
        {({ register, formState }) => (
          <>
            <Input
              type="email"
              label="Email"
              placeholder="Email"
              error={formState.errors['email']}
              registration={register('email')}
              className="mb-4"
            />
            <Input
              type="password"
              label="Mật khẩu"
              placeholder="Mật khẩu"
              error={formState.errors['password']}
              registration={register('password')}
              className="mb-2"
            />
            <div className="mb-6 text-right">
              <Link
                to={paths.auth.forgotPassword.getHref()}
                className="text-xs text-gray-500 hover:text-green-600"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <div>
              <Button
                isLoading={login.isPending}
                type="submit"
                className="w-full rounded-full bg-green-600 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-all duration-300 hover:bg-green-700 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                Đăng nhập
              </Button>
            </div>
          </>
        )}
      </Form>
    </div>
  );
};
