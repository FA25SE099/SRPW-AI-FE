import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { ClusterCurrentSeason } from '../types';

type ReadinessPanelV0Props = {
  readiness: ClusterCurrentSeason['readiness'];
  hasGroups: boolean;
  onViewDetails?: () => void;
  onFormGroups?: () => void;
};

export const ReadinessPanelV0 = ({
  readiness,
  hasGroups,
  onViewDetails,
  onFormGroups,
}: ReadinessPanelV0Props) => {
  if (!readiness) return null;

  const statusColor = readiness.isReadyToFormGroups ? 'text-chart-1' : 'text-amber-600';
  const statusBg = readiness.isReadyToFormGroups ? 'bg-chart-1/10' : 'bg-amber-500/10';

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-2 h-2 bg-chart-2 rounded-full"></span>
            Readiness Status
          </CardTitle>
          <CardDescription>Season preparation checklist</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`p-4 rounded-lg border ${statusBg}`}>
            <div className="flex items-center gap-3">
              {readiness.isReadyToFormGroups ? (
                <CheckCircle2 className={`w-6 h-6 ${statusColor} flex-shrink-0`} />
              ) : (
                <AlertCircle className={`w-6 h-6 ${statusColor} flex-shrink-0`} />
              )}
              <div>
                <p className="font-semibold text-foreground">
                  {readiness.isReadyToFormGroups ? '✓ Ready to Form Groups' : '⚠ Not Ready'}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Readiness Score: {readiness.readinessScore}%
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start justify-between text-sm">
              <span className="text-muted-foreground">Available Farmers</span>
              <span className="font-semibold text-foreground">{readiness.availableFarmers}</span>
            </div>
            <div className="flex items-start justify-between text-sm">
              <span className="text-muted-foreground">Available Plots</span>
              <span className="font-semibold text-foreground">{readiness.availablePlots}</span>
            </div>
            <div className="flex items-start justify-between text-sm">
              <span className="text-muted-foreground">Plots with Polygon</span>
              <span className="font-semibold text-foreground">{readiness.plotsWithPolygon}</span>
            </div>
            <div className="flex items-start justify-between text-sm">
              <span className="text-muted-foreground">Missing Polygons</span>
              <span className="font-semibold text-destructive">{readiness.plotsWithoutPolygon}</span>
            </div>
            <div className="flex items-start justify-between text-sm border-t border-border pt-3">
              <span className="text-muted-foreground">Available Supervisors</span>
              <span className="font-semibold text-foreground">{readiness.availableSupervisors}</span>
            </div>
          </div>

          {readiness.blockingIssues && readiness.blockingIssues.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-semibold text-destructive uppercase tracking-wide">
                Blocking Issues
              </h4>
              {readiness.blockingIssues.map((issue, idx) => (
                <div key={idx} className="flex gap-2 text-sm">
                  <span className="text-destructive flex-shrink-0">•</span>
                  <span className="text-foreground">{issue}</span>
                </div>
              ))}
            </div>
          )}

          {readiness.recommendations && readiness.recommendations.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-border">
              <h4 className="text-xs font-semibold text-chart-1 uppercase tracking-wide">
                Recommendations
              </h4>
              {readiness.recommendations.map((rec, idx) => (
                <div key={idx} className="flex gap-2 text-sm">
                  <Info className="w-4 h-4 text-chart-1 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{rec}</span>
                </div>
              ))}
            </div>
          )}

          {readiness.isReadyToFormGroups && !hasGroups && (
            <div className="space-y-2 pt-4 border-t border-border">
              {onViewDetails && (
                <Button variant="outline" className="w-full" onClick={onViewDetails}>
                  View Readiness Details
                </Button>
              )}
              {onFormGroups && (
                <Button className="w-full" onClick={onFormGroups}>
                  Form Groups
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

