import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Form, Input } from '@/components/ui/form';
import { paths } from '@/config/paths';
import { useForgotPassword, forgotPasswordInputSchema } from '../api/forgot-password';

export const ForgotPasswordForm = () => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [contactInfo, setContactInfo] = useState('');

    const forgotPassword = useForgotPassword({
        onSuccess: (data) => {
            setIsSubmitted(true);
        },
    });

    if (isSubmitted) {
        return (
            <div className="text-center">
                <div className="mb-4">
                    <svg
                        className="mx-auto h-12 w-12 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Check your email</h3>
                <p className="text-gray-600 mb-6">
                    We've sent a password reset link to <strong>{contactInfo}</strong>
                </p>
                <Link
                    to={paths.auth.login.getHref()}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                >
                    Back to login
                </Link>
            </div>
        );
    }

    return (
        <div>
            <Form
                onSubmit={(values) => {
                    setContactInfo(values.email);
                    forgotPassword.mutate(values);
                }}
                schema={forgotPasswordInputSchema}
                options={{
                    defaultValues: {
                        email: '',
                    },
                }}
            >
                {({ register, formState }) => (
                    <>
                        <Input
                            type="email"
                            label="Email address"
                            placeholder="Enter your email"
                            error={formState.errors['email']}
                            registration={register('email')}
                        />

                        <p className="mt-2 text-sm text-gray-500">
                            Enter the email address associated with your account and we'll send you a link to reset your password.
                        </p>

                        <Button
                            type="submit"
                            isLoading={forgotPassword.isPending}
                            className="w-full"
                        >
                            Send reset link
                        </Button>
                    </>
                )}
            </Form>

            <div className="mt-6 text-center">
                <Link
                    to={paths.auth.login.getHref()}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                    ← Back to login
                </Link>
            </div>
        </div>
    );
};
