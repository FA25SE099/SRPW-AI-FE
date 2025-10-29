import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { RiceVarietyWithSeasons } from '@/types/api';

type GetRiceVarietiesParams = {
  search?: string;
  isActive?: boolean;
  categoryId?: string;
};

export const getRiceVarieties = async (
  params?: GetRiceVarietiesParams,
): Promise<RiceVarietyWithSeasons[]> => {
  return api.get('/ricevariety', {
    params,
  });
};

export const getRiceVarietiesQueryOptions = (params?: GetRiceVarietiesParams) => {
  return queryOptions({
    queryKey: params ? ['rice-varieties', params] : ['rice-varieties'],
    queryFn: () => getRiceVarieties(params),
  });
};

type UseRiceVarietiesOptions = {
  params?: GetRiceVarietiesParams;
  queryConfig?: QueryConfig<typeof getRiceVarietiesQueryOptions>;
};

export const useRiceVarieties = ({
  params,
  queryConfig,
}: UseRiceVarietiesOptions = {}) => {
  return useQuery({
    ...getRiceVarietiesQueryOptions(params),
    ...queryConfig,
  });
};

