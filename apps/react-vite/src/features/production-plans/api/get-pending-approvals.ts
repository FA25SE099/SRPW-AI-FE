import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export type PendingApprovalItem = {
  planId: string;
  planName: string;
  groupName: string;
  supervisorName: string;
  submittedAt: string;
  estimatedCost: number;
  totalArea: number;
  plotCount: number;
};

type GetPendingApprovalsParams = {
  groupId?: string;
  seasonId?: string;
};

export const getPendingApprovals = async (
  params?: GetPendingApprovalsParams
): Promise<PendingApprovalItem[]> => {
  const queryParams = new URLSearchParams();

  if (params?.groupId) queryParams.append('groupId', params.groupId);
  if (params?.seasonId) queryParams.append('seasonId', params.seasonId);

  const url = `/production-plans/pending-approvals${
    queryParams.toString() ? `?${queryParams.toString()}` : ''
  }`;

  return api.get(url);
};

type UsePendingApprovalsOptions = {
  params?: GetPendingApprovalsParams;
  queryConfig?: QueryConfig<typeof getPendingApprovals>;
};

export const usePendingApprovals = ({
  params,
  queryConfig,
}: UsePendingApprovalsOptions = {}) => {
  return useQuery({
    ...queryConfig,
    queryKey: ['production-plans', 'pending-approvals', params],
    queryFn: () => getPendingApprovals(params),
  });
};

