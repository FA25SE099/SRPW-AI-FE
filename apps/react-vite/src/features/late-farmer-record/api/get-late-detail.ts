import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Result } from '@/types/api';
import { FarmerLateDetailDTO } from '../types';

export const getLateFarmerDetail = (
  farmerId: string
): Promise<Result<FarmerLateDetailDTO>> => {
  return api.get(`/LateFarmerRecord/farmer/${farmerId}/detail`);
};

export const getLateFarmerDetailQueryOptions = (farmerId: string) => {
  return queryOptions({
    queryKey: ['late-farmer-detail', farmerId],
    queryFn: () => getLateFarmerDetail(farmerId),
  });
};

type UseLateFarmerDetailOptions = {
  farmerId: string;
  queryConfig?: QueryConfig<typeof getLateFarmerDetail>;
};

export const useLateFarmerDetail = ({
  farmerId,
  queryConfig,
}: UseLateFarmerDetailOptions) => {
  return useQuery({
    ...getLateFarmerDetailQueryOptions(farmerId),
    ...queryConfig,
  });
};
