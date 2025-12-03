import { Users, MapPin, Phone, Mail, Download, Search } from 'lucide-react';
import { useState } from 'react';

import { ContentLayout } from '@/components/layouts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/components/ui/notifications';
import { Spinner } from '@/components/ui/spinner';
import { useFarmers } from '@/features/farmers/api/get-farmers';
import { useExportFarmers } from '@/features/farmers/api/export-farmers';
import { FarmerDetailDialog } from '@/features/farmers/components/farmer-detail-dialog';
import { ImportFarmersDialog } from '@/features/farmers/components/import-farmers-dialog';
import { useUser } from '@/lib/auth';

const ClusterFarmers = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(12);
  const [searchTerm, setSearchTerm] = useState('');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedFarmerId, setSelectedFarmerId] = useState<string | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const { addNotification } = useNotifications();
  const user = useUser();

  const { data, isLoading, isError } = useFarmers({
    params: {
      pageNumber,
      pageSize,
      searchTerm: searchTerm || undefined,
      clusterManagerId: user.data?.id,
    },
  });

  const farmers = data?.data || [];
  const totalPages = data?.totalPages || 0;
  const totalCount = data?.totalCount || 0;
  const currentPage = data?.currentPage || 1;

  const exportMutation = useExportFarmers({
    mutationConfig: {
      onSuccess: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `farmers_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        addNotification({
          type: 'success',
          title: 'Export Successful',
          message: 'Farmers data has been exported successfully',
        });
      },
      onError: (error: any) => {
        addNotification({
          type: 'error',
          title: 'Export Failed',
          message: error.message || 'Unknown error occurred',
        });
      },
    },
  });

  const handleExport = () => {
    const today = new Date().toISOString();
    exportMutation.mutate({
      date: today,
      clusterManagerId: user.data?.id,
    });
  };

  const handleViewDetails = (farmerId: string) => {
    setSelectedFarmerId(farmerId);
    setDetailDialogOpen(true);
  };

  if (isLoading) {
    return (
      <ContentLayout title="Farmers Management">
        <div className="flex h-96 items-center justify-center">
          <Spinner size="lg" className="text-green-600" />
        </div>
      </ContentLayout>
    );
  }

  if (isError) {
    return (
      <ContentLayout title="Farmers Management">
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold text-red-500">
              Failed to load farmers
            </p>
            <p className="mt-2 text-muted-foreground">Please try again later</p>
          </div>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title="Farmers Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold leading-snug text-gray-900">
              Farmers
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage all farmers in your cluster
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setImportDialogOpen(true)}
              variant="outline"
              className="gap-2 border-green-600 text-green-600 hover:bg-green-50"
            >
              Import Farmers
            </Button>
            <Button
              onClick={handleExport}
              disabled={exportMutation.isPending}
              isLoading={exportMutation.isPending}
              variant="outline"
              icon={<Download className="size-4" />}
              className="gap-2"
            >
              Export
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-blue-100">
                <Users className="size-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
                  Total Farmers
                </p>
                <p className="mt-1 text-2xl font-bold leading-snug text-gray-900">
                  {totalCount}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-green-100">
                <Users className="size-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
                  Active Farmers
                </p>
                <p className="mt-1 text-2xl font-bold leading-snug text-gray-900">
                  {farmers.filter((f) => f.isActive).length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-purple-100">
                <Users className="size-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
                  Current Page
                </p>
                <p className="mt-1 text-2xl font-bold leading-snug text-gray-900">
                  {farmers.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-orange-100">
                <MapPin className="size-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
                  Total Plots
                </p>
                <p className="mt-1 text-2xl font-bold leading-snug text-gray-900">
                  {farmers.reduce((sum, f) => sum + f.plotCount, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6 flex gap-4">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, phone, or code..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPageNumber(1);
              }}
              className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm transition-colors focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
        </div>

        {/* Farmers Table */}
        {farmers.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-200 bg-white py-16 text-center">
            <Users className="mx-auto mb-4 size-16 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900">
              No farmers found
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-gray-600">
              {searchTerm
                ? 'Try adjusting your search'
                : 'Start by importing farmers'}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Farmer Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Plots
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Last Activity
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {farmers.map((farmer) => (
                    <tr key={farmer.farmerId} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                            <Users className="size-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {farmer.fullName}
                            </div>
                            <div className="font-mono text-xs text-gray-500">
                              {farmer.farmCode}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Phone className="size-4 text-gray-400" />
                          {farmer.phoneNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <MapPin className="size-4 text-gray-400" />
                          <span className="line-clamp-2">{farmer.address}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {farmer.isActive ? (
                          <Badge className="border border-green-200 bg-green-100 text-green-800">
                            Active
                          </Badge>
                        ) : (
                          <Badge className="border border-gray-200 bg-gray-100 text-gray-800">
                            Inactive
                          </Badge>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {farmer.plotCount}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {new Date(farmer.lastActivityAt).toLocaleDateString(
                            'en-US',
                            {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            },
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:bg-green-50 hover:text-green-700"
                          onClick={() => handleViewDetails(farmer.farmerId)}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
                <div className="text-sm text-gray-600">
                  Showing page {currentPage} of {totalPages} ({totalCount} total
                  farmers)
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setPageNumber((prev) => Math.max(1, prev - 1))
                    }
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setPageNumber((prev) => Math.min(totalPages, prev + 1))
                    }
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <FarmerDetailDialog
        farmerId={selectedFarmerId}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />
      <ImportFarmersDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
      />
    </ContentLayout>
  );
};

export const Component = ClusterFarmers;
export default ClusterFarmers;
