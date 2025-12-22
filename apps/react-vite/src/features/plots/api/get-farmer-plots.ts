import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

export const getFarmerPlots = (farmerId: string): Promise<any> => {
  return api.post(`/farmer/${farmerId}/plots`, {
    // According to the problem description, this is a POST request.
    // We can pass any filtering or pagination options here if needed.
  });
};

export const useFarmerPlots = (farmerId: string) => {
  return useQuery<any, Error>({
    queryKey: ['farmer-plots', farmerId],
    queryFn: () => getFarmerPlots(farmerId),
  });
};
