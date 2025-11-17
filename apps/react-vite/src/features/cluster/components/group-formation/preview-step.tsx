import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Users,
  Calendar,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';
import { GroupPreviewResult } from '../../types';

type PreviewStepProps = {
  preview: GroupPreviewResult;
  onBack: () => void;
  onConfirm: () => void;
  onAdjust: () => void;
  isLoading: boolean;
};

export const PreviewStep = ({
  preview,
  onBack,
  onConfirm,
  onAdjust,
  isLoading,
}: PreviewStepProps) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const getCompactnessColor = (
    compactness: string,
  ): string => {
    switch (compactness) {
      case 'very-compact':
        return 'text-green-600 bg-green-50';
      case 'compact':
        return 'text-blue-600 bg-blue-50';
      case 'spread':
        return 'text-orange-600 bg-orange-50';
      case 'scattered':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg text-center">
          <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{preview.totalGroupsFormed}</p>
          <p className="text-xs text-muted-foreground">Groups Formed</p>
        </div>
        <div className="p-4 border rounded-lg text-center">
          <CheckCircle2 className="h-6 w-6 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{preview.totalPlotsGrouped}</p>
          <p className="text-xs text-muted-foreground">Plots Grouped</p>
        </div>
        <div className="p-4 border rounded-lg text-center">
          <AlertTriangle
            className={`h-6 w-6 mx-auto mb-2 ${
              preview.ungroupedPlots > 0 ? 'text-orange-600' : 'text-gray-400'
            }`}
          />
          <p className="text-2xl font-bold">{preview.ungroupedPlots}</p>
          <p className="text-xs text-muted-foreground">Ungrouped</p>
        </div>
      </div>

      {/* Proposed Groups */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Proposed Groups</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {preview.proposedGroups && preview.proposedGroups.length > 0 ? (
            preview.proposedGroups.map((group, index) => (
            <Card key={group.tempGroupId}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Group Header */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">
                          Group {index + 1} - {group.riceVariety}
                        </h4>
                        {group.isReadyForUAV && (
                          <Badge variant="default" className="bg-green-600">
                            UAV Ready
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {group.plotCount} plots, {group.totalArea.toFixed(1)} ha
                        </span>
                        <Badge
                          variant="outline"
                          className={getCompactnessColor(group.compactness)}
                        >
                          {group.compactness} ({group.radiusKm.toFixed(1)}km)
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleGroup(group.tempGroupId)}
                    >
                      {expandedGroups.has(group.tempGroupId) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Planting Date Range */}
                  <div className="flex items-center gap-2 text-sm p-2 bg-muted rounded">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Planting: {group.plantingDateRange.earliest} to{' '}
                      {group.plantingDateRange.latest}
                    </span>
                    {group.plantingDateRange.varianceDays > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        ±{group.plantingDateRange.varianceDays} days
                      </Badge>
                    )}
                  </div>

                  {/* Suggested Supervisor */}
                  {group.suggestedSupervisor && (
                    <div className="flex items-center gap-2 text-sm p-2 bg-blue-50 rounded">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span>
                        Supervisor: {group.suggestedSupervisor.supervisorName}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {group.suggestedSupervisor.currentPlotCount} current plots
                      </Badge>
                    </div>
                  )}

                  {/* Expanded Details */}
                  {expandedGroups.has(group.tempGroupId) && (
                    <div className="pt-2 border-t">
                      <p className="text-xs font-medium mb-2">Plots in Group:</p>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {group.plots.map((plot) => (
                          <div
                            key={plot.plotId}
                            className="text-xs p-2 bg-muted rounded flex items-center justify-between"
                          >
                            <span>{plot.farmerName}</span>
                            <span className="text-muted-foreground">
                              {plot.area.toFixed(2)} ha
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground border rounded-lg">
              <p>No groups to display</p>
            </div>
          )}
        </div>
      </div>

      {/* Ungrouped Plots Warning */}
      {preview.ungroupedPlots > 0 && (
        <div className="p-4 border-2 border-orange-200 bg-orange-50 rounded-lg space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <h4 className="font-semibold text-orange-900">
              {preview.ungroupedPlots} Plots Cannot Be Grouped Automatically
            </h4>
          </div>
          <p className="text-sm text-orange-800">
            These plots will require manual assignment after group creation. You can
            assign them to existing groups or create exception groups.
          </p>
          {preview.ungroupedPlotsList && preview.ungroupedPlotsList.length > 0 && (
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {preview.ungroupedPlotsList.slice(0, 3).map((plot) => (
                <div key={plot.plotId} className="text-xs p-2 bg-white rounded">
                  <div className="font-medium">
                    {plot.farmerName} - {plot.riceVarietyName}
                  </div>
                  <div className="text-muted-foreground">{plot.reasonDescription}</div>
                  
                  {/* Display suggestions if available */}
                  {plot.suggestions && plot.suggestions.length > 0 && (
                    <div className="text-xs text-blue-600 mt-1">
                      💡 {plot.suggestions.join(', ')}
                    </div>
                  )}
                  
                  {/* Display nearest group if available */}
                  {plot.nearbyGroups && plot.nearbyGroups.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      Nearest: Group {plot.nearbyGroups[0].groupNumber} ({plot.nearbyGroups[0].distance.toFixed(0)}m away)
                    </div>
                  )}
                </div>
              ))}
              {preview.ungroupedPlotsList.length > 3 && (
                <p className="text-xs text-muted-foreground text-center pt-1">
                  +{preview.ungroupedPlotsList.length - 3} more...
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack} disabled={isLoading}>
          Back
        </Button>
        <Button variant="outline" onClick={onAdjust} disabled={isLoading}>
          Adjust Parameters
        </Button>
        <Button onClick={onConfirm} disabled={isLoading} className="flex-1">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Confirm & Create
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

