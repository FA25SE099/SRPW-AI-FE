import { useState } from 'react';
import { useStandardPlanReview } from '../api/get-standard-plan-review';
import { StandardPlan } from '@/types/api';
import { SimpleDialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Calendar, DollarSign, TrendingUp, Package } from 'lucide-react';

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
  const [sowDate, setSowDate] = useState('');
  const [areaInHectares, setAreaInHectares] = useState<number>(1);
  const [showReview, setShowReview] = useState(false);

  const { data: review, isLoading } = useStandardPlanReview({
    params: {
      id: plan?.id || '',
      sowDate,
      areaInHectares,
    },
    queryConfig: {
      enabled: showReview && !!plan?.id && !!sowDate && areaInHectares > 0,
    },
  });

  const handleReview = () => {
    if (sowDate && areaInHectares > 0) {
      setShowReview(true);
    }
  };

  const handleClose = () => {
    setSowDate('');
    setAreaInHectares(1);
    setShowReview(false);
    onClose();
  };

  return (
    <SimpleDialog
      isOpen={isOpen}
      onClose={handleClose}
      title={`Review: ${plan?.name || 'Standard Plan'}`}
      maxWidth="3xl"
    >
      <div className="space-y-4">
        {/* Input Form */}
        {!showReview && (
          <>
            <p className="text-sm text-gray-600">
              Enter the sowing date and cultivation area to preview the plan with estimated costs and schedule.
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Sowing Date *
                </label>
                <input
                  type="date"
                  value={sowDate}
                  onChange={(e) => setSowDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Area (Hectares) *
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={areaInHectares}
                  onChange={(e) => setAreaInHectares(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  placeholder="e.g., 10.5"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleReview}
                disabled={!sowDate || areaInHectares <= 0}
                icon={<Calendar className="h-4 w-4" />}
              >
                Generate Review
              </Button>
            </div>
          </>
        )}

        {/* Review Results */}
        {showReview && (
          <>
            {isLoading ? (
              <div className="flex h-48 items-center justify-center">
                <Spinner size="lg" />
              </div>
            ) : review ? (
              <div className="space-y-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg border bg-blue-50 p-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Duration</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-blue-900">
                      {review.totalDurationDays}
                    </p>
                    <p className="text-xs text-blue-700">days</p>
                  </div>

                  <div className="rounded-lg border bg-green-50 p-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Total Cost</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-green-900">
                      {review.estimatedTotalCost.toLocaleString('vi-VN')}
                    </p>
                    <p className="text-xs text-green-700">VND</p>
                  </div>

                  <div className="rounded-lg border bg-purple-50 p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium text-purple-900">Cost/Hectare</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-purple-900">
                      {review.estimatedCostPerHectare.toLocaleString('vi-VN')}
                    </p>
                    <p className="text-xs text-purple-700">VND/ha</p>
                  </div>

                  <div className="rounded-lg border bg-orange-50 p-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-orange-600" />
                      <span className="text-sm font-medium text-orange-900">Materials</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-orange-900">
                      {review.totalMaterialQuantity.toFixed(1)}
                    </p>
                    <p className="text-xs text-orange-700">{review.totalMaterialTypes} types</p>
                  </div>
                </div>

                {/* Schedule Information */}
                <div className="rounded-lg border bg-gray-50 p-4">
                  <h4 className="font-semibold text-gray-900">Schedule</h4>
                  <div className="mt-2 grid grid-cols-1 gap-2 text-sm md:grid-cols-3">
                    <div>
                      <span className="font-medium text-gray-700">Start Date:</span>{' '}
                      <span className="text-gray-900">
                        {new Date(review.estimatedStartDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Sow Date:</span>{' '}
                      <span className="text-gray-900">
                        {new Date(review.sowDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">End Date:</span>{' '}
                      <span className="text-gray-900">
                        {new Date(review.estimatedEndDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Plan Info */}
                <div className="rounded-lg border bg-white p-4">
                  <h4 className="font-semibold text-gray-900">{review.planName}</h4>
                  {review.description && (
                    <p className="mt-1 text-sm text-gray-600">{review.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                      {review.categoryName}
                    </span>
                    <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
                      {review.totalStages} stages
                    </span>
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                      {review.totalTasks} tasks
                    </span>
                    <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
                      {areaInHectares} ha
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowReview(false)}>
                    Back
                  </Button>
                  <Button onClick={handleClose}>Close</Button>
                </div>
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center">
                <p className="text-gray-500">Unable to generate review</p>
              </div>
            )}
          </>
        )}
      </div>
    </SimpleDialog>
  );
};

