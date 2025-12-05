import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Material } from '@/types/api';

export const getMaterial = async (id: string): Promise<Material> => {
  return api.get(`/Material/by-id?id=${id}`);
};

export const getMaterialQueryOptions = (id: string) => {
  return queryOptions({
    queryKey: ['material', id],
    queryFn: () => getMaterial(id),
  });
};

type UseMaterialOptions = {
  id: string;
  queryConfig?: QueryConfig<typeof getMaterial>;
};

export const useMaterial = ({ id, queryConfig }: UseMaterialOptions) => {
  return useQuery({
    ...queryConfig,
    queryKey: ['material', id],
    queryFn: () => getMaterial(id),
  });
};
