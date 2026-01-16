import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContentLayout } from '@/components/layouts';
import { 
  PlanExecutionDashboard,
  PlotImplementationDialog 
} from '@/features/production-plans/components';
import { useApprovedPlans } from '@/features/production-plans/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/spinner';
import {
  Calendar,
  DollarSign,
  TrendingUp,
  Eye,
  MapPin,
  AlertCircle,
} from 'lucide-react';

const PlanMonitoringPage = () => {
  const navigate = useNavigate();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);

  const { data: approvedPlans, isLoading, error } = useApprovedPlans();

  if (isLoading) {
    return (
      <ContentLayout title="Giám sát kế hoạch">
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      </ContentLayout>
    );
  }

  if (error) {
    return (
      <ContentLayout title="Giám sát kế hoạch">
        <Card className="border-destructive/50">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-muted-foreground">Không thể tải kế hoạch đã phê duyệt</p>
          </CardContent>
        </Card>
      </ContentLayout>
    );
  }

  const plans = approvedPlans || [];

  return (
    <ContentLayout title="Plan Monitoring">
      {selectedPlanId ? (
        <div className="space-y-4">
          <Button
            variant="outline"
            onClick={() => setSelectedPlanId(null)}
          >
            ← Quay lại danh sách kế hoạch
          </Button>
          <PlanExecutionDashboard
            planId={selectedPlanId}
            onViewPlotDetails={(plotId) => setSelectedPlotId(plotId)}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Kế hoạch sản xuất đã phê duyệt</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Giám sát thực hiện và tiến độ của các kế hoạch đã phê duyệt
              </p>
            </div>
            <Badge variant="secondary">{plans.length} Kế hoạch</Badge>
          </div>

          {plans.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">Không tìm thấy kế hoạch đã phê duyệt</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {plans.map((plan) => (
                <Card key={plan.planId} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold">{plan.planName}</h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{plan.groupName}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{plan.seasonName}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="default">Đã phê duyệt</Badge>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                            <span className="text-xs font-medium text-blue-900">Diện tích</span>
                          </div>
                          <p className="text-lg font-bold text-blue-900">{plan.totalArea.toFixed(1)} ha</p>
                          <p className="text-xs text-blue-700">{plan.plotCount} lô</p>
                        </div>

                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="text-xs font-medium text-green-900">Chi phí</span>
                          </div>
                          <p className="text-lg font-bold text-green-900">
                            {(plan.estimatedCost / 1000000).toFixed(1)}M
                          </p>
                          <p className="text-xs text-green-700">VND</p>
                        </div>

                        <div className="p-3 bg-purple-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="h-4 w-4 text-purple-600" />
                            <span className="text-xs font-medium text-purple-900">Đã phê duyệt</span>
                          </div>
                          <p className="text-sm font-bold text-purple-900">
                            {new Date(plan.approvedAt).toLocaleDateString('vi-VN')}
                          </p>
                          <p className="text-xs text-purple-700">bởi {plan.approvedBy}</p>
                        </div>

                        <div className="p-3 bg-orange-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Eye className="h-4 w-4 text-orange-600" />
                            <span className="text-xs font-medium text-orange-900">Tiến độ</span>
                          </div>
                          <p className="text-lg font-bold text-orange-900">
                            {plan.completionPercentage.toFixed(0)}%
                          </p>
                          <Progress value={plan.completionPercentage} className="h-1 mt-1" />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end pt-4 border-t">
                        <Button
                          size="sm"
                          onClick={() => setSelectedPlanId(plan.planId)}
                          icon={<Eye className="h-4 w-4" />}
                        >
                          Xem chi tiết thực hiện
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedPlotId && selectedPlanId && (
        <PlotImplementationDialog
          isOpen={!!selectedPlotId}
          onClose={() => setSelectedPlotId(null)}
          plotId={selectedPlotId}
          productionPlanId={selectedPlanId}
        />
      )}
    </ContentLayout>
  );
};

export default PlanMonitoringPage;

