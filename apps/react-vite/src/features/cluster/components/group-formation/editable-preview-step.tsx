import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Edit2,
  X,
  AlertCircle,
  Trash2,
  Check,
} from 'lucide-react';
import {
  PreviewGroupsResponse,
  PreviewGroup,
  GroupFormationParams,
  SupervisorForAssignment,
} from '../../types';
import { GroupMapPreview } from './group-map-preview';
import { SupervisorList } from './supervisor-list';
import {
  validateGroupsBeforeCreate,
  hasBlockingErrors,
  ValidationError,
  canRemovePlotFromGroup,
} from '../../utils/group-validation';

type EditablePreviewStepProps = {
  preview: PreviewGroupsResponse;
  params: GroupFormationParams;
  availablePlots: number;
  onParamsChange: (params: GroupFormationParams) => void;
  onRecalculate: () => void;
  onConfirm: (editedGroups: PreviewGroup[]) => void;
  onCancel: () => void;
  isLoading: boolean;
  isRecalculating: boolean;
};

export const EditablePreviewStep = ({
  preview,
  params,
  availablePlots,
  onParamsChange,
  onRecalculate,
  onConfirm,
  onCancel,
  isLoading,
  isRecalculating,
}: EditablePreviewStepProps) => {
  const [showParameters, setShowParameters] = useState(true);
  const [editedGroups, setEditedGroups] = useState<PreviewGroup[]>(preview.previewGroups);
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  const [selectedSupervisorId, setSelectedSupervisorId] = useState<string | undefined>();
  const [editingGroupName, setEditingGroupName] = useState<number | null>(null);
  const [tempGroupName, setTempGroupName] = useState<string>('');
  const [removedPlots, setRemovedPlots] = useState<PreviewGroup['plots']>([]);

  // Reset state when preview data changes (after recalculation)
  useEffect(() => {
    setEditedGroups(preview.previewGroups);
    setRemovedPlots([]);
    setExpandedGroups(new Set());
    setEditingGroupName(null);
    setTempGroupName('');
  }, [preview.previewGroups]);

  // Validate groups
  const validationErrors = useMemo(
    () => validateGroupsBeforeCreate(editedGroups),
    [editedGroups],
  );
  const hasErrors = hasBlockingErrors(validationErrors);

  const toggleGroup = (groupNumber: number) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupNumber)) {
      newExpanded.delete(groupNumber);
    } else {
      newExpanded.add(groupNumber);
    }
    setExpandedGroups(newExpanded);
  };

  const updateGroup = (groupNumber: number, updates: Partial<PreviewGroup>) => {
    setEditedGroups((groups) =>
      groups.map((g) => (g.groupNumber === groupNumber ? { ...g, ...updates } : g)),
    );
  };

  const updateGroupSupervisor = (groupNumber: number, supervisorId: string) => {
    // Use special value "none" for no supervisor instead of empty string
    const actualSupervisorId = supervisorId === 'none' ? null : supervisorId;
    const supervisor = actualSupervisorId
      ? preview.availableSupervisors.find((s) => s.supervisorId === actualSupervisorId)
      : null;

    updateGroup(groupNumber, {
      supervisorId: supervisor?.supervisorId || undefined,
      supervisorName: supervisor?.fullName || undefined,
    });
  };

  const removePlotFromGroup = (groupNumber: number, plotId: string) => {
    const group = editedGroups.find((g) => g.groupNumber === groupNumber);
    if (!group) return;

    const validation = canRemovePlotFromGroup(group, plotId);
    if (!validation.canRemove) {
      alert(validation.reason);
      return;
    }

    const plot = group.plots.find((p) => p.plotId === plotId);
    if (!plot) return;

    const newPlotIds = group.plotIds.filter((id) => id !== plotId);
    const newPlots = group.plots.filter((p) => p.plotId !== plotId);
    const newTotalArea = group.totalArea - plot.area;

    // Add plot to removed plots list
    setRemovedPlots((prev) => [...prev, plot]);

    updateGroup(groupNumber, {
      plotIds: newPlotIds,
      plots: newPlots,
      plotCount: newPlotIds.length,
      totalArea: newTotalArea,
    });
  };

  const addPlotToGroup = (groupNumber: number, plot: PreviewGroup['plots'][0]) => {
    const group = editedGroups.find((g) => g.groupNumber === groupNumber);
    if (!group) return;

    // Check if plot is already in the group
    if (group.plotIds.includes(plot.plotId)) {
      alert('Plot is already in this group');
      return;
    }

    // Remove plot from removed plots list
    setRemovedPlots((prev) => prev.filter((p) => p.plotId !== plot.plotId));

    // Add plot to group
    updateGroup(groupNumber, {
      plotIds: [...group.plotIds, plot.plotId],
      plots: [...group.plots, plot],
      plotCount: group.plotCount + 1,
      totalArea: group.totalArea + plot.area,
    });
  };

  const handleConfirm = () => {
    if (hasErrors) {
      alert('Please fix all errors before creating groups');
      return;
    }

    onConfirm(editedGroups);
  };

  const startEditingGroupName = (groupNumber: number, currentName: string) => {
    setEditingGroupName(groupNumber);
    setTempGroupName(currentName);
  };

  const saveGroupName = (groupNumber: number) => {
    if (tempGroupName.trim()) {
      updateGroup(groupNumber, { groupName: tempGroupName.trim() });
    }
    setEditingGroupName(null);
    setTempGroupName('');
  };

  const cancelEditingGroupName = () => {
    setEditingGroupName(null);
    setTempGroupName('');
  };

  const GROUP_COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#14B8A6'];

  return (
    <div className="flex gap-4 h-[calc(90vh-120px)]">
      {/* LEFT SIDE: Parameters & Supervisors */}
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
                <div className="font-medium text-sm text-muted-foreground">
                  AREA CONSTRAINTS
                </div>
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
                <div className="font-medium text-sm text-muted-foreground">
                  PLOT COUNT CONSTRAINTS
                </div>
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

        {/* Available Supervisors */}
        <SupervisorList
          supervisors={preview.availableSupervisors}
          selectedSupervisorId={selectedSupervisorId}
          onSelectSupervisor={setSelectedSupervisorId}
        />

        {/* Ungrouped Plots */}
        {preview.ungroupedPlots.length > 0 && (
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
            <CardContent className="space-y-2 max-h-64 overflow-y-auto">
              {preview.ungroupedPlots.map((plot) => (
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
                  </div>

                  <div className="pt-2 border-t border-orange-200">
                    <div className="text-xs font-medium text-orange-700 mb-1">
                      {plot.reasonDescription}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Removed Plots */}
        {removedPlots.length > 0 && (
          <Card className="border-red-200 bg-red-50/30">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-600" />
                <CardTitle className="text-base">Removed Plots ({removedPlots.length})</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                Plots removed from groups. Click "Add to Group" to reassign them.
              </p>
            </CardHeader>
            <CardContent className="space-y-2 max-h-64 overflow-y-auto">
              {removedPlots.map((plot) => (
                <div
                  key={plot.plotId}
                  className="p-3 bg-white rounded-lg border border-red-200 space-y-2"
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
                      <span className="text-muted-foreground">Planting:</span>
                      <span>{plot.plantingDate ? new Date(plot.plantingDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>

                  {/* Add to Group Dropdown */}
                  <div className="pt-2 border-t border-red-200">
                    <Select onValueChange={(value) => addPlotToGroup(parseInt(value), plot)}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Add to group..." />
                      </SelectTrigger>
                      <SelectContent>
                        {editedGroups.map((group) => (
                          <SelectItem key={group.groupNumber} value={group.groupNumber.toString()}>
                            {group.groupName} ({group.plotCount} plots)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* RIGHT SIDE: Stats, Map, Editable Groups */}
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
                <svg
                  className="w-5 h-5 text-muted-foreground mt-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div>
                  <div className="text-sm text-muted-foreground">Total Area</div>
                  <div className="text-3xl font-bold">
                    {editedGroups.reduce((sum, g) => sum + g.totalArea, 0).toFixed(1)} ha
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
                  <div className="text-3xl font-bold">{editedGroups.length}</div>
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
                  <div className="text-3xl font-bold text-orange-600">
                    {preview.ungroupedPlots.length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Card className={hasErrors ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}>
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className={`w-5 h-5 mt-0.5 ${hasErrors ? 'text-red-600' : 'text-yellow-600'}`} />
                <div className="flex-1">
                  <h4 className={`font-semibold text-sm ${hasErrors ? 'text-red-900' : 'text-yellow-900'}`}>
                    {hasErrors ? 'Validation Errors' : 'Warnings'}
                  </h4>
                  <ul className="mt-2 space-y-1 text-sm">
                    {validationErrors.map((error, index) => (
                      <li key={index} className={error.type === 'error' ? 'text-red-800' : 'text-yellow-800'}>
                        • {error.message}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Map Preview - Convert to legacy format for compatibility */}
        <div className="h-[300px] flex-shrink-0 rounded-lg border-2 overflow-hidden shadow-lg">
          <GroupMapPreview
            preview={{
              totalGroupsFormed: editedGroups.length,
              totalPlotsGrouped: editedGroups.reduce((sum, g) => sum + g.plotCount, 0),
              ungroupedPlots: preview.ungroupedPlots.length,
              proposedGroups: editedGroups.map((g) => ({
                tempGroupId: `group-${g.groupNumber}`,
                groupNumber: g.groupNumber,
                groupName: g.groupName,
                riceVariety: g.riceVarietyName,
                riceVarietyId: g.riceVarietyId,
                riceVarietyName: g.riceVarietyName,
                plotCount: g.plotCount,
                totalArea: g.totalArea,
                centroidLat: g.centroidLat,
                centroidLng: g.centroidLng,
                groupBoundaryGeoJson: g.groupBoundaryGeoJson,
                plots: g.plots,
              })),
              ungroupedPlotsList: preview.ungroupedPlots,
            }}
            hoveredGroupId={null}
            expandedGroups={new Set(Array.from(expandedGroups).map(n => `group-${n}`))}
            onGroupClick={(groupId) => {
              const groupNum = parseInt(groupId.split('-')[1]);
              toggleGroup(groupNum);
            }}
          />
        </div>

        {/* Editable Groups List */}
        <Card className="flex-shrink-0">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-base">
                Editable Groups ({editedGroups.length})
              </CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">
              Edit group names, assign supervisors, and manage plots
            </p>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
            {editedGroups.map((group, index) => (
              <div
                key={group.groupNumber}
                className="rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all"
              >
                {/* Group Header */}
                <div className="p-4 space-y-3">
                  {/* Group Name (Inline Editable) */}
                  <div>
                    <Label className="text-xs text-muted-foreground">Group Name</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: GROUP_COLORS[index % GROUP_COLORS.length],
                        }}
                      />
                      {editingGroupName === group.groupNumber ? (
                        <>
                          <Input
                            type="text"
                            value={tempGroupName}
                            onChange={(e) => setTempGroupName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                saveGroupName(group.groupNumber);
                              } else if (e.key === 'Escape') {
                                cancelEditingGroupName();
                              }
                            }}
                            className="flex-1"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => saveGroupName(group.groupNumber)}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={cancelEditingGroupName}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="flex-1 font-medium text-sm">
                            {group.groupName}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() =>
                              startEditingGroupName(group.groupNumber, group.groupName)
                            }
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Rice Variety & Stats */}
                  <div className="flex items-center gap-4 text-sm">
                    <Badge variant="outline">{group.riceVarietyName}</Badge>
                    <span className="text-muted-foreground">
                      {group.plotCount} plots • {group.totalArea.toFixed(1)} ha
                    </span>
                  </div>

                  {/* Supervisor Selection */}
                  <div>
                    <Label className="text-xs text-muted-foreground">Assign Supervisor</Label>
                    <Select
                      value={group.supervisorId || 'none'}
                      onValueChange={(value) =>
                        updateGroupSupervisor(group.groupNumber, value)
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="No Supervisor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          <span className="font-medium">No Supervisor</span>
                        </SelectItem>
                        {preview.availableSupervisors.map((supervisor) => {
                          const capacityPercent = supervisor.maxAreaCapacity
                            ? Math.round(
                                (supervisor.currentTotalArea / supervisor.maxAreaCapacity) * 100
                              )
                            : 0;
                          const remainingCapacity =
                            supervisor.remainingAreaCapacity ?? 
                            (supervisor.maxAreaCapacity 
                              ? supervisor.maxAreaCapacity - supervisor.currentTotalArea 
                              : 0);
                          
                          return (
                            <SelectItem
                              key={supervisor.supervisorId}
                              value={supervisor.supervisorId}
                              disabled={!supervisor.isAvailable}
                            >
                              <div className="flex items-center justify-between gap-3 w-full">
                                <span className={!supervisor.isAvailable ? 'opacity-50' : ''}>
                                  {supervisor.fullName}
                                </span>
                                <span
                                  className={`text-xs ${
                                    !supervisor.isAvailable
                                      ? 'text-red-600'
                                      : capacityPercent > 75
                                        ? 'text-orange-600'
                                        : 'text-green-600'
                                  }`}
                                >
                                  {supervisor.isAvailable
                                    ? `${remainingCapacity.toFixed(1)} ha left`
                                    : supervisor.unavailableReason || 'Full'}
                                </span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {group.supervisorId && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        {(() => {
                          const supervisor = preview.availableSupervisors.find(
                            (s) => s.supervisorId === group.supervisorId
                          );
                          if (!supervisor || !supervisor.maxAreaCapacity) return null;
                          const capacityPercent = Math.round(
                            (supervisor.currentTotalArea / supervisor.maxAreaCapacity) * 100
                          );
                          return (
                            <span>
                              Area: {supervisor.currentTotalArea.toFixed(1)}/
                              {supervisor.maxAreaCapacity.toFixed(1)} ha ({capacityPercent}% used)
                            </span>
                          );
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Planting Window */}
                  {group.plantingWindowStart && group.plantingWindowEnd && (
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Planting: {new Date(group.plantingWindowStart).toLocaleDateString()} -{' '}
                        {new Date(group.plantingWindowEnd).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {/* Toggle Plots */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleGroup(group.groupNumber)}
                    className="w-full"
                  >
                    {expandedGroups.has(group.groupNumber) ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-2" />
                        Hide Plots
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-2" />
                        Show Plots ({group.plotCount})
                      </>
                    )}
                  </Button>
                </div>

                {/* Expanded Plot Details */}
                {expandedGroups.has(group.groupNumber) && (
                  <div className="px-4 pb-4 pt-0">
                    <div className="grid grid-cols-2 gap-3">
                      {group.plots.map((plot) => (
                        <div
                          key={plot.plotId}
                          className="bg-gray-50 rounded-lg border border-gray-200 p-3 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="font-semibold text-sm">
                              Plot {plot.soThua || plot.plotId.slice(-4)}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                              onClick={() =>
                                removePlotFromGroup(group.groupNumber, plot.plotId)
                              }
                              title="Remove plot from group"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>

                          <dl className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <dt className="text-muted-foreground">Farmer:</dt>
                              <dd className="font-medium text-right">{plot.farmerName}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-muted-foreground">Area:</dt>
                              <dd className="font-medium">{plot.area.toFixed(1)} ha</dd>
                            </div>
                            {plot.plantingDate && (
                              <div className="flex justify-between">
                                <dt className="text-muted-foreground">Planting:</dt>
                                <dd className="font-medium">
                                  {new Date(plot.plantingDate).toLocaleDateString()}
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
            onClick={handleConfirm}
            disabled={isLoading || isRecalculating || hasErrors}
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
                Create {editedGroups.length} Groups
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

