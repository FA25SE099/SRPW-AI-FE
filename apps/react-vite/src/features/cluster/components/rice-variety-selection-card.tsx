import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sprout, TrendingUp, TrendingDown, Users } from 'lucide-react';
import { ClusterCurrentSeason } from '../types';
import { cn } from '@/utils/cn';

type RiceVarietySelectionCardProps = {
  selection: NonNullable<ClusterCurrentSeason['riceVarietySelection']>;
};

export const RiceVarietySelectionCard = ({
  selection,
}: RiceVarietySelectionCardProps) => {
  const completionColor =
    selection.selectionCompletionRate >= 90
      ? 'text-green-600'
      : selection.selectionCompletionRate >= 70
        ? 'text-blue-600'
        : 'text-orange-600';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sprout className="h-5 w-5" />
            Rice Variety Selection
          </CardTitle>
          <Badge
            variant={selection.farmersPending === 0 ? 'default' : 'secondary'}
            className={
              selection.farmersPending === 0 ? 'bg-green-600' : 'bg-orange-600'
            }
          >
            {selection.farmersWithSelection}/{selection.totalFarmers}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Completion Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Selection Progress</span>
            <span className={cn('text-2xl font-bold', completionColor)}>
              {selection.selectionCompletionRate.toFixed(1)}%
            </span>
          </div>
          <Progress value={selection.selectionCompletionRate} className="h-3" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 border rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {selection.farmersWithSelection}
            </p>
            <p className="text-xs text-muted-foreground">Selected</p>
          </div>
          <div className="text-center p-3 border rounded-lg">
            <p className="text-2xl font-bold text-orange-600">
              {selection.farmersPending}
            </p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
        </div>

        {/* Rice Variety Breakdown */}
        {selection.selections.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sprout className="h-4 w-4 text-green-600" />
              <span>Selected Varieties</span>
            </div>
            <div className="space-y-2">
              {selection.selections.map((variety, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{variety.varietyName}</span>
                    <Badge variant="outline">
                      {variety.selectedBy}{' '}
                      {variety.selectedBy === 1 ? 'farmer' : 'farmers'}
                    </Badge>
                  </div>

                  {/* Trend indicators */}
                  {variety.previousSeason !== undefined && (
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-muted-foreground">
                        Last season: {variety.previousSeason}
                      </span>
                      {variety.switchedIn !== undefined && variety.switchedIn > 0 && (
                        <span className="flex items-center gap-1 text-green-600">
                          <TrendingUp className="h-3 w-3" />
                          +{variety.switchedIn} switched in
                        </span>
                      )}
                      {variety.switchedOut !== undefined &&
                        variety.switchedOut > 0 && (
                          <span className="flex items-center gap-1 text-red-600">
                            <TrendingDown className="h-3 w-3" />
                            -{variety.switchedOut} switched out
                          </span>
                        )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Farmers */}
        {selection.pendingFarmers.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4 text-orange-600" />
              <span>Pending Farmers ({selection.farmersPending})</span>
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {selection.pendingFarmers.map((farmer, index) => (
                <div
                  key={index}
                  className="text-sm p-2 border rounded flex items-center justify-between"
                >
                  <div>
                    <span className="font-medium">{farmer.farmerName}</span>
                    {farmer.previousVariety && (
                      <span className="text-muted-foreground ml-2">
                        (Last: {farmer.previousVariety})
                      </span>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {farmer.plotCount}{' '}
                    {farmer.plotCount === 1 ? 'plot' : 'plots'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

