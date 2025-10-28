import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { RiceVarietyCategory } from '@/types/api';

export const getCategories = async (): Promise<RiceVarietyCategory[]> => {
  return api.get('/ricevariety/categories');
};

export const getCategoriesQueryOptions = () => {
  return queryOptions({
    queryKey: ['rice-variety-categories'],
    queryFn: getCategories,
  });
};

type UseCategoriesOptions = {
  queryConfig?: QueryConfig<typeof getCategoriesQueryOptions>;
};

export const useCategories = ({ queryConfig }: UseCategoriesOptions = {}) => {
  return useQuery({
    ...getCategoriesQueryOptions(),
    ...queryConfig,
  });
};
