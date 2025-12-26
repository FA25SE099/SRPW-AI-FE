import { ContentLayout } from '@/components/layouts';
import { RiceVarietiesList } from '@/features/rice-varieties/components/rice-varieties-list';
import { Leaf } from 'lucide-react';

const RiceVarietiesRoute = () => {
  return (
    <div>
      <div className="bg-white border-b border-neutral-200 px-6 py-4 shadow-sm mb-6">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-3 shadow-lg">
            <Leaf className="size-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
              Rice Varieties Management
            </h1>
            <p className="text-sm text-neutral-600 mt-1">
              Manage rice varieties, categories, and seasonal associations
            </p>
          </div>
        </div>
      </div>
      <RiceVarietiesList />
    </div>
  );
};

export default RiceVarietiesRoute;

