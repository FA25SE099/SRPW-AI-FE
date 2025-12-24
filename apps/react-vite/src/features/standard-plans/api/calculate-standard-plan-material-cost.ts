import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { StandardPlanMaterialCost } from '@/types/api';
import { useNotifications } from '@/components/ui/notifications';

type CostParams = {
  standardPlanId: string;
  plotId?: string;
  area?: number;
};

export const calculateStandardPlanMaterialCost = (
  data: CostParams,
): Promise<StandardPlanMaterialCost> => {
  return api.post('/Material/calculate-standard-plan-material-cost', data);
};

type UseCalculateStandardPlanMaterialCostOptions = {
  mutationConfig?: MutationConfig<typeof calculateStandardPlanMaterialCost>;
};

export const useCalculateStandardPlanMaterialCost = ({
  mutationConfig,
}: UseCalculateStandardPlanMaterialCostOptions = {}) => {
  const { addNotification } = useNotifications();

  const { onSuccess, onError, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (data, variables, context) => {
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Material cost calculated successfully.',
      });
      onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      // The interceptor already shows an error notification
      onError?.(error, variables, context);
    },
    ...restConfig,
    mutationFn: calculateStandardPlanMaterialCost,
  });
};
