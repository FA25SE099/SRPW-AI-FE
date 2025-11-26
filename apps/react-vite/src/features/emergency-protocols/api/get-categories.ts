import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export type Category = {
  id: string;
  name: string;
  description?: string;
};

export type CategoriesResponse = {
  succeeded: boolean;
  data: Category[];
  message: string;
  errors: string[];
};

export const getCategories = (): Promise<CategoriesResponse> => {
  return api.get('/RiceVarietyCategory'); // Use the correct endpoint
};

type UseCategoriesOptions = {
  queryConfig?: QueryConfig<typeof getCategories>;
};

export const useCategories = ({ queryConfig }: UseCategoriesOptions = {}) => {
  return useQuery({
    ...queryConfig,
    queryKey: ['categories'],
    queryFn: () => getCategories(),
  });
};