import { useState, useMemo } from 'react';
import { Package, Clock, CheckCircle, AlertTriangle, Users } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useGroupedDistributions } from '../api';
import { FarmerDistribution, MaterialDistributionFilter } from '../types';
import { FarmerDistributionCard } from './farmer-distribution-card';
import { BulkConfirmModal } from './bulk-confirm-modal';

interface GroupedDistributionDashboardProps {
  groupId: string;
  supervisorId: string;
}

export const GroupedDistributionDashboard = ({
  groupId,
  supervisorId,
}: GroupedDistributionDashboardProps) => {
  const [filter, setFilter] = useState<MaterialDistributionFilter>('all');
  const [selectedDistribution, setSelectedDistribution] =
    useState<FarmerDistribution | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, error } = useGroupedDistributions({
    groupId,
  });

  // Calculate summary counts
  const summary = useMemo(() => {
    if (!data?.farmerDistributions) {
      return {
        totalFarmers: 0,
        totalMaterials: 0,
        pendingCount: 0,
        partiallyConfirmedCount: 0,
        completedCount: 0,
        overdueCount: 0,
      };
    }

    const pending = data.farmerDistributions.filter((d) => d.status === 'Pending').length;
    const partiallyConfirmed = data.farmerDistributions.filter(
      (d) => d.status === 'PartiallyConfirmed'
    ).length;
    const completed = data.farmerDistributions.filter((d) => d.status === 'Completed').length;
    const overdue = data.farmerDistributions.filter((d) => d.isSupervisorOverdue).length;

    return {
      totalFarmers: data.totalFarmers,
      totalMaterials: data.totalMaterials,
      pendingCount: pending,
      partiallyConfirmedCount: partiallyConfirmed,
      completedCount: completed,
      overdueCount: overdue,
    };
  }, [data]);

  const filteredDistributions = useMemo(() => {
    if (!data?.farmerDistributions) return [];

    switch (filter) {
      case 'pending':
        return data.farmerDistributions.filter((d) => d.status === 'Pending');
      case 'overdue':
        return data.farmerDistributions.filter((d) => d.isSupervisorOverdue);
      case 'completed':
        return data.farmerDistributions.filter((d) => d.status === 'Completed');
      default:
        return data.farmerDistributions;
    }
  }, [data, filter]);

  const handleBulkConfirm = (plotCultivationId: string) => {
    const distribution = data?.farmerDistributions.find(
      (d) => d.plotCultivationId === plotCultivationId
    );
    if (distribution) {
      setSelectedDistribution(distribution);
      setIsModalOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">
          Failed to load material distributions. Please try again.
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-gray-600">No distribution data available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Farmers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalFarmers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.totalMaterials} total materials
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {summary.pendingCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting confirmation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Awaiting Farmer
            </CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {summary.partiallyConfirmedCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Farmer to confirm
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {summary.completedCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Fully confirmed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Alert */}
      {summary.overdueCount > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-900">
              You have {summary.overdueCount} overdue distribution(s)
            </p>
            <p className="text-sm text-red-700">
              Please confirm these distributions as soon as possible.
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({summary.totalFarmers})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'pending'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Pending ({summary.pendingCount})
        </button>
        <button
          onClick={() => setFilter('overdue')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'overdue'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Overdue ({summary.overdueCount})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'completed'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Completed ({summary.completedCount})
        </button>
      </div>

      {/* Distribution List */}
      {filteredDistributions.length === 0 ? (
        <div className="p-12 text-center bg-gray-50 rounded-lg border border-gray-200">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No distributions found</p>
          <p className="text-sm text-gray-500 mt-1">
            {filter === 'all'
              ? 'There are no material distributions for this group yet.'
              : `No ${filter} distributions at the moment.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredDistributions.map((distribution) => (
            <FarmerDistributionCard
              key={distribution.plotCultivationId}
              distribution={distribution}
              onBulkConfirm={handleBulkConfirm}
            />
          ))}
        </div>
      )}

      {/* Bulk Confirm Modal */}
      <BulkConfirmModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDistribution(null);
        }}
        distribution={selectedDistribution}
        supervisorId={supervisorId}
      />
    </div>
  );
};

