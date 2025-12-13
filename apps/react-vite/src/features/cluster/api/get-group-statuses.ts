import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export interface GroupStatusOption {
  value: number;
  name: string;
  displayName: string;
}

export interface GroupStatusesResponse {
  data: GroupStatusOption[];
  succeeded: boolean;
}

// API interceptor unwraps the response, so we actually get the array directly
export const getGroupStatuses = (): Promise<GroupStatusOption[]> => {
  return api.get('/Filter/group-statuses');
};

type UseGroupStatusesOptions = {
  queryConfig?: QueryConfig<typeof getGroupStatuses>;
};

export const useGroupStatuses = ({ queryConfig }: UseGroupStatusesOptions = {}) => {
  return useQuery({
    ...queryConfig,
    queryKey: ['group-statuses'],
    queryFn: async () => {
      try {
        const result = await getGroupStatuses();
        console.log('✅ Group Statuses API Response:', result);
        return result;
      } catch (error) {
        console.error('❌ Group Statuses API Error:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour - filter options rarely change
    retry: 2, // Retry failed requests
  });
};

