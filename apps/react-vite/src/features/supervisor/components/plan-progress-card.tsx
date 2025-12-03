import { CheckCircle2, Clock, TrendingUp, AlertTriangle, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { PlanProgressOverview } from '@/types/group';
import { cn } from '@/utils/cn';
import { formatDate } from '@/utils/format';
import { paths } from '@/config/paths';

interface PlanProgressCardProps {
  progress: PlanProgressOverview;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export const PlanProgressCard = ({ progress }: PlanProgressCardProps) => {
  const navigate = useNavigate();
  const progressColor = progress.overallProgressPercentage === 100
    ? 'text-green-600'
    : progress.overallProgressPercentage >= 50
      ? 'text-blue-600'
      : 'text-orange-600';

  const handleViewDetails = () => {
    navigate(paths.app.supervisor.planDetails.getHref(progress.productionPlanId));
  };
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{progress.planName}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                progress.status === 'Completed' ? 'default' :
                  progress.status === 'InProgress' ? 'secondary' :
                    'outline'
              }
            >
              {progress.status}
            </Badge>
            <Button variant="outline" size="sm" onClick={handleViewDetails}>
              <ExternalLink className="mr-2 h-4 w-4" />
              View Details
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className={cn("text-2xl font-bold", progressColor)}>
              {progress.overallProgressPercentage.toFixed(1)}%
            </span>
          </div>
          <Progress value={progress.overallProgressPercentage} className="h-3" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" />
              <span>Stages</span>
            </div>
            <p className="text-2xl font-bold">
              {progress.completedStages}/{progress.totalStages}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" />
              <span>Tasks</span>
            </div>
            <p className="text-2xl font-bold">
              {progress.completedTasks}/{progress.totalTasks}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Days Elapsed</span>
            </div>
            <p className="text-2xl font-bold">{progress.daysElapsed}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Remaining</span>
            </div>
            <p className="text-2xl font-bold">
              {progress.estimatedDaysRemaining ||
                (progress.estimatedTotalDays ? progress.estimatedTotalDays - progress.daysElapsed : 0)}
            </p>
          </div>
        </div>

        {/* Schedule Status */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <span className="text-sm font-medium">Schedule Status</span>
          {progress.isOnSchedule ? (
            <Badge variant="default" className="bg-green-600">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              On Schedule
            </Badge>
          ) : (
            <Badge variant="destructive">
              <AlertTriangle className="mr-1 h-3 w-3" />
              {progress.daysBehindSchedule} days behind
            </Badge>
          )}
        </div>

        {/* Cost Tracking */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Cost Tracking</span>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Estimated Total</p>
              <p className="text-lg font-semibold">
                {formatCurrency(progress.estimatedTotalCost)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Actual to Date</p>
              <p className="text-lg font-semibold">
                {formatCurrency(progress.actualCostToDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        {(progress.contingencyTasksCount > 0 || (progress.tasksWithInterruptions || 0) > 0) && (
          <div className="flex items-center gap-4 text-sm">
            {progress.contingencyTasksCount > 0 && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span>{progress.contingencyTasksCount} contingency tasks</span>
              </div>
            )}
            {(progress.tasksWithInterruptions || 0) > 0 && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span>{progress.tasksWithInterruptions || 0} interrupted tasks</span>
              </div>
            )}
          </div>
        )}

        {/* Planting Date */}
        <div className="pt-3 border-t text-sm text-muted-foreground">
          <span>Base Planting Date: </span>
          <span className="font-medium">{formatDate(progress.basePlantingDate)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

