import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Material, PagedResult, MaterialType } from '@/types/api';

type GetMaterialsParams = {
  currentPage: number;
  pageSize: number;
  type?: MaterialType;
};

export const getMaterials = async (
  params: GetMaterialsParams,
): Promise<PagedResult<Material[]>> => {
  const formData = new FormData();
  formData.append('currentPage', params.currentPage.toString());
  formData.append('pageSize', params.pageSize.toString());
  if (params.type !== undefined) {
    formData.append('type', params.type.toString());
  }

  // The api-client interceptor now detects PagedResult and keeps it intact
  return api.post('/material/get-all', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getMaterialsQueryOptions = (params: GetMaterialsParams) => {
  return queryOptions({
    queryKey: ['materials', params],
    queryFn: () => getMaterials(params),
  });
};

type UseMaterialsOptions = {
  params: GetMaterialsParams;
  queryConfig?: QueryConfig<typeof getMaterialsQueryOptions>;
};

export const useMaterials = ({ params, queryConfig }: UseMaterialsOptions) => {
  return useQuery({
    ...getMaterialsQueryOptions(params),
    ...queryConfig,
  }) as ReturnType<typeof useQuery<PagedResult<Material[]>, Error>>;
};

