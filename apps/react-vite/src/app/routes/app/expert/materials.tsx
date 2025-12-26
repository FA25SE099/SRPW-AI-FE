import { ContentLayout } from '@/components/layouts';
import { MaterialsList } from '@/features/materials/components/materials-list';
import { Beaker, BeakerIcon } from 'lucide-react';

const MaterialsRoute = () => {
  return (
    <div>
      <div className="bg-white border-b border-neutral-200 px-6 py-4 shadow-sm mb-6">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 p-3 shadow-lg">
            <Beaker className="size-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
              Material & Treatment Library
            </h1>
            <p className="text-sm text-neutral-600 mt-1">
              Manage pesticides, fertilizers, and treatment materials
            </p>
          </div>
        </div>
      </div>
      <MaterialsList />
    </div>
  );
};

export default MaterialsRoute;
