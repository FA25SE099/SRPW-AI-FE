import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Form, Input } from '@/components/ui/form';
import { paths } from '@/config/paths';
import { useChangePassword, changePasswordInputSchema } from '../api/change-password';

type ChangePasswordFormProps = {
    onSuccess?: () => void;
};

export const ChangePasswordForm = ({ onSuccess }: ChangePasswordFormProps) => {
    const changePassword = useChangePassword({
        onSuccess,
    });

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
                <p className="mt-2 text-sm text-gray-600">
                    Update your password to keep your account secure.
                </p>
            </div>

            <Form
                onSubmit={(values) => {
                    changePassword.mutate(values);
                }}
                schema={changePasswordInputSchema}
                options={{
                    defaultValues: {
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                    },
                }}
            >
                {({ register, formState }) => (
                    <>
                        <Input
                            type="password"
                            label="Current Password"
                            placeholder="Enter your current password"
                            error={formState.errors['currentPassword']}
                            registration={register('currentPassword')}
                        />
                        <Input
                            type="password"
                            label="New Password"
                            placeholder="Enter your new password"
                            error={formState.errors['newPassword']}
                            registration={register('newPassword')}
                        />
                        <Input
                            type="password"
                            label="Confirm New Password"
                            placeholder="Confirm your new password"
                            error={formState.errors['confirmPassword']}
                            registration={register('confirmPassword')}
                        />

                        <div className="flex gap-3">
                            <Button
                                type="submit"
                                isLoading={changePassword.isPending}
                                className="flex-1"
                            >
                                Change Password
                            </Button>
                            <Link to={paths.app.profile.getHref()}>
                                <Button type="button" variant="outline" className="w-full">
                                    Cancel
                                </Button>
                            </Link>
                        </div>
                    </>
                )}
            </Form>
        </div>
    );
};
