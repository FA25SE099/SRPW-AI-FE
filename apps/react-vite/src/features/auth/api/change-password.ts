import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { useNotifications } from '@/components/ui/notifications';

export const changePasswordInputSchema = z
    .object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: z.string().min(5, 'Password must be at least 5 characters'),
        confirmPassword: z.string().min(1, 'Please confirm your password'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    });

export type ChangePasswordInput = z.infer<typeof changePasswordInputSchema>;

export const changePassword = async (
    data: ChangePasswordInput,
): Promise<{ message: string }> => {
    return api.post('/auth/change-password', data);
};

type UseChangePasswordOptions = {
    mutationConfig?: MutationConfig<typeof changePassword>;
    onSuccess?: () => void;
};

export const useChangePassword = ({
    mutationConfig,
    onSuccess,
}: UseChangePasswordOptions = {}) => {
    const queryClient = useQueryClient();
    const { addNotification } = useNotifications();

    const { onSuccess: onSuccessFromConfig, ...restConfig } = mutationConfig || {};

    return useMutation({
        onSuccess: (data, ...args) => {
            addNotification({
                type: 'success',
                title: 'Password Changed',
                message: data.message || 'Your password has been successfully changed.',
            });
            onSuccess?.();
            onSuccessFromConfig?.(data, ...args);
        },
        onError: (error: any) => {
            addNotification({
                type: 'error',
                title: 'Error',
                message: error.message || 'Failed to change password. Please try again.',
            });
        },
        ...restConfig,
        mutationFn: changePassword,
    });
};
