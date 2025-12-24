import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export interface UavVendor {
  id: string;
  name: string;
  address: string | null;
  email: string;
}

export interface UavVendorsResponse {
  succeeded: boolean;
  data: UavVendor[];
  message: string | null;
  errors: string[];
}

// API interceptor unwraps the response, so we actually get the array directly
export const getUavVendors = (): Promise<UavVendor[]> => {
  return api.get('/UavVendor');
};

type UseUavVendorsOptions = {
  queryConfig?: QueryConfig<typeof getUavVendors>;
};

export const useUavVendors = ({ queryConfig }: UseUavVendorsOptions = {}) => {
  return useQuery({
    ...queryConfig,
    queryKey: ['uav-vendors'],
    queryFn: async () => {
      try {
        const result = await getUavVendors();
        console.log('✅ UAV Vendors API Response:', result);
        return result;
      } catch (error) {
        console.error('❌ UAV Vendors API Error:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
    retry: 2,
  });
};

