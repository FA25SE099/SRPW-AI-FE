import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Settings,
  MapPin,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle,
  Calendar,
  Users,
  Layers,
} from 'lucide-react';
import { GroupPreviewResult, GroupFormationParams } from '../../types';
import { GroupMapPreview } from './group-map-preview';

type PreviewStepWithParamsProps = {
  preview: GroupPreviewResult;
  params: GroupFormationParams;
  availablePlots: number;
  onParamsChange: (params: GroupFormationParams) => void;
  onRecalculate: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
  isRecalculating: boolean;
};

export const PreviewStepWithParams = ({
  preview,
  params,
  availablePlots,
  onParamsChange,
  onRecalculate,
  onConfirm,
  onCancel,
  isLoading,
  isRecalculating,
}: PreviewStepWithParamsProps) => {
  const [showParameters, setShowParameters] = useState(true);
  const [hoveredGroupId, setHoveredGroupId] = useState<string | null>(null);
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

  const handleGroupClick = (groupId: string) => {
    toggleGroup(groupId);
  };

  const GROUP_COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#14B8A6'];

  return (
    <div className="flex gap-4 h-[calc(90vh-120px)]">
      {/* LEFT SIDE: Parameters & Ungrouped Plots */}
      <div className="w-[380px] flex-shrink-0 space-y-4 overflow-y-auto pr-2">
        {/* Formation Parameters */}
        <Card>
          <CardHeader
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => setShowParameters(!showParameters)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                <CardTitle className="text-base">Formation Parameters</CardTitle>
              </div>
              {showParameters ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </CardHeader>

          {showParameters && (
            <CardContent className="space-y-4">
              {/* Proximity Threshold */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4" />
                  <Label className="font-medium">Proximity Threshold</Label>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Maximum distance between plots (meters)
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    type="range"
                    min={10}
                    max={5000}
                    step={10}
                    value={params.proximityThresholdMeters}
                    onChange={(e) =>
                      onParamsChange({
                        ...params,
                        proximityThresholdMeters: parseInt(e.target.value),
                      })
                    }
                    className="flex-1"
                  />
                  <span className="font-semibold w-16 text-right">
                    {params.proximityThresholdMeters} m
                  </span>
                </div>
              </div>

              {/* Planting Date Tolerance */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4" />
                  <Label className="font-medium">Planting Date Tolerance</Label>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Days difference allowed in planting dates
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    type="range"
                    min={0}
                    max={14}
                    value={params.plantingDateToleranceDays}
                    onChange={(e) =>
                      onParamsChange({
                        ...params,
                        plantingDateToleranceDays: parseInt(e.target.value),
                      })
                    }
                    className="flex-1"
                  />
                  <span className="font-semibold w-16 text-right">
                    {params.plantingDateToleranceDays} days
                  </span>
                </div>
              </div>

              {/* Area Constraints */}
              <div className="bg-muted/50 p-3 rounded-lg space-y-3">
                <div className="font-medium text-sm text-muted-foreground">AREA CONSTRAINTS</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Min Area</Label>
                    <div className="flex items-center gap-1 mt-1">
                      <Input
                        type="number"
                        value={params.minGroupAreaHa}
                        onChange={(e) =>
                          onParamsChange({
                            ...params,
                            minGroupAreaHa: parseInt(e.target.value) || 0,
                          })
                        }
                        className="h-8"
                      />
                      <span className="text-xs text-muted-foreground">ha</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Max Area</Label>
                    <div className="flex items-center gap-1 mt-1">
                      <Input
                        type="number"
                        value={params.maxGroupAreaHa}
                        onChange={(e) =>
                          onParamsChange({
                            ...params,
                            maxGroupAreaHa: parseInt(e.target.value) || 0,
                          })
                        }
                        className="h-8"
                      />
                      <span className="text-xs text-muted-foreground">ha</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Plot Count Constraints */}
              <div className="bg-muted/50 p-3 rounded-lg space-y-3">
                <div className="font-medium text-sm text-muted-foreground">PLOT COUNT CONSTRAINTS</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Min Plots</Label>
                    <div className="flex items-center gap-1 mt-1">
                      <Input
                        type="number"
                        value={params.minPlots}
                        onChange={(e) =>
                          onParamsChange({
                            ...params,
                            minPlots: parseInt(e.target.value) || 0,
                          })
                        }
                        className="h-8"
                      />
                      <span className="text-xs text-muted-foreground">plots</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Max Plots</Label>
                    <div className="flex items-center gap-1 mt-1">
                      <Input
                        type="number"
                        value={params.maxPlots}
                        onChange={(e) =>
                          onParamsChange({
                            ...params,
                            maxPlots: parseInt(e.target.value) || 0,
                          })
                        }
                        className="h-8"
                      />
                      <span className="text-xs text-muted-foreground">plots</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recalculate Button */}
              <Button
                variant="outline"
                onClick={onRecalculate}
                disabled={isRecalculating}
                className="w-full"
              >
                {isRecalculating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Recalculating...
                  </>
                ) : (
                  <>
                    <Layers className="w-4 h-4 mr-2" />
                    Recalculate Groups
                  </>
                )}
              </Button>
            </CardContent>
          )}
        </Card>

        {/* Ungrouped Plots */}
        {preview.ungroupedPlots > 0 && preview.ungroupedPlotsList && (
          <Card className="border-orange-200 bg-orange-50/30">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <CardTitle className="text-base">Ungrouped Plots</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                These plots don't fit current parameters and will need manual assignment.
              </p>
            </CardHeader>
            <CardContent className="space-y-2 max-h-96 overflow-y-auto">
              {preview.ungroupedPlotsList.map((plot) => (
                <div
                  key={plot.plotId}
                  className="p-3 bg-white rounded-lg border border-orange-200 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-sm">
                        Plot {plot.soThua || plot.plotId.slice(-4)}
                      </div>
                      <div className="text-xs text-muted-foreground">{plot.farmerName}</div>
                    </div>
                    <div className="text-sm font-semibold">{plot.area.toFixed(1)} ha</div>
                  </div>

                  <div className="text-xs space-y-1">
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Variety:</span>
                      <span className="font-medium">{plot.riceVarietyName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Planting:</span>
                      <span>{new Date(plot.plantingDate).toLocaleDateString()}</span>
                    </div>
                    {plot.farmerPhone && (
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Phone:</span>
                        <span>{plot.farmerPhone}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-orange-200">
                    <div className="text-xs font-medium text-orange-700 mb-1">
                      {plot.reasonDescription}
                    </div>
                    {plot.distanceToNearestGroup > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Distance to nearest: {(plot.distanceToNearestGroup / 1000).toFixed(2)}km
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* RIGHT SIDE: Stats, Map, Groups */}
      <div className="flex-1 flex flex-col gap-4 min-w-0 overflow-y-auto pr-2">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 flex-shrink-0">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Layers className="w-5 h-5 text-muted-foreground mt-1" />
                <div>
                  <div className="text-sm text-muted-foreground">Total Plots</div>
                  <div className="text-3xl font-bold">{availablePlots}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-muted-foreground mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div>
                  <div className="text-sm text-muted-foreground">Total Area</div>
                  <div className="text-3xl font-bold">
                    {preview.proposedGroups?.reduce((sum, g) => sum + g.totalArea, 0).toFixed(1) || '0'} ha
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-muted-foreground mt-1" />
                <div>
                  <div className="text-sm text-muted-foreground">Proposed Groups</div>
                  <div className="text-3xl font-bold">{preview.totalGroupsFormed}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-1" />
                <div>
                  <div className="text-sm text-orange-800">Ungrouped Plots</div>
                  <div className="text-3xl font-bold text-orange-600">{preview.ungroupedPlots}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map Preview */}
        <div className="h-[400px] flex-shrink-0 rounded-lg border-2 overflow-hidden shadow-lg">
          <div className="relative h-full">
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-md">
              <span className="text-sm font-medium flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="12" r="3" fill="currentColor" />
                </svg>
                Group Preview Map
              </span>
            </div>
            <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
              {preview.proposedGroups?.slice(0, 3).map((group, index) => (
                <div key={group.tempGroupId} className="flex items-center gap-2 bg-white px-2 py-1 rounded shadow-sm">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: GROUP_COLORS[index % GROUP_COLORS.length] }}
                  ></div>
                  <span className="text-xs font-medium">{(group.groupName || group.riceVariety).split(' ')[0]}</span>
                </div>
              ))}
            </div>
            <GroupMapPreview
              preview={preview}
              hoveredGroupId={hoveredGroupId}
              expandedGroups={expandedGroups}
              onGroupClick={handleGroupClick}
            />
          </div>
        </div>

        {/* Proposed Groups List */}
        <Card className="flex-shrink-0">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <CardTitle className="text-base">Proposed Groups ({preview.totalGroupsFormed})</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
            {preview.proposedGroups?.map((group, index) => (
              <div
                key={group.tempGroupId}
                className={`rounded-lg border-2 transition-all ${hoveredGroupId === group.tempGroupId
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                {/* Group Header */}
                <div
                  className="p-3 cursor-pointer"
                  onMouseEnter={() => group.tempGroupId && setHoveredGroupId(group.tempGroupId)}
                  onMouseLeave={() => setHoveredGroupId(null)}
                  onClick={() => group.tempGroupId && handleGroupClick(group.tempGroupId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: GROUP_COLORS[index % GROUP_COLORS.length] }}
                      />
                      <span className="font-semibold">{group.groupName || group.riceVariety}</span>
                      <span className="text-sm text-muted-foreground">
                        {group.plotCount} plots • {group.totalArea.toFixed(1)} ha
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${group.tempGroupId && expandedGroups.has(group.tempGroupId) ? 'rotate-180' : ''}`} />
                  </div>

                  {group.plantingWindowStart && group.plantingWindowEnd && (
                    <div className="text-xs text-muted-foreground mt-1 ml-5">
                      Planting: {new Date(group.plantingWindowStart).toLocaleDateString()} - {new Date(group.plantingWindowEnd).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Expanded Plot Details */}
                {group.tempGroupId && expandedGroups.has(group.tempGroupId) && (
                  <div className="px-3 pb-3">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                      Plots in this Group
                    </div>
                    <div className="grid grid-cols-2 gap-4 max-h-64 overflow-y-auto pr-1">
                      {group.plots?.map((plot) => (
                        <div
                          key={plot.plotId}
                          className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:bg-gray-100 transition-colors"
                        >
                          {/* Plot Title */}
                          <div className="font-semibold text-sm text-foreground mb-3">
                            Plot {plot.soThua || plot.plotId.slice(-4)}
                          </div>

                          {/* Info Grid – 3 columns */}
                          <dl className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
                            {/* Area */}
                            <div>
                              <dt className="text-muted-foreground font-medium">Area</dt>
                              <dd className="font-medium text-foreground">
                                {plot.area.toFixed(1)} ha
                              </dd>
                            </div>

                            {/* Planting Date */}
                            {plot.plantingDate ? (
                              <div>
                                <dt className="text-muted-foreground font-medium">Planting Date</dt>
                                <dd className="font-medium text-foreground">
                                  {new Date(plot.plantingDate).toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </dd>
                              </div>
                            ) : (
                              <div />
                            )}

                            {/* Farmer Name */}
                            {plot.farmerName ? (
                              <div>
                                <dt className="text-muted-foreground font-medium">Farmer</dt>
                                <dd className="font-medium text-foreground truncate">
                                  {plot.farmerName}
                                </dd>
                              </div>
                            ) : (
                              <div />
                            )}

                            {/* Phone – only show if we have a name (optional) */}
                            {plot.farmerPhone && plot.farmerName && (
                              <div className="col-span-2">
                                <dt className="text-muted-foreground font-medium">Phone</dt>
                                <dd className="font-medium text-foreground">
                                  {plot.farmerPhone}
                                </dd>
                              </div>
                            )}
                          </dl>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2 pb-4 flex-shrink-0">
          <Button variant="outline" onClick={onCancel} disabled={isLoading} size="lg">
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading || isRecalculating}
            className="flex-1"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-5 w-5" />
                Confirm & Create {preview.totalGroupsFormed} Groups
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

