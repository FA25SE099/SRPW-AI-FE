import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { LoaderFunctionArgs } from 'react-router';

import { ContentLayout } from '@/components/layouts';
import { getInfiniteCommentsQueryOptions } from '@/features/comments/api/get-comments';


const DiscussionsRoute = () => {
  const queryClient = useQueryClient();
  return (
    <ContentLayout title="Discussions">
      <div className="flex justify-end">
      </div>
    </ContentLayout>
  );
};

export default DiscussionsRoute;
