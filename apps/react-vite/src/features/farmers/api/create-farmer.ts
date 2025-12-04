import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

export const createFarmerInputSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  address: z.string().min(1, 'Address is required'),
  farmCode: z.string().min(1, 'Farm code is required'),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  isVerified: z.boolean().optional(),
});

export type CreateFarmerInput = z.infer<typeof createFarmerInputSchema>;

// This is what the API client returns after unwrapping the Result<T> wrapper
export type CreateFarmerResponse = {
  farmerId: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  farmCode: string;
  isActive: boolean;
  isVerified: boolean;
  plotCount: number;
};

export const createFarmer = (data: CreateFarmerInput): Promise<CreateFarmerResponse> => {
  return api.post('/farmer', data);
};

type UseCreateFarmerOptions = {
  mutationConfig?: MutationConfig<typeof createFarmer>;
};

export const useCreateFarmer = ({ mutationConfig }: UseCreateFarmerOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ['farmer'],
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: createFarmer,
  });
};

