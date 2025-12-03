import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { 
  ExpertPendingPlanItem, 
  GetPendingApprovalsParams, 
  PagedResult 
} from '@/types/api';

export const getPendingApprovals = (
  params: GetPendingApprovalsParams = {}
): Promise<PagedResult<ExpertPendingPlanItem[]>> => {
  return api.get('/expert/pending-approvals', {
    params: {
      currentPage: params.currentPage || 1,
      pageSize: params.pageSize || 10,
      ...(params.status && { status: params.status }),
      ...(params.priority && { priority: params.priority }),
    },
  });
};

export const getPendingApprovalsQueryOptions = (
  params: GetPendingApprovalsParams = {}
) => {
  return queryOptions({
    queryKey: ['pending-approvals', params],
    queryFn: () => getPendingApprovals(params),
  });
};

type UsePendingApprovalsOptions = {
  params?: GetPendingApprovalsParams;
  queryConfig?: QueryConfig<typeof getPendingApprovals>;
};

export const usePendingApprovals = ({
  queryConfig,
  params,
}: UsePendingApprovalsOptions = {}) => {
  return useQuery({
    ...queryConfig,
    queryKey: ['pending-approvals', params],
    queryFn: () => getPendingApprovals(params),
  });
};

