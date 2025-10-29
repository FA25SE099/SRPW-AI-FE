import { ContentLayout } from '@/components/layouts';
import { RiceVarietiesList } from '@/features/rice-varieties/components/rice-varieties-list';

const RiceVarietiesRoute = () => {
  return (
    <ContentLayout title="Rice Varieties Management">
      <div className="mb-6">
        <p className="text-sm text-gray-600">
          Manage rice varieties, categories, and seasonal associations
        </p>
      </div>
      <RiceVarietiesList />
    </ContentLayout>
  );
};

export default RiceVarietiesRoute;

