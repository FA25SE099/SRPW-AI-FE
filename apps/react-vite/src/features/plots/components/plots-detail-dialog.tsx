import {
  MapPin,
  User,
  Calendar,
  Leaf,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  FileText,
  ChevronRight,
  Map,
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePlotDetail } from '@/features/plots/api/get-plots-detail';
import type {
  PlotStatus,
  ProductionPlanStatus,
  CultivationStatus,
} from '@/features/plots/api/get-plots-detail';
import { PlotMapSnapshot } from '@/features/plots/components/plot-map-snapshot';

type PlotsDetailDialogProps = {
  plotId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const PlotsDetailDialog = ({
  plotId,
  open,
  onOpenChange,
}: PlotsDetailDialogProps) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'seasons' | 'plans' | 'cultivations'
  >('overview');

  const {
    data: plotDetail,
    isLoading,
    isError,
  } = usePlotDetail({
    plotId,
    queryConfig: {
      enabled: open && !!plotId,
    },
  });

  const plot = plotDetail;

  const getStatusBadge = (
    status: PlotStatus | ProductionPlanStatus | CultivationStatus,
  ) => {
    const statusStyles: Record<string, string> = {
      Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Inactive: 'bg-neutral-100 text-neutral-700 border-neutral-200',
      Emergency: 'bg-red-50 text-red-700 border-red-200',
      Locked: 'bg-amber-50 text-amber-700 border-amber-200',
      Draft: 'bg-neutral-100 text-neutral-700 border-neutral-200',
      Submitted: 'bg-sky-50 text-sky-700 border-sky-200',
      Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      InProgress: 'bg-amber-50 text-amber-700 border-amber-200',
      Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Cancelled: 'bg-red-50 text-red-700 border-red-200',
      Planned: 'bg-sky-50 text-sky-700 border-sky-200',
      Failed: 'bg-red-50 text-red-700 border-red-200',
    };
    return (
      statusStyles[status] ||
      'bg-neutral-100 text-neutral-700 border-neutral-200'
    );
  };

  const getStatusIcon = (
    status: PlotStatus | ProductionPlanStatus | CultivationStatus,
  ) => {
    switch (status) {
      case 'Active':
      case 'Approved':
      case 'Completed':
        return <CheckCircle2 className="size-3.5" />;
      case 'Emergency':
      case 'Failed':
      case 'Cancelled':
        return <AlertTriangle className="size-3.5" />;
      case 'InProgress':
        return <Clock className="size-3.5" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-5xl gap-0 overflow-y-auto p-0">
        <DialogHeader className="space-y-3 border-b border-neutral-200 px-8 py-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-3xl font-bold text-neutral-900">
                {isLoading
                  ? 'Loading...'
                  : `Plot ${plot?.soThua ?? 'N/A'} / ${plot?.soTo ?? 'N/A'}`}
              </DialogTitle>
              {plot?.farmerName && (
                <p className="mt-2 text-sm text-neutral-600">
                  Farmer:{' '}
                  <span className="font-semibold text-neutral-900">
                    {plot.farmerName}
                  </span>
                </p>
              )}
            </div>
            {plot && (
              <Badge
                className={`flex items-center gap-2 whitespace-nowrap border px-3 py-1.5 text-sm font-medium ${getStatusBadge(plot.status)}`}
              >
                {getStatusIcon(plot.status)}
                {plot.status}
              </Badge>
            )}
          </div>
          {plot?.plotId && (
            <p className="font-mono text-xs text-neutral-500">
              ID: {plot.plotId}
            </p>
          )}
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <Spinner size="lg" className="mx-auto mb-4 text-emerald-600" />
              <p className="font-medium text-neutral-600">
                Loading plot details...
              </p>
            </div>
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center px-8 py-24">
            <div className="mb-4 rounded-full bg-red-50 p-4">
              <AlertTriangle className="size-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900">
              Failed to load plot details
            </h3>
            <p className="mt-2 text-sm text-neutral-600">
              Please try again later
            </p>
            <Button
              variant="outline"
              className="mt-6 border-neutral-300 bg-transparent"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        )}

        {!isLoading && !isError && plot && (
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as typeof activeTab)}
            className="flex flex-col"
          >
            <TabsList className="grid h-auto w-full grid-cols-3 gap-0 rounded-none border-b border-neutral-200 bg-white px-8 py-0">
              <TabsTrigger
                value="overview"
                className="gap-2 rounded-none border-b-2 border-transparent px-0 py-4 text-sm font-medium text-neutral-600 data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600"
              >
                <FileText className="size-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="seasons"
                className="gap-2 rounded-none border-b-2 border-transparent px-0 py-4 text-sm font-medium text-neutral-600 data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600"
              >
                <Calendar className="size-4" />
                Seasons ({plot.seasons?.length || 0})
              </TabsTrigger>
              {/* <TabsTrigger
                value="plans"
                className="gap-2 rounded-none border-b-2 border-transparent px-0 py-4 text-sm font-medium text-neutral-600 data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600"
              >
                <TrendingUp className="size-4" />
                Plans ({plot.productionPlans?.length || 0})
              </TabsTrigger> */}
              <TabsTrigger
                value="cultivations"
                className="gap-2 rounded-none border-b-2 border-transparent px-0 py-4 text-sm font-medium text-neutral-600 data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600"
              >
                <Leaf className="size-4" />
                Cultivations ({plot.plotCultivations?.length || 0})
              </TabsTrigger>
            </TabsList>

            <div className="px-8 py-6">
              <TabsContent value="overview" className="mt-0 space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="rounded-lg border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-sm">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="rounded-full bg-emerald-50 p-2">
                        <MapPin className="size-5 text-emerald-600" />
                      </div>
                      <h3 className="text-base font-semibold text-neutral-900">
                        Plot Information
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                          Area
                        </p>
                        <p className="text-2xl font-bold text-emerald-600">
                          {plot.area?.toFixed(2) || 'N/A'}
                        </p>
                        <p className="text-sm text-neutral-600">hectares</p>
                      </div>
                      <div className="border-t border-neutral-100 pt-4">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                          Soil Type
                        </p>
                        <p className="text-sm font-medium text-neutral-900">
                          {plot.soilType || 'N/A'}
                        </p>
                      </div>
                      <div className="border-t border-neutral-100 pt-4">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                          Rice Variety
                        </p>
                        <p className="text-sm font-medium text-neutral-900">
                          {plot.varietyName || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-sm">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="rounded-full bg-blue-50 p-2">
                        <User className="size-5 text-blue-600" />
                      </div>
                      <h3 className="text-base font-semibold text-neutral-900">
                        Farmer Information
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                          Farmer Name
                        </p>
                        <p className="text-lg font-semibold text-neutral-900">
                          {plot.farmerName || 'N/A'}
                        </p>
                      </div>
                      <div className="border-t border-neutral-100 pt-4">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                          Farmer ID
                        </p>
                        <p className="break-all font-mono text-xs text-neutral-600">
                          {plot.farmerId || 'N/A'}
                        </p>
                      </div>
                      <div className="border-t border-neutral-100 pt-4">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                          Group ID
                        </p>
                        <p className="break-all font-mono text-xs text-neutral-600">
                          {plot.groupId || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {(plot.boundaryGeoJson || plot.coordinateGeoJson) && (
                  <div className="rounded-lg border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-sm">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="rounded-full bg-purple-50 p-2">
                        <Map className="size-5 text-purple-600" />
                      </div>
                      <h3 className="text-base font-semibold text-neutral-900">
                        Geographic Location
                      </h3>
                    </div>
                    <PlotMapSnapshot
                      boundaryGeoJson={plot.boundaryGeoJson}
                      coordinateGeoJson={plot.coordinateGeoJson ?? undefined}
                      plotName={`Plot ${plot.soThua ?? 'N/A'} / ${plot.soTo ?? 'N/A'}`}
                    />
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <Calendar className="size-5 text-emerald-600" />
                      <span className="text-xs font-semibold uppercase text-emerald-700">
                        Active
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-emerald-900">
                      {plot.seasons?.filter((s) => s.isActive).length || 0}
                    </p>
                    <p className="text-sm font-medium text-emerald-700">
                      Active Seasons
                    </p>
                  </div>

                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <TrendingUp className="size-5 text-blue-600" />
                      <span className="text-xs font-semibold uppercase text-blue-700">
                        Total
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-blue-900">
                      {plot.productionPlans?.length || 0}
                    </p>
                    <p className="text-sm font-medium text-blue-700">
                      Production Plans
                    </p>
                  </div>

                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <Leaf className="size-5 text-amber-600" />
                      <span className="text-xs font-semibold uppercase text-amber-700">
                        Records
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-amber-900">
                      {plot.plotCultivations?.length || 0}
                    </p>
                    <p className="text-sm font-medium text-amber-700">
                      Cultivations
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="seasons" className="mt-0 space-y-4">
                {!plot.seasons || plot.seasons.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 py-16 text-center">
                    <Calendar className="mx-auto mb-3 size-12 text-neutral-300" />
                    <p className="font-medium text-neutral-600">
                      No seasons available
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {plot.seasons.map((season) => (
                      <div
                        key={season.seasonId}
                        className={`rounded-lg border p-5 transition-all ${season.isActive
                          ? 'border-emerald-200 bg-emerald-50 shadow-sm'
                          : 'border-neutral-200 bg-white hover:shadow-sm'
                          }`}
                      >
                        <div className="mb-4 flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-base font-semibold text-neutral-900">
                              {season.seasonName}
                            </h4>
                            <p className="mt-1 text-sm text-neutral-600">
                              {season.seasonType}
                            </p>
                          </div>
                          {season.isActive && (
                            <Badge className="ml-2 border-emerald-300 bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="mr-1 size-3" />
                              Active
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-2 border-t border-neutral-200 pt-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="size-4 text-neutral-500" />
                            <span className="text-neutral-600">
                              {new Date(season.startDate).toLocaleDateString()}
                            </span>
                            <span className="text-neutral-400">→</span>
                            <span className="text-neutral-600">
                              {new Date(season.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="plans" className="mt-0 space-y-4">
                {!plot.productionPlans || plot.productionPlans.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 py-16 text-center">
                    <TrendingUp className="mx-auto mb-3 size-12 text-neutral-300" />
                    <p className="font-medium text-neutral-600">
                      No production plans found
                    </p>
                    <Button className="mt-6 bg-emerald-600 text-white hover:bg-emerald-700">
                      Create Production Plan
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {plot.productionPlans.map((plan) => (
                      <div
                        key={plan.productionPlanId}
                        className="rounded-lg border border-neutral-200 bg-white p-5 transition-shadow hover:shadow-md"
                      >
                        <div className="mb-4 flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-base font-semibold text-neutral-900">
                              {plan.planName}
                            </h4>
                          </div>
                          <Badge
                            className={`ml-2 flex items-center gap-1 border ${getStatusBadge(plan.status)}`}
                          >
                            {getStatusIcon(plan.status)}
                            {plan.status}
                          </Badge>
                        </div>

                        <div className="mb-4 grid grid-cols-2 gap-4 border-b border-neutral-200 pb-4 md:grid-cols-4">
                          <div>
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                              Total Area
                            </p>
                            <p className="text-base font-bold text-neutral-900">
                              {plan.totalArea?.toFixed(2) ?? 'N/A'}
                            </p>
                            <p className="text-xs text-neutral-600">hectares</p>
                          </div>
                          <div>
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                              Planting Date
                            </p>
                            <p className="text-sm font-semibold text-neutral-900">
                              {new Date(
                                plan.basePlantingDate,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                              Submitted
                            </p>
                            <p className="text-sm font-semibold text-neutral-900">
                              {plan.submittedAt
                                ? new Date(
                                  plan.submittedAt,
                                ).toLocaleDateString()
                                : 'Pending'}
                            </p>
                          </div>
                          <div>
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                              Approved
                            </p>
                            <p className="text-sm font-semibold text-neutral-900">
                              {plan.approvedAt
                                ? new Date(plan.approvedAt).toLocaleDateString()
                                : 'Pending'}
                            </p>
                          </div>
                        </div>

                        {plan.currentProductionStages &&
                          plan.currentProductionStages.length > 0 && (
                            <div>
                              <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-900">
                                <CheckCircle2 className="size-4 text-emerald-600" />
                                Production Stages (
                                {plan.currentProductionStages.length})
                              </p>
                              <div className="space-y-2">
                                {plan.currentProductionStages.map((stage) => (
                                  <div
                                    key={stage.productionStageId}
                                    className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${stage.isActive
                                      ? 'border-emerald-200 bg-emerald-50'
                                      : 'border-neutral-200 bg-neutral-50'
                                      }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="flex size-8 items-center justify-center rounded-full border-2 border-emerald-500 bg-white text-xs font-bold text-emerald-700">
                                        {stage.sequenceOrder}
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-sm font-medium text-neutral-900">
                                          {stage.stageName}
                                        </p>
                                        <p className="text-xs text-neutral-600">
                                          {stage.description}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="ml-4 text-right">
                                      <p className="mb-1 text-xs font-medium text-neutral-600">
                                        {stage.productionPlanTasks?.filter(
                                          (t) => t.status === 'Completed',
                                        ).length || 0}{' '}
                                        /{' '}
                                        {stage.productionPlanTasks?.length || 0}
                                      </p>
                                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-neutral-200">
                                        <div
                                          className="h-full rounded-full bg-emerald-500 transition-all"
                                          style={{
                                            width: `${stage.productionPlanTasks &&
                                              stage.productionPlanTasks.length >
                                              0
                                              ? (stage.productionPlanTasks.filter(
                                                (t) =>
                                                  t.status === 'Completed',
                                              ).length /
                                                stage.productionPlanTasks
                                                  .length) *
                                              100
                                              : 0
                                              }%`,
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4 w-full border-emerald-600 bg-transparent text-emerald-600 hover:bg-emerald-50"
                        >
                          View Full Plan Details
                          <ChevronRight className="ml-2 size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="cultivations" className="mt-0 space-y-4">
                {!plot.plotCultivations ||
                  plot.plotCultivations.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 py-16 text-center">
                    <Leaf className="mx-auto mb-3 size-12 text-neutral-300" />
                    <p className="font-medium text-neutral-600">
                      No cultivation records
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {plot.plotCultivations.map((cultivation) => (
                      <div
                        key={cultivation.plotCultivationId}
                        className="rounded-lg border border-neutral-200 bg-white p-5 transition-shadow hover:shadow-md"
                      >
                        <div className="mb-4 flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-base font-semibold text-neutral-900">
                              {new Date(
                                cultivation.plantingDate,
                              ).toLocaleDateString()}
                            </h4>
                          </div>
                          <Badge
                            className={`ml-2 flex items-center gap-1 border ${getStatusBadge(cultivation.status)}`}
                          >
                            {getStatusIcon(cultivation.status)}
                            {cultivation.status}
                          </Badge>
                        </div>

                        <div className="mb-4 grid grid-cols-3 gap-4 border-b border-neutral-200 pb-4">
                          <div>
                            <p className="mb-0.5 text-xs font-semibold text-neutral-500">
                              Actual Yield
                            </p>
                            <p className="text-lg font-bold text-emerald-600">
                              {cultivation.actualYield?.toFixed(2) ?? 'N/A'}
                            </p>
                            <p className="text-xs text-neutral-600">tons</p>
                          </div>
                          <div>
                            <p className="mb-0.5 text-xs font-semibold text-neutral-500">
                              Season ID
                            </p>
                            <p className="truncate font-mono text-xs text-neutral-600">
                              {cultivation.seasonId}
                            </p>
                          </div>
                          <div>
                            <p className="mb-0.5 text-xs font-semibold text-neutral-500">
                              Variety
                            </p>
                            <p className="truncate font-mono text-xs text-neutral-600">
                              {cultivation.riceVarietyId}
                            </p>
                          </div>
                        </div>

                        {cultivation.cultivationTasks &&
                          cultivation.cultivationTasks.length > 0 ? (
                          <div>
                            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-900">
                              <FileText className="size-4 text-emerald-600" />
                              Tasks ({cultivation.cultivationTasks.length})
                            </p>
                            <div className="space-y-3">
                              {cultivation.cultivationTasks.map((task) => {
                                const productionPlanTask = plot.productionPlans
                                  ?.flatMap((p) => p.currentProductionStages)
                                  .flatMap((stage) => stage.productionPlanTasks)
                                  .find(
                                    (t) =>
                                      t.productionPlanTaskId ===
                                      task.productionPlanTaskId,
                                  );

                                const taskStatus = task.completedAt
                                  ? 'Completed'
                                  : task.actualStartDate
                                    ? 'InProgress'
                                    : 'Pending';

                                return (
                                  <div
                                    key={task.cultivationTaskId}
                                    className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 transition-all hover:shadow-sm"
                                  >
                                    <div className="mb-3 flex items-start justify-between">
                                      <div className="flex-1">
                                        <p className="text-sm font-semibold text-neutral-900">
                                          {productionPlanTask?.taskName ||
                                            'Unnamed Task'}
                                        </p>
                                        {productionPlanTask?.taskType && (
                                          <Badge
                                            variant="outline"
                                            className="mt-1.5 border-blue-200 text-xs text-blue-700"
                                          >
                                            {productionPlanTask.taskType}
                                          </Badge>
                                        )}
                                      </div>
                                      <Badge
                                        variant="outline"
                                        className={`ml-3 whitespace-nowrap text-xs ${taskStatus === 'Completed'
                                          ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                                          : taskStatus === 'InProgress'
                                            ? 'border-amber-300 bg-amber-50 text-amber-700'
                                            : 'border-neutral-300 text-neutral-700'
                                          }`}
                                      >
                                        {taskStatus}
                                      </Badge>
                                    </div>

                                    {productionPlanTask?.description && (
                                      <p className="mb-3 text-xs leading-relaxed text-neutral-600">
                                        {productionPlanTask.description}
                                      </p>
                                    )}

                                    <div className="mb-3 grid grid-cols-2 gap-3">
                                      <div className="rounded border border-neutral-200 bg-white p-2.5">
                                        <p className="mb-0.5 text-xs text-neutral-500">
                                          Actual Start
                                        </p>
                                        <p className="text-sm font-medium text-neutral-900">
                                          {task.actualStartDate
                                            ? new Date(
                                              task.actualStartDate,
                                            ).toLocaleDateString()
                                            : 'Not started'}
                                        </p>
                                      </div>
                                      <div className="rounded border border-neutral-200 bg-white p-2.5">
                                        <p className="mb-0.5 text-xs text-neutral-500">
                                          Actual End
                                        </p>
                                        <p className="text-sm font-medium text-neutral-900">
                                          {task.actualEndDate
                                            ? new Date(
                                              task.actualEndDate,
                                            ).toLocaleDateString()
                                            : 'In progress'}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="mb-3 grid grid-cols-2 gap-3">
                                      <div className="rounded border border-emerald-200 bg-emerald-50 p-2.5">
                                        <p className="mb-0.5 text-xs text-emerald-700">
                                          Material Cost
                                        </p>
                                        <p className="text-sm font-bold text-emerald-900">
                                          {task.actualMaterialCost?.toLocaleString(
                                            'vi-VN',
                                          ) ?? 0}{' '}
                                          ₫
                                        </p>
                                      </div>
                                      <div className="rounded border border-blue-200 bg-blue-50 p-2.5">
                                        <p className="mb-0.5 text-xs text-blue-700">
                                          Service Cost
                                        </p>
                                        <p className="text-sm font-bold text-blue-900">
                                          {task.actualServiceCost?.toLocaleString(
                                            'vi-VN',
                                          ) ?? 0}{' '}
                                          ₫
                                        </p>
                                      </div>
                                    </div>

                                    {task.completionPercentage > 0 && (
                                      <div className="mt-3">
                                        <div className="mb-1.5 flex items-center justify-between">
                                          <p className="text-xs font-medium text-neutral-600">
                                            Progress
                                          </p>
                                          <p className="text-xs font-bold text-emerald-600">
                                            {task.completionPercentage}%
                                          </p>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-neutral-200">
                                          <div
                                            className="h-full rounded-full bg-emerald-500 transition-all"
                                            style={{
                                              width: `${task.completionPercentage}%`,
                                            }}
                                          />
                                        </div>
                                      </div>
                                    )}

                                    {task.isContingency &&
                                      task.contingencyReason && (
                                        <div className="mt-3 rounded border border-amber-200 bg-amber-50 p-2.5">
                                          <p className="text-xs text-amber-800">
                                            <span className="font-semibold">
                                              ⚠️ Contingency:
                                            </span>{' '}
                                            {task.contingencyReason}
                                          </p>
                                        </div>
                                      )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 py-8 text-center">
                            <FileText className="mx-auto mb-2 size-8 text-neutral-300" />
                            <p className="text-sm text-neutral-500">
                              No tasks recorded
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};
