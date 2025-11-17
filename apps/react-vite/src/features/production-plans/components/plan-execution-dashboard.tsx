import { useState } from 'react';
import { useExecutionSummary } from '../api/get-execution-summary';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  MapPin,
  Calendar,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

type PlanExecutionDashboardProps = {
  planId: string;
  onViewTasks?: () => void;
  onViewPlotDetails?: (plotId: string) => void;
};

export const PlanExecutionDashboard = ({
  planId,
  onViewTasks,
  onViewPlotDetails,
}: PlanExecutionDashboardProps) => {
  const { data: summary, isLoading, error } = useExecutionSummary({
    planId,
    queryConfig: { enabled: !!planId },
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !summary) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground">Failed to load execution summary</p>
        </CardContent>
      </Card>
    );
  }

  const stats = [
    {
      label: 'Completion',
      value: `${summary.completionPercentage.toFixed(1)}%`,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
      subtext: `${summary.tasksCompleted}/${summary.totalTasksCreated} tasks`,
    },
    {
      label: 'In Progress',
      value: summary.tasksInProgress,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      subtext: `${summary.tasksPending} pending`,
    },
    {
      label: 'Cost',
      value: `${((summary.actualCost / summary.estimatedCost) * 100).toFixed(0)}%`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      subtext: `${summary.actualCost.toLocaleString('vi-VN')} / ${summary.estimatedCost.toLocaleString('vi-VN')} VND`,
    },
    {
      label: 'Farmers',
      value: summary.farmerCount,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
      subtext: `${summary.plotCount} plots`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">{summary.planName}</h2>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{summary.groupName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{summary.seasonName}</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span>{summary.totalArea} ha</span>
            </div>
          </div>
        </div>
        {onViewTasks && (
          <Button onClick={onViewTasks}>View All Tasks</Button>
        )}
      </div>

      {/* Approval Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Approved By</p>
              <p className="font-medium">{summary.approvedByExpert}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Approved On</p>
              <p className="font-medium">
                {new Date(summary.approvedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.subtext}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Overall Progress</h3>
              <span className="text-sm font-medium">{summary.completionPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={summary.completionPercentage} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Started: {summary.firstTaskStarted ? new Date(summary.firstTaskStarted).toLocaleDateString() : 'N/A'}</span>
              <span>Latest: {summary.lastTaskCompleted ? new Date(summary.lastTaskCompleted).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plot Summaries */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Plot Performance</h3>
          <div className="space-y-3">
            {summary.plotSummaries.map((plot) => (
              <div
                key={plot.plotId}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors cursor-pointer"
                onClick={() => onViewPlotDetails?.(plot.plotId)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">{plot.plotName}</p>
                      <p className="text-sm text-muted-foreground">{plot.farmerName}</p>
                    </div>
                    <Badge variant={plot.completionRate === 100 ? 'default' : 'secondary'}>
                      {plot.plotArea.toFixed(2)} ha
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{plot.completionRate.toFixed(0)}%</p>
                    <p className="text-xs text-muted-foreground">
                      {plot.completedTasks}/{plot.taskCount} tasks
                    </p>
                  </div>
                  <div className="w-24">
                    <Progress value={plot.completionRate} className="h-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

