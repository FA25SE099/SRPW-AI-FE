import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

// Supervisor
export type CreateSupervisorData = {
  fullName: string;
  email: string;
  phoneNumber: string;
  maxFarmerCapacity: number;
};

export const createSupervisor = (data: CreateSupervisorData): Promise<any> => {
  return api.post('/Supervisor', data);
};

type UseCreateSupervisorOptions = {
  mutationConfig?: MutationConfig<typeof createSupervisor>;
};

export const useCreateSupervisor = ({
  mutationConfig,
}: UseCreateSupervisorOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: createSupervisor,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['supervisors'] });
      onSuccess?.(...args);
    },
    ...restConfig,
  });
};

// Cluster Manager
export type CreateClusterManagerData = {
  fullName: string;
  email: string;
  phoneNumber: string;
};

export const createClusterManager = (
  data: CreateClusterManagerData
): Promise<any> => {
  return api.post('/ClusterManager', data);
};

type UseCreateClusterManagerOptions = {
  mutationConfig?: MutationConfig<typeof createClusterManager>;
};

export const useCreateClusterManager = ({
  mutationConfig,
}: UseCreateClusterManagerOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: createClusterManager,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['cluster-managers'] });
      onSuccess?.(...args);
    },
    ...restConfig,
  });
};

// Agronomy Expert
export type CreateAgronomyExpertData = {
  fullName: string;
  email: string;
  phoneNumber: string;
};

export const createAgronomyExpert = (
  data: CreateAgronomyExpertData
): Promise<any> => {
  return api.post('/AgronomyExpert', data);
};

type UseCreateAgronomyExpertOptions = {
  mutationConfig?: MutationConfig<typeof createAgronomyExpert>;
};

export const useCreateAgronomyExpert = ({
  mutationConfig,
}: UseCreateAgronomyExpertOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: createAgronomyExpert,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['agronomy-experts'] });
      onSuccess?.(...args);
    },
    ...restConfig,
  });
};

// UAV Vendor
export type CreateUavVendorData = {
  fullName: string;
  vendorName: string;
  email: string;
  phoneNumber: string;
  businessRegistrationNumber: string;
  serviceRatePerHa: number;
  fleetSize: number;
  serviceRadius: number;
  equipmentSpecs: string;
  operatingSchedule: string;
};

export const createUavVendor = (data: CreateUavVendorData): Promise<any> => {
  return api.post('/UavVendor', data);
};

type UseCreateUavVendorOptions = {
  mutationConfig?: MutationConfig<typeof createUavVendor>;
};

export const useCreateUavVendor = ({
  mutationConfig,
}: UseCreateUavVendorOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: createUavVendor,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['uav-vendors'] });
      onSuccess?.(...args);
    },
    ...restConfig,
  });
};

// Update UAV Vendor
export type UpdateUavVendorData = {
  uavVendorId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  vendorName: string;
  businessRegistrationNumber: string;
  serviceRatePerHa: number;
  fleetSize: number;
  serviceRadius: number;
  equipmentSpecs: string;
  operatingSchedule: string;
};

export const updateUavVendor = (data: UpdateUavVendorData): Promise<any> => {
  return api.put('/UavVendor', data);
};

type UseUpdateUavVendorOptions = {
  mutationConfig?: MutationConfig<typeof updateUavVendor>;
};

export const useUpdateUavVendor = ({
  mutationConfig,
}: UseUpdateUavVendorOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: updateUavVendor,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['uav-vendors'] });
      queryClient.invalidateQueries({ queryKey: ['uav-vendor-detail'] });
      onSuccess?.(...args);
    },
    ...restConfig,
  });
};
