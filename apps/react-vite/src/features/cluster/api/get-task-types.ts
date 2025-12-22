import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export interface TaskTypeOption {
  value: number;
  name: string;
  displayName: string;
}

export interface TaskTypesResponse {
  data: TaskTypeOption[];
  succeeded: boolean;
}

// API interceptor unwraps the response, so we actually get the array directly
export const getTaskTypes = (): Promise<TaskTypeOption[]> => {
  return api.get('/Filter/task-types');
};

type UseTaskTypesOptions = {
  queryConfig?: QueryConfig<typeof getTaskTypes>;
};

export const useTaskTypes = ({ queryConfig }: UseTaskTypesOptions = {}) => {
  return useQuery({
    ...queryConfig,
    queryKey: ['task-types'],
    queryFn: async () => {
      try {
        const result = await getTaskTypes();
        console.log('✅ Task Types API Response:', result);
        return result;
      } catch (error) {
        console.error('❌ Task Types API Error:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour - filter options rarely change
    retry: 2, // Retry failed requests
  });
};

