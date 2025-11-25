import { queryOptions, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export type PestProtocol = {
  id: string;
  name: string;
  description: string;
  type: string;
  imageLinks: string[]; // Changed from imageLink to imageLinks
  isActive: boolean;
  notes: string;
  createdAt: string;
  lastModified: string;
};

type GetPestProtocolsParams = {
  currentPage?: number;
  pageSize?: number;
  searchName?: string;
  isActive?: boolean;
};

export const getPestProtocols = async (
  params?: GetPestProtocolsParams
): Promise<{
  data: PestProtocol[];
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}> => {
  return api.post('/PestProtocol/get-all', {
    currentPage: params?.currentPage || 1,
    pageSize: params?.pageSize || 10,
    searchName: params?.searchName || '',
    isActive: params?.isActive ?? true,
  });
};

export const getPestProtocolsQueryOptions = (params?: GetPestProtocolsParams) => {
  return queryOptions({
    queryKey: ['pest-protocols', params],
    queryFn: () => getPestProtocols(params),
  });
};

type UsePestProtocolsOptions = {
  params?: GetPestProtocolsParams;
  queryConfig?: QueryConfig<typeof getPestProtocolsQueryOptions>;
};

export const usePestProtocols = ({
  params,
  queryConfig,
}: UsePestProtocolsOptions = {}) => {
  return useQuery({
    ...getPestProtocolsQueryOptions(params),
    ...queryConfig,
  });
};

// Create Pest Protocol
export type CreatePestProtocolDTO = {
  name: string;
  description: string;
  type: string;
  imageLinks: string[]; // Changed from imageLink to imageLinks
  isActive: boolean;
  notes: string;
};

export const createPestProtocol = (
  data: CreatePestProtocolDTO
): Promise<{
  succeeded: boolean;
  data: string;
  message: string;
  errors: string[];
}> => {
  return api.post('/PestProtocol', data);
};

export const useCreatePestProtocol = ({
  mutationConfig,
}: {
  mutationConfig?: any;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPestProtocol,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['pest-protocols'] });
      mutationConfig?.onSuccess?.(...args);
    },
    ...mutationConfig,
  });
};

// Upload files
export type UploadFilesResponse = {
  success: boolean;
  count: number;
  files: Array<{
    url: string;
    fileName: string;
  }>;
};

export const uploadFiles = async (files: File[]): Promise<UploadFilesResponse> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('Files', file);
  });
  return api.post('/Test/upload-files', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const useUploadFiles = ({
  mutationConfig,
}: {
  mutationConfig?: any;
} = {}) => {
  return useMutation({
    mutationFn: uploadFiles,
    ...mutationConfig,
  });
};