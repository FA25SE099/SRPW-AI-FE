import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { YearSeasonTimeline } from '../types';
import { format } from 'date-fns';

type Props = {
  timeline: YearSeasonTimeline;
};

export const TimelineVisualization = ({ timeline }: Props) => {
  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Season Timeline</CardTitle>
          <div className="text-sm text-muted-foreground">
            {timeline.daysElapsed || 0} days elapsed • {timeline.daysRemaining || 0}{' '}
            days remaining
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {timeline.progressPercentage.toFixed(1)}%
            </span>
          </div>
          <Progress value={timeline.progressPercentage} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Planning Window</div>
            <div className="text-sm font-medium">
              {format(new Date(timeline.planningWindowStart), 'MMM dd')} -{' '}
              {format(new Date(timeline.planningWindowEnd), 'MMM dd')}
            </div>
            {timeline.isPlanningWindowOpen && (
              <div className="text-xs text-blue-600">
                Currently open
              </div>
            )}
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Season Period</div>
            <div className="text-sm font-medium">
              {format(new Date(timeline.seasonStartDate), 'MMM dd')} -{' '}
              {format(new Date(timeline.seasonEndDate), 'MMM dd')}
            </div>
          </div>
        </div>

        <div className="pt-2 border-t">
          {!timeline.hasSeasonStarted && (
            <div className="text-sm text-muted-foreground">
              🕐 Season starts in {timeline.daysUntilSeasonStart} days
            </div>
          )}
          {timeline.hasSeasonStarted && !timeline.hasSeasonEnded && (
            <div className="text-sm text-green-600 font-medium">
              ✅ Season is active ({timeline.daysRemaining} days remaining)
            </div>
          )}
          {timeline.hasSeasonEnded && (
            <div className="text-sm text-purple-600 font-medium">
              ✅ Season has ended
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

