// /**
//  * @deprecated This API is deprecated. Use `get-group-by-season.ts` instead.
//  * The new API provides state-based responses and better performance.
//  * See API_USAGE_GUIDE.md for migration instructions.
//  */

// import { useQuery, queryOptions } from '@tanstack/react-query';

// import { api } from '@/lib/api-client';
// import { QueryConfig } from '@/lib/react-query';
// import { MyGroupResponse } from '@/types/group';

// export const getMyGroup = (seasonId?: string): Promise<MyGroupResponse> => {
//   const url = seasonId
//     ? `/Supervisor/my-group?seasonId=${seasonId}`
//     : '/Supervisor/my-group';
//   return api.get(url);
// };

// export const getMyGroupQueryOptions = (seasonId?: string) => {
//   return queryOptions({
//     queryKey: seasonId ? ['supervisor-group', seasonId] : ['supervisor-group'],
//     queryFn: () => getMyGroup(seasonId),
//   });
// };

// type UseMyGroupOptions = {
//   seasonId?: string;
//   queryConfig?: QueryConfig<typeof getMyGroupQueryOptions>;
// };

// export const useMyGroup = ({ seasonId, queryConfig }: UseMyGroupOptions = {}) => {
//   return useQuery({
//     ...getMyGroupQueryOptions(seasonId),
//     ...queryConfig,
//   });
// };

