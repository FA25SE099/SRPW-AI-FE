import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, MapPin, Calendar, User } from 'lucide-react';
import { GroupPreviewResult } from '../types';

type UngroupedPlotsManagerProps = {
  ungroupedPlots: GroupPreviewResult['ungroupedPlotsList'];
  availableGroups: Array<{
    groupId: string;
    groupName: string;
    riceVariety: string;
  }>;
  onAssignToGroup?: (plotId: string, groupId: string) => void;
  onCreateExceptionGroup?: (plotIds: string[]) => void;
};

export const UngroupedPlotsManager = ({
  ungroupedPlots,
  availableGroups,
  onAssignToGroup,
  onCreateExceptionGroup,
}: UngroupedPlotsManagerProps) => {
  const [selectedPlots, setSelectedPlots] = useState<Set<string>>(new Set());

  const togglePlotSelection = (plotId: string) => {
    const newSelected = new Set(selectedPlots);
    if (newSelected.has(plotId)) {
      newSelected.delete(plotId);
    } else {
      newSelected.add(plotId);
    }
    setSelectedPlots(newSelected);
  };

  const handleCreateExceptionGroup = () => {
    if (onCreateExceptionGroup && selectedPlots.size > 0) {
      onCreateExceptionGroup(Array.from(selectedPlots));
    }
  };

  if (ungroupedPlots.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">
            All plots have been successfully grouped!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Ungrouped Plots - {ungroupedPlots.length}
          </CardTitle>
          {selectedPlots.size > 0 && (
            <Badge variant="secondary">
              {selectedPlots.size} selected
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Actions */}
        {selectedPlots.size > 0 && (
          <div className="flex gap-2 p-3 bg-muted rounded-lg">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCreateExceptionGroup}
            >
              Create Exception Group ({selectedPlots.size})
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedPlots(new Set())}
            >
              Clear Selection
            </Button>
          </div>
        )}

        {/* Ungrouped Plots List */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {ungroupedPlots.map((plot) => (
            <Card key={plot.plotId} className="border-orange-200">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Plot Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedPlots.has(plot.plotId)}
                        onChange={() => togglePlotSelection(plot.plotId)}
                        className="mt-1 h-4 w-4 rounded border-gray-300"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="font-semibold">{plot.farmerName}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {plot.area.toFixed(2)} ha
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {plot.plantingDate}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">{plot.riceVariety}</Badge>
                  </div>

                  {/* Reason */}
                  <div className="p-2 bg-orange-50 rounded text-sm">
                    <p className="font-medium text-orange-900">Reason:</p>
                    <p className="text-orange-800">{plot.reason}</p>
                  </div>

                  {/* Suggestions */}
                  {plot.suggestions.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        Suggestions:
                      </p>
                      <ul className="text-xs space-y-1">
                        {plot.suggestions.map((suggestion, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-blue-600">•</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    {plot.nearestGroupId && availableGroups.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          onAssignToGroup?.(plot.plotId, plot.nearestGroupId!)
                        }
                      >
                        Assign to Nearest Group
                        {plot.distanceToNearestKm && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            ({plot.distanceToNearestKm.toFixed(1)}km)
                          </span>
                        )}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        onCreateExceptionGroup?.([plot.plotId])
                      }
                    >
                      Create Single Exception
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

