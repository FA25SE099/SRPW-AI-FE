import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { paths } from '@/config/paths';

export const ForgotPasswordForm = () => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // TODO: Implement forgot password API call
        setTimeout(() => {
            setIsSubmitted(true);
            setIsLoading(false);
        }, 1000);
    };

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
                    We've sent a password reset link to <strong>{email}</strong>
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
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email address
                    </label>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        className="w-full"
                    />
                    <p className="mt-2 text-sm text-gray-500">
                        Enter the email address associated with your account and we'll send you a link to reset your password.
                    </p>
                </div>

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full"
                >
                    {isLoading ? 'Sending...' : 'Send reset link'}
                </Button>
            </form>

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
