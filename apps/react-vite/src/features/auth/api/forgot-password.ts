import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { useNotifications } from '@/components/ui/notifications';

export const forgotPasswordInputSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Invalid email'),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordInputSchema>;

export const forgotPassword = async (
    data: ForgotPasswordInput,
): Promise<{ message: string }> => {
    return api.post('/auth/forgot-password', { email: data.email });
};

type UseForgotPasswordOptions = {
    mutationConfig?: MutationConfig<typeof forgotPassword>;
    onSuccess?: (data: { message: string }) => void;
};

export const useForgotPassword = ({
    mutationConfig,
    onSuccess,
}: UseForgotPasswordOptions = {}) => {
    const { addNotification } = useNotifications();

    const { onSuccess: onSuccessFromConfig, ...restConfig } = mutationConfig || {};

    return useMutation({
        onSuccess: (data, ...args) => {
            const message = data?.message || 'Check your email for the reset link.';
            addNotification({
                type: 'success',
                title: 'Reset Link Sent',
                message,
            });
            onSuccess?.(data);
            onSuccessFromConfig?.(data, ...args);
        },
        onError: (error: any) => {
            addNotification({
                type: 'error',
                title: 'Error',
                message: error.message || 'Failed to send reset link. Please try again.',
            });
        },
        ...restConfig,
        mutationFn: forgotPassword,
    });
};
