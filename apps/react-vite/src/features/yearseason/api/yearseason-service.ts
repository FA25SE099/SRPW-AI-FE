import { queryOptions, useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig, MutationConfig } from '@/lib/react-query';
import {
  YearSeason,
  YearSeasonListItem,
  YearSeasonDashboard,
  ValidateProductionPlanRequest,
  ProductionPlanValidationResult,
  CreateYearSeasonDto,
  UpdateYearSeasonDto,
  UpdateYearSeasonStatusDto,
  YearSeasonsByClusterResponse,
  YearSeasonReadinessResponse,
  YearSeasonFarmerSelectionsResponse,
} from '../types';

const API_BASE = '/yearseason';

// ============================================
// GET: YearSeasons by Cluster
// ============================================
export const getYearSeasonsByCluster = (
  clusterId: string,
  year?: number
): Promise<YearSeasonsByClusterResponse> => {
  const params = year ? `?year=${year}` : '';
  return api.get(`${API_BASE}/cluster/${clusterId}${params}`);
};

export const getYearSeasonsByClusterQueryOptions = (
  clusterId: string,
  year?: number
) =>
  queryOptions({
    queryKey: ['yearseasons', 'cluster', clusterId, year],
    queryFn: () => getYearSeasonsByCluster(clusterId, year),
  });

export const useYearSeasonsByCluster = ({
  clusterId,
  year,
  queryConfig,
}: {
  clusterId: string;
  year?: number;
  queryConfig?: QueryConfig<typeof getYearSeasonsByCluster>;
}) => {
  return useQuery({
    ...getYearSeasonsByClusterQueryOptions(clusterId, year),
    ...(queryConfig as any),
  });
};

// ============================================
// GET: YearSeason Detail
// ============================================
export const getYearSeasonDetail = (id: string): Promise<YearSeason> => {
  return api.get(`${API_BASE}/${id}`);
};

export const getYearSeasonDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['yearseason', id],
    queryFn: () => getYearSeasonDetail(id),
  });

export const useYearSeasonDetail = ({
  id,
  queryConfig,
}: {
  id: string;
  queryConfig?: QueryConfig<typeof getYearSeasonDetail>;
}) => {
  return useQuery({
    ...getYearSeasonDetailQueryOptions(id),
    ...(queryConfig as any),
  });
};

// ============================================
// GET: YearSeason Dashboard
// ============================================
export const getYearSeasonDashboard = (
  id: string
): Promise<YearSeasonDashboard> => {
  return api.get(`${API_BASE}/${id}/dashboard`);
};

export const getYearSeasonDashboardQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['yearseason', id, 'dashboard'],
    queryFn: () => getYearSeasonDashboard(id),
  });

export const useYearSeasonDashboard = ({
  id,
  queryConfig,
}: {
  id: string;
  queryConfig?: QueryConfig<typeof getYearSeasonDashboard>;
}) => {
  return useQuery({
    ...getYearSeasonDashboardQueryOptions(id),
    ...(queryConfig as any),
  });
};

// ============================================
// GET: YearSeason Readiness
// ============================================
export const getYearSeasonReadiness = (
  id: string
): Promise<YearSeasonReadinessResponse> => {
  return api.get(`${API_BASE}/${id}/readiness`);
};

export const getYearSeasonReadinessQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['yearseason', id, 'readiness'],
    queryFn: () => getYearSeasonReadiness(id),
    // Remove caching - always fetch fresh data
    staleTime: 0,
  });

export const useYearSeasonReadiness = ({
  id,
  queryConfig,
}: {
  id: string;
  queryConfig?: QueryConfig<typeof getYearSeasonReadiness>;
}) => {
  return useQuery({
    ...getYearSeasonReadinessQueryOptions(id),
    ...(queryConfig as any),
  });
};

// ============================================
// GET: YearSeason Farmer Selections
// ============================================
export const getYearSeasonFarmerSelections = (
  id: string
): Promise<YearSeasonFarmerSelectionsResponse> => {
  return api.get(`${API_BASE}/${id}/farmer-selections`);
};

export const getYearSeasonFarmerSelectionsQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['yearseason', id, 'farmer-selections'],
    queryFn: () => getYearSeasonFarmerSelections(id),
    // Remove caching - always fetch fresh data
    staleTime: 0,
  });

export const useYearSeasonFarmerSelections = ({
  id,
  queryConfig,
}: {
  id: string;
  queryConfig?: QueryConfig<typeof getYearSeasonFarmerSelections>;
}) => {
  return useQuery({
    ...getYearSeasonFarmerSelectionsQueryOptions(id),
    ...(queryConfig as any),
  });
};

// ============================================
// POST: Validate Production Plan
// ============================================
export const validateProductionPlan = (
  request: ValidateProductionPlanRequest
): Promise<ProductionPlanValidationResult> => {
  return api.post(`${API_BASE}/validate-production-plan`, request);
};

export const useValidateProductionPlan = ({
  mutationConfig,
}: {
  mutationConfig?: MutationConfig<typeof validateProductionPlan>;
} = {}) => {
  return useMutation({
    mutationFn: validateProductionPlan,
    ...mutationConfig,
  });
};

// ============================================
// POST: Create YearSeason (Expert only)
// ============================================
export const createYearSeason = (
  data: CreateYearSeasonDto
): Promise<YearSeason> => {
  return api.post(API_BASE, data);
};

export const useCreateYearSeason = ({
  mutationConfig,
}: {
  mutationConfig?: MutationConfig<typeof createYearSeason>;
} = {}) => {
  return useMutation({
    mutationFn: createYearSeason,
    ...mutationConfig,
  });
};

// ============================================
// PUT: Update YearSeason (Expert only)
// ============================================
export const updateYearSeason = ({
  id,
  data,
}: {
  id: string;
  data: UpdateYearSeasonDto;
}): Promise<YearSeason> => {
  return api.put(`${API_BASE}/${id}`, data);
};

export const useUpdateYearSeason = ({
  mutationConfig,
}: {
  mutationConfig?: MutationConfig<typeof updateYearSeason>;
} = {}) => {
  return useMutation({
    mutationFn: updateYearSeason,
    ...mutationConfig,
  });
};

// ============================================
// PATCH: Update YearSeason Status (Expert only)
// ============================================
export const updateYearSeasonStatus = ({
  id,
  data,
}: {
  id: string;
  data: UpdateYearSeasonStatusDto;
}): Promise<YearSeason> => {
  // Backend requires id in both route and body
  return api.patch(`${API_BASE}/${id}/status`, { ...data, id });
};

export const useUpdateYearSeasonStatus = ({
  mutationConfig,
}: {
  mutationConfig?: MutationConfig<typeof updateYearSeasonStatus>;
} = {}) => {
  return useMutation({
    mutationFn: updateYearSeasonStatus,
    ...mutationConfig,
  });
};

// ============================================
// DELETE: Delete YearSeason (Expert only)
// ============================================
export const deleteYearSeason = (id: string): Promise<void> => {
  return api.delete(`${API_BASE}/${id}`);
};

export const useDeleteYearSeason = ({
  mutationConfig,
}: {
  mutationConfig?: MutationConfig<typeof deleteYearSeason>;
} = {}) => {
  return useMutation({
    mutationFn: deleteYearSeason,
    ...mutationConfig,
  });
};

