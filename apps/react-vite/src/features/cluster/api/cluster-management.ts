import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import {
  CreateClusterDto,
  CreateClusterManagerDto,
  CreateAgronomyExpertDto,
  CreateSupervisorDto,
  UpdateClusterDto,
  SortBy,
} from '../types';

// Cluster APIs
export const useClusters = (
  page: number,
  pageSize: number,
  clusterNameSearch: string,
  managerExpertNameSearch: string,
  phoneNumberSearch: string,
  sortBy: SortBy,
) => {
  return useQuery({
    queryKey: [
      'clusters',
      page,
      pageSize,
      clusterNameSearch,
      managerExpertNameSearch,
      phoneNumberSearch,
      sortBy,
    ],
    queryFn: async () => {
      const response = await api.post('/Cluster/Get-all', {
        currentPage: page,
        pageSize: pageSize,
        clusterNameSearch,
        managerExpertNameSearch,
        phoneNumber: phoneNumberSearch,
        sortBy,
      });
      return response;
    },
  });
};

export const useCreateCluster = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateClusterDto) => api.post('/Cluster', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clusters'] });
    },
  });
};

export const useUpdateCluster = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateClusterDto) =>
      api.put('/Cluster/Update-name-and-human-resource', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clusters'] });
    },
  });
};

// Cluster Manager APIs
export const useClusterManagers = (
  page: number,
  pageSize: number,
  search: string,
  phoneSearch: string,
  freeOrAssigned: boolean | null,
  enabled: boolean = false,
) => {
  return useQuery({
    queryKey: [
      'cluster-managers',
      page,
      pageSize,
      search,
      phoneSearch,
      freeOrAssigned,
    ],
    queryFn: async () => {
      const response = await api.post('/ClusterManager/get-all', {
        currentPage: page,
        pageSize: pageSize,
        freeOrAssigned: freeOrAssigned,
        search: search,
        phoneNumber: phoneSearch,
      });
      return response;
    },
    enabled,
  });
};

export const useCreateClusterManager = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateClusterManagerDto) =>
      api.post('/ClusterManager', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cluster-managers'] });
    },
  });
};

// Agronomy Expert APIs
export const useAgronomyExperts = (
  page: number,
  pageSize: number,
  search: string,
  phoneSearch: string,
  freeOrAssigned: boolean | null,
  enabled: boolean = false,
) => {
  return useQuery({
    queryKey: [
      'agronomy-experts',
      page,
      pageSize,
      search,
      phoneSearch,
      freeOrAssigned,
    ],
    queryFn: async () => {
      const response = await api.post('/AgronomyExpert/get-all', {
        currentPage: page,
        pageSize: pageSize,
        freeOrAssigned: freeOrAssigned,
        search: search,
        phoneNumber: phoneSearch,
      });
      return response;
    },
    enabled,
  });
};

export const useCreateAgronomyExpert = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAgronomyExpertDto) =>
      api.post('/AgronomyExpert', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agronomy-experts'] });
    },
  });
};

// Supervisor APIs
export const useSupervisors = (
  page: number,
  pageSize: number,
  search: string,
  phoneSearch: string,
  advancedSearch: string,
  enabled: boolean = false,
) => {
  return useQuery({
    queryKey: [
      'supervisors',
      page,
      pageSize,
      search,
      phoneSearch,
      advancedSearch,
    ],
    queryFn: async () => {
      const response = await api.post('/Supervisor/get-all-supervisor-admin', {
        currentPage: page,
        pageSize: pageSize,
        searchNameOrEmail: search,
        searchPhoneNumber: phoneSearch,
        advancedSearch: advancedSearch,
      });
      return response;
    },
    enabled,
  });
};

export const useCreateSupervisor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSupervisorDto) =>
      api.post('/Supervisor', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supervisors'] });
    },
  });
};
