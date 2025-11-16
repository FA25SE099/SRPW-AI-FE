import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { ClusterCurrentSeason } from '../types';

type CurrentSeasonCardProps = {
  data: ClusterCurrentSeason | null;
};

export const CurrentSeasonCardV0 = ({ data }: CurrentSeasonCardProps) => {
  if (!data) return null;

  const { riceVarietySelection, hasGroups } = data;

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="w-2 h-2 bg-chart-2 rounded-full"></span>
          {hasGroups ? 'Active Groups & Varieties' : 'Rice Variety Selection Progress'}
        </CardTitle>
        <CardDescription>
          {hasGroups
            ? 'Monitor current farmer groups and rice variety distribution'
            : 'Track farmer selections for the upcoming season'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {riceVarietySelection && (
          <div>
            <div className="flex items-end justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-foreground">Selection Completion</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {riceVarietySelection.farmersWithSelection} of {riceVarietySelection.totalFarmers}{' '}
                  farmers
                </p>
              </div>
              <span className="text-2xl font-bold text-primary">
                {riceVarietySelection.selectionCompletionRate?.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-chart-1 h-2 rounded-full transition-all"
                style={{
                  width: `${riceVarietySelection.selectionCompletionRate || 0}%`,
                }}
              ></div>
            </div>
          </div>
        )}

        {riceVarietySelection?.selections && riceVarietySelection.selections.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Variety Breakdown</h4>
            {riceVarietySelection.selections.map((variety, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-secondary rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: `hsl(var(--chart-${(idx % 5) + 1}))` }}
                  ></div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{variety.varietyName}</p>
                    <p className="text-xs text-muted-foreground">
                      {variety.switchedIn !== undefined && variety.switchedIn > 0 &&
                        `+${variety.switchedIn} switched in`}
                      {variety.switchedOut !== undefined && variety.switchedOut > 0 &&
                        ` • ${variety.switchedOut} switched out`}
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-foreground text-sm">{variety.selectedBy}</span>
              </div>
            ))}
          </div>
        )}

        {riceVarietySelection && riceVarietySelection.farmersPending > 0 && (
          <div className="flex items-start gap-3 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900">
                {riceVarietySelection.farmersPending} farmers pending
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Send reminders to farmers who haven't selected their rice variety yet
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

