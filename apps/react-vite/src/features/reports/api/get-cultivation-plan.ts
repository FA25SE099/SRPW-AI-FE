import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { CultivationPlan } from '../types';

export const getCultivationPlan = (planId: string): Promise<CultivationPlan> => {
    // The interceptor unwraps single results and returns data directly
    return api.get(`/cultivation-plan/${planId}`);
};

type UseCultivationPlanOptions = {
    planId: string;
    queryConfig?: QueryConfig<typeof getCultivationPlan>;
};

export const useCultivationPlan = ({ planId, queryConfig }: UseCultivationPlanOptions) => {
    return useQuery({
        ...queryConfig,
        queryKey: ['cultivation-plan', planId],
        queryFn: () => getCultivationPlan(planId),
    });
};

