import { useState } from 'react';
import { useCalculateStandardPlanMaterialCost } from '../api/calculate-standard-plan-material-cost';
import { StandardPlan, StandardPlanMaterialCost } from '@/types/api';
import { SimpleDialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button/button';
import { Spinner } from '@/components/ui/spinner';
import { DollarSign, Package, TrendingUp, Info, ChevronDown, ChevronUp } from 'lucide-react';

type StandardPlanReviewDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  plan: StandardPlan | null;
};

export const StandardPlanReviewDialog = ({
  isOpen,
  onClose,
  plan,
}: StandardPlanReviewDialogProps) => {
  const [areaInHectares, setAreaInHectares] = useState<number>(1);
  const [result, setResult] = useState<StandardPlanMaterialCost | null>(null);
  const [openTask, setOpenTask] = useState<string | null>(null);

  const costCalculationMutation = useCalculateStandardPlanMaterialCost({
    mutationConfig: {
      onSuccess: (data) => {
        setResult(data);
      },
    },
  });

  const handleCalculateCost = () => {
    if (plan && areaInHectares > 0) {
      costCalculationMutation.mutate({
        standardPlanId: plan.id,
        area: areaInHectares,
      });
    }
  };

  const handleClose = () => {
    setAreaInHectares(1);
    setResult(null);
    setOpenTask(null);
    onClose();
  };

  const renderContent = () => {
    if (costCalculationMutation.isPending) {
      return (
        <div className="flex h-48 items-center justify-center">
          <Spinner size="lg" />
        </div>
      );
    }

    if (result) {
      return (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border bg-green-50 p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Tổng Chi Phí cho Diện Tích</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-green-900">
                {result.totalCostForArea.toLocaleString('vi-VN')}
              </p>
              <p className="text-xs text-green-700">VND cho {result.area} ha</p>
            </div>

            <div className="rounded-lg border bg-purple-50 p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Chi Phí/Hecta</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-purple-900">
                {result.totalCostPerHa.toLocaleString('vi-VN')}
              </p>
              <p className="text-xs text-purple-700">VND/ha</p>
            </div>

            <div className="rounded-lg border bg-orange-50 p-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">Loại Vật Liệu</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-orange-900">
                {result.materialCostItems.length}
              </p>
              <p className="text-xs text-orange-700">loại</p>
            </div>
          </div>

          {/* Task Cost Breakdowns */}
          <div>
            <h3 className="mb-3 text-lg font-semibold text-gray-800">Phân Tích Chi Phí Nhiệm Vụ</h3>
            <div className="space-y-2">
              {result.taskCostBreakdowns.map((task) => (
                <div key={task.taskName} className="rounded-lg border">
                  <button
                    className="flex w-full items-center justify-between p-4 text-left"
                    onClick={() => setOpenTask(openTask === task.taskName ? null : task.taskName)}
                  >
                    <div>
                      <p className="font-medium text-gray-900">{task.taskName}</p>
                      <p className="text-sm text-gray-500">{task.taskDescription}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-blue-600">
                        {task.totalTaskCost.toLocaleString('vi-VN')} VND
                      </span>
                      {openTask === task.taskName ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </button>
                  {openTask === task.taskName && (
                    <div className="border-t bg-gray-50 p-4">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                              Vật Liệu
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                              Số Lượng Cần
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                              Gói
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                              Tổng Chi Phí
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {task.materials.map((item) => (
                            <tr key={item.materialId}>
                              <td className="px-4 py-2 text-sm text-gray-800">{item.materialName}</td>
                              <td className="px-4 py-2 text-sm text-gray-600">
                                {item.totalQuantityNeeded.toFixed(2)} {item.unit}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-600">{item.packagesNeeded}</td>
                              <td className="px-4 py-2 text-sm font-medium text-gray-800">
                                {item.totalCost.toLocaleString('vi-VN')} VND
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {result.priceWarnings && result.priceWarnings.length > 0 && (
            <div className="rounded-md bg-yellow-50 p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Info className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Cảnh Báo Giá</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <ul className="list-disc space-y-1 pl-5">
                      {result.priceWarnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setResult(null)}>
              Quay lại
            </Button>
            <Button onClick={handleClose}>Đóng</Button>
          </div>
        </div>
      );
    }

    return (
      <>
        <p className="text-sm text-gray-600">
          Nhập diện tích canh tác để tính toán chi phí vật liệu ước tính cho kế hoạch chuẩn này.
        </p>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Diện Tích (Hecta) *</label>
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={areaInHectares}
            onChange={(e) => setAreaInHectares(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="VD: 10.5"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleClose}>
            Hủy
          </Button>
          <Button
            onClick={handleCalculateCost}
            disabled={areaInHectares <= 0 || costCalculationMutation.isPending}
            isLoading={costCalculationMutation.isPending}
          >
            Tính Chi Phí
          </Button>
        </div>
      </>
    );
  };

  return (
    <SimpleDialog
      isOpen={isOpen}
      onClose={handleClose}
      title={`Xem Xét Chi Phí: ${plan?.name || 'Kế Hoạch Chuẩn'}`}
      maxWidth="4xl"
    >
      <div className="space-y-4">{renderContent()}</div>
    </SimpleDialog>
  );
};

