import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

type ChangeFarmerStatusRequest = {
  farmerId: string;
  newStatus: 'Normal' | 'Warned' | 'NotAllowed' | 'Resigned';
};

type UseChangeFarmerStatusOptions = {
  mutationConfig?: UseMutationOptions<any, Error, ChangeFarmerStatusRequest>;
};

export const useChangeFarmerStatus = ({ mutationConfig }: UseChangeFarmerStatusOptions = {}) => {
  return useMutation({
    mutationFn: async ({ farmerId, newStatus }: ChangeFarmerStatusRequest) => {
      return api.put(`/farmer/${farmerId}/status`, {
        farmerId,
        newStatus,
      });
    },
    ...mutationConfig,
  });
};