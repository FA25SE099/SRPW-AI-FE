import { ContentLayout } from '@/components/layouts';
import { StandardPlansList } from '@/features/standard-plans/components';
import { ClipboardList } from 'lucide-react';

export default function StandardPlansRoute() {
  return (
    <div>
      <div className="bg-white border-b border-neutral-200 px-6 py-4 shadow-sm mb-6">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-3 shadow-lg">
            <ClipboardList className="size-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
              Kế hoạch tiêu chuẩn
            </h1>
            <p className="text-sm text-neutral-600 mt-1">
              Quản lý và xem kế hoạch canh tác lúa tiêu chuẩn và giao thức
            </p>
          </div>
        </div>
      </div>
      <StandardPlansList />
    </div>
  );
}

