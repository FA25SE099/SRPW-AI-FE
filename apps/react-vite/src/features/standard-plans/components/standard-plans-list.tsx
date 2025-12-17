import { useState } from 'react';
import { Download, FileDown, Eye, Edit, Calendar, Clock, ListChecks, Plus, CheckCircle } from 'lucide-react';

import { useStandardPlans } from '../api/get-standard-plans';
import { useDownloadStandardPlans } from '../api/download-standard-plans';
import { useDownloadStandardPlanTemplate } from '../api/download-standard-plan-template';
import { useCategories } from '@/features/rice-varieties/api/get-categories';
import { StandardPlanDetailDialog } from './standard-plan-detail-dialog';
import { StandardPlanReviewDialog } from './standard-plan-review-dialog';
import { UpdateStandardPlanDialog } from './update-standard-plan-dialog';
import { CreateStandardPlanDialog } from './create-standard-plan-dialog';
import { StandardPlan } from '@/types/api';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button/button';

export const StandardPlansList = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | undefined>(true);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<StandardPlan | null>(null);

  const categoriesQuery = useCategories();
  const standardPlansQuery = useStandardPlans({
    params: {
      categoryId: selectedCategory || undefined,
      searchTerm: searchTerm || undefined,
      isActive: filterActive,
    },
  });

  const downloadExcelMutation = useDownloadStandardPlans();
  const downloadTemplateMutation = useDownloadStandardPlanTemplate();

  const handleDownloadExcel = () => {
    downloadExcelMutation.mutate({
      inputDate: new Date().toISOString(),
      categoryId: selectedCategory || undefined,
      isActive: filterActive,
    });
  };

  const handleDownloadTemplate = () => {
    downloadTemplateMutation.mutate(undefined);
  };

  const handleViewDetail = (plan: StandardPlan) => {
    setSelectedPlan(plan);
    setDetailDialogOpen(true);
  };

  const handleReview = (plan: StandardPlan) => {
    setSelectedPlan(plan);
    setReviewDialogOpen(true);
  };

  const handleEdit = (plan: StandardPlan) => {
    setSelectedPlan(plan);
    setUpdateDialogOpen(true);
  };

  if (standardPlansQuery.isLoading || categoriesQuery.isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const plans = standardPlansQuery.data || [];
  const categories = categoriesQuery.data || [];

  return (
    <>
      <div className="space-y-4">
        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setCreateDialogOpen(true)}
              icon={<Plus className="h-4 w-4" />}
            >
              Create Standard Plan
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === '' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('')}
              className={selectedCategory === '' ? '' : 'text-gray-700'}
            >
              All Categories
            </Button>
            {categories.map((category: any) => {
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category.id)}
                  className={selectedCategory === category.id ? '' : 'text-gray-700'}
                >
                  {category.categoryName || category.name || 'Unnamed Category'}
                </Button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex gap-1 rounded-md border p-1">
              <Button
                variant={filterActive === undefined ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilterActive(undefined)}
              >
                All
              </Button>
              <Button
                variant={filterActive === true ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilterActive(true)}
              >
                Active
              </Button>
              <Button
                variant={filterActive === false ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilterActive(false)}
              >
                Inactive
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={handleDownloadExcel}
              isLoading={downloadExcelMutation.isPending}
              icon={<Download className="h-4 w-4" />}
            >
              Export Excel
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadTemplate}
              isLoading={downloadTemplateMutation.isPending}
              icon={<FileDown className="h-4 w-4" />}
            >
              Template
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by plan name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>

        {/* Plans Grid */}
        {plans.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                    <p className="text-sm text-gray-500">{plan.categoryName}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${plan.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                      }`}
                  >
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {plan.description && (
                  <p className="mt-3 line-clamp-2 text-sm text-gray-600">{plan.description}</p>
                )}

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-md bg-blue-50 p-2">
                    <Clock className="mx-auto h-4 w-4 text-blue-600" />
                    <p className="mt-1 text-xs font-medium text-blue-900">{plan.totalDuration} days</p>
                  </div>
                  <div className="rounded-md bg-purple-50 p-2">
                    <ListChecks className="mx-auto h-4 w-4 text-purple-600" />
                    <p className="mt-1 text-xs font-medium text-purple-900">{plan.totalStages} stages</p>
                  </div>
                  <div className="rounded-md bg-green-50 p-2">
                    <Calendar className="mx-auto h-4 w-4 text-green-600" />
                    <p className="mt-1 text-xs font-medium text-green-900">{plan.totalTasks} tasks</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex gap-2 border-t pt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewDetail(plan)}
                    icon={<Eye className="h-3 w-3" />}
                    className="flex-1"
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReview(plan)}
                    icon={<Calendar className="h-3 w-3" />}
                    className="flex-1"
                  >
                    Review
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(plan)}
                    icon={<Edit className="h-3 w-3" />}
                    className="flex-1"
                  >
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-48 items-center justify-center rounded-lg border border-dashed">
            <p className="text-gray-500">No standard plans found</p>
          </div>
        )}
      </div>

      <StandardPlanDetailDialog
        isOpen={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        planId={selectedPlan?.id || ''}
      />

      <StandardPlanReviewDialog
        isOpen={reviewDialogOpen}
        onClose={() => setReviewDialogOpen(false)}
        plan={selectedPlan}
      />

      <UpdateStandardPlanDialog
        isOpen={updateDialogOpen}
        onClose={() => setUpdateDialogOpen(false)}
        plan={selectedPlan}
      />

      {/* Create Standard Plan Dialog */}
      <CreateStandardPlanDialog
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />
    </>
  );
};

