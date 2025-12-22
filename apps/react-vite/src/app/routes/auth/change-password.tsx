import { useNavigate } from 'react-router';

import { AuthLayout } from '@/components/layouts/auth-layout';
import { paths } from '@/config/paths';
import { ChangePasswordForm } from '@/features/auth/components/change-password-form';

const ChangePasswordRoute = () => {
    const navigate = useNavigate();

    return (
        <AuthLayout title="Change Password">
            <ChangePasswordForm
                onSuccess={() => {
                    navigate(paths.app.profile.getHref(), {
                        replace: true,
                    });
                }}
            />
        </AuthLayout>
    );
};

export default ChangePasswordRoute;
