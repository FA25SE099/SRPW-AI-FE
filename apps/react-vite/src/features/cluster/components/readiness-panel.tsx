import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertTriangle, XCircle, Eye, Zap } from 'lucide-react';
import { ClusterCurrentSeason } from '../types';
import { cn } from '@/utils/cn';

type ReadinessPanelProps = {
  readiness: NonNullable<ClusterCurrentSeason['readiness']>;
  onFormGroups: () => void;
  onViewDetails?: () => void;
};

export const ReadinessPanel = ({
  readiness,
  onFormGroups,
  onViewDetails,
}: ReadinessPanelProps) => {
  const scoreColor =
    readiness.readinessScore >= 80
      ? 'text-green-600'
      : readiness.readinessScore >= 50
        ? 'text-orange-600'
        : 'text-red-600';

  const progressColor =
    readiness.readinessScore >= 80
      ? 'bg-green-600'
      : readiness.readinessScore >= 50
        ? 'bg-orange-600'
        : 'bg-red-600';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Cluster Readiness</CardTitle>
          {readiness.isReadyToFormGroups ? (
            <Badge variant="default" className="bg-green-600">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Ready
            </Badge>
          ) : (
            <Badge variant="destructive">
              <XCircle className="mr-1 h-3 w-3" />
              Not Ready
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Readiness Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Readiness Score</span>
            <span className={cn('text-2xl font-bold', scoreColor)}>
              {readiness.readinessScore}/100
            </span>
          </div>
          <div className="relative">
            <Progress value={readiness.readinessScore} className="h-3" />
            <div
              className={cn('absolute inset-0 rounded-full transition-all', progressColor)}
              style={{
                width: `${readiness.readinessScore}%`,
                opacity: 0.7,
              }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Available Farmers</p>
            <p className="text-xl font-bold">{readiness.availableFarmers}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Available Plots</p>
            <p className="text-xl font-bold">{readiness.availablePlots}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">With Polygon</p>
            <p className="text-xl font-bold text-green-600">
              {readiness.plotsWithPolygon}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Missing Polygon</p>
            <p className="text-xl font-bold text-red-600">
              {readiness.plotsWithoutPolygon}
            </p>
          </div>
        </div>

        {/* Available Supervisors */}
        <div className="p-3 border rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Available Supervisors</span>
            <span className="text-lg font-bold text-blue-600">
              {readiness.availableSupervisors}
            </span>
          </div>
        </div>

        {/* Blocking Issues */}
        {readiness.blockingIssues.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span>Blocking Issues</span>
            </div>
            <ul className="space-y-1">
              {readiness.blockingIssues.map((issue, index) => (
                <li
                  key={index}
                  className="text-sm text-muted-foreground flex items-start gap-2"
                >
                  <span className="text-orange-600 mt-0.5">•</span>
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {readiness.recommendations.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <span>Recommendations</span>
            </div>
            <ul className="space-y-1">
              {readiness.recommendations.map((rec, index) => (
                <li
                  key={index}
                  className="text-sm text-muted-foreground flex items-start gap-2"
                >
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          {onViewDetails && (
            <Button variant="outline" onClick={onViewDetails} className="flex-1">
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Button>
          )}
          <Button
            onClick={onFormGroups}
            disabled={!readiness.isReadyToFormGroups}
            className="flex-1"
          >
            <Zap className="mr-2 h-4 w-4" />
            Form Groups
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

