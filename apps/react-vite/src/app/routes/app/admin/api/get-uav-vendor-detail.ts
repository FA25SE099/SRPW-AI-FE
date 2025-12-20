import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export type UavVendorDetail = {
  fullName: string | null;
  email: string;
  phoneNumber: string;
  vendorName: string;
  businessRegistrationNumber: string | null;
  serviceRatePerHa: number;
  fleetSize: number;
  serviceRadius: number;
  equipmentSpecs: string | null;
  operatingSchedule: string | null;
};

export type UavVendorDetailResponse = {
  succeeded: boolean;
  data: UavVendorDetail;
  message: string;
  errors: string[];
};

export const getUavVendorDetail = async (
  vendorId: string
): Promise<UavVendorDetailResponse> => {
  const formData = new FormData();
  formData.append('UavVendorId', vendorId);

  return api.post('/UavVendor/get-by-id', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

type UseUavVendorDetailOptions = {
  vendorId: string | null;
  queryConfig?: QueryConfig<typeof getUavVendorDetail>;
};

export const useUavVendorDetail = ({
  vendorId,
  queryConfig,
}: UseUavVendorDetailOptions) => {
  return useQuery({
    ...queryConfig,
    queryKey: ['uav-vendor-detail', vendorId],
    queryFn: () => getUavVendorDetail(vendorId!),
    enabled: !!vendorId && (queryConfig?.enabled ?? true),
  });
};
