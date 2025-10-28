import { ContentLayout } from '@/components/layouts';
import { StandardPlansList } from '@/features/standard-plans/components';

export default function StandardPlansRoute() {
  return (
    <ContentLayout title="Standard Plans">
      <StandardPlansList />
    </ContentLayout>
  );
}

