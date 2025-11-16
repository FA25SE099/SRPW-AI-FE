import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, MapPin, Sprout } from 'lucide-react';
import { ClusterCurrentSeason } from '../types';

type CurrentSeasonCardProps = {
  data: ClusterCurrentSeason;
};

export const CurrentSeasonCard = ({ data }: CurrentSeasonCardProps) => {
  const { currentSeason, hasGroups, activeGroups } = data;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Season Overview
          </CardTitle>
          <Badge variant={hasGroups ? 'default' : 'secondary'}>
            {hasGroups ? 'Active Groups' : 'Pre-Season'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Season Info */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Current Season</p>
              <p className="text-lg font-semibold">
                {currentSeason.seasonName} {currentSeason.year}
              </p>
            </div>
            {currentSeason.isCurrent && (
              <Badge variant="default" className="bg-green-600">
                Active
              </Badge>
            )}
          </div>

          {/* Stats Grid */}
          {hasGroups && activeGroups && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <div className="flex justify-center mb-1">
                  <Sprout className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold">{activeGroups.length}</p>
                <p className="text-xs text-muted-foreground">Groups</p>
              </div>

              <div className="text-center p-3 border rounded-lg">
                <div className="flex justify-center mb-1">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold">
                  {activeGroups.reduce((sum, g) => sum + g.plotCount, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Plots</p>
              </div>

              <div className="text-center p-3 border rounded-lg">
                <div className="flex justify-center mb-1">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-2xl font-bold">
                  {activeGroups.reduce((sum, g) => sum + g.farmerCount, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Farmers</p>
              </div>

              <div className="text-center p-3 border rounded-lg">
                <div className="flex justify-center mb-1">
                  <MapPin className="h-5 w-5 text-orange-600" />
                </div>
                <p className="text-2xl font-bold">
                  {activeGroups.reduce((sum, g) => sum + g.totalArea, 0).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Hectares</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

