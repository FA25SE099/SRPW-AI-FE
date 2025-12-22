import { AuthLayout } from '@/components/layouts/auth-layout';
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form';

/**
 * Forgot password route that renders the password reset request form.
 */
const ForgotPasswordRoute = () => {
    return (
        <AuthLayout title="Reset your password">
            <ForgotPasswordForm />
        </AuthLayout>
    );
};

export default ForgotPasswordRoute;
