import { ContentLayout } from '@/components/layouts';
import { MaterialsList } from '@/features/materials/components/materials-list';

const MaterialsRoute = () => {
  return (
    <ContentLayout title="Material & Treatment Library">
      <div className="mb-6">
        <p className="text-sm text-gray-600">
          Manage pesticides, fertilizers, and treatment materials
        </p>
      </div>
      <MaterialsList />
    </ContentLayout>
  );
};

export default MaterialsRoute;
