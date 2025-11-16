import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Loader2, Zap, Eye } from 'lucide-react';
import { GroupFormationParams } from '../../types';

type ParameterStepProps = {
  params: GroupFormationParams;
  availablePlots: number;
  onChange: (params: GroupFormationParams) => void;
  onPreview: () => void;
  onFormNow: () => void;
  isLoading: boolean;
};

export const ParameterStep = ({
  params,
  availablePlots,
  onChange,
  onPreview,
  onFormNow,
  isLoading,
}: ParameterStepProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleStrategyChange = (
    strategy: 'quick' | 'balanced' | 'precise',
  ) => {
    // Auto-adjust parameters based on strategy
    const presets = {
      quick: {
        proximityThresholdMeters: 3000,
        minPlots: 8,
        maxPlots: 20,
      },
      balanced: {
        proximityThresholdMeters: 2000,
        minPlots: 5,
        maxPlots: 15,
      },
      precise: {
        proximityThresholdMeters: 1500,
        minPlots: 3,
        maxPlots: 10,
      },
    };

    onChange({
      ...params,
      strategy,
      ...presets[strategy],
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="p-4 bg-muted rounded-lg space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Eligible Plots</span>
          <Badge variant="default" className="text-lg px-3 py-1">
            {availablePlots}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Plots ready for automatic grouping based on rice variety, location, and
          planting schedule.
        </p>
      </div>

      {/* Strategy Selection */}
      <div className="space-y-3">
        <Label className="text-base">Grouping Strategy</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => handleStrategyChange('quick')}
            className={`p-4 border-2 rounded-lg text-left transition-all hover:border-primary ${
              params.strategy === 'quick'
                ? 'border-primary bg-primary/5'
                : 'border-border'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`w-4 h-4 rounded-full border-2 ${
                  params.strategy === 'quick'
                    ? 'border-primary bg-primary'
                    : 'border-border'
                }`}
              />
              <span className="font-semibold">Quick</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Fewer, larger groups. Best for efficiency.
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleStrategyChange('balanced')}
            className={`p-4 border-2 rounded-lg text-left transition-all hover:border-primary ${
              params.strategy === 'balanced'
                ? 'border-primary bg-primary/5'
                : 'border-border'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`w-4 h-4 rounded-full border-2 ${
                  params.strategy === 'balanced'
                    ? 'border-primary bg-primary'
                    : 'border-border'
                }`}
              />
              <span className="font-semibold">Balanced</span>
              <Badge variant="secondary" className="text-xs">
                Recommended
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Optimal balance of size and manageability.
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleStrategyChange('precise')}
            className={`p-4 border-2 rounded-lg text-left transition-all hover:border-primary ${
              params.strategy === 'precise'
                ? 'border-primary bg-primary/5'
                : 'border-border'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`w-4 h-4 rounded-full border-2 ${
                  params.strategy === 'precise'
                    ? 'border-primary bg-primary'
                    : 'border-border'
                }`}
              />
              <span className="font-semibold">Precise</span>
            </div>
            <p className="text-xs text-muted-foreground">
              More, smaller groups. Tighter control.
            </p>
          </button>
        </div>
      </div>

      {/* Advanced Settings Toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          Advanced Settings
          {showAdvanced ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Advanced Settings */}
      {showAdvanced && (
        <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Proximity Threshold */}
            <div className="space-y-2">
              <Label htmlFor="proximity">
                Proximity Threshold (meters)
              </Label>
              <Input
                id="proximity"
                type="number"
                value={params.proximityThresholdMeters}
                onChange={(e) =>
                  onChange({
                    ...params,
                    proximityThresholdMeters: parseInt(e.target.value) || 0,
                  })
                }
                min={500}
                max={5000}
                step={100}
              />
              <p className="text-xs text-muted-foreground">
                Plots within {params.proximityThresholdMeters}m will be grouped
              </p>
            </div>

            {/* Planting Date Tolerance */}
            <div className="space-y-2">
              <Label htmlFor="plantingTolerance">
                Planting Date Tolerance (days)
              </Label>
              <Input
                id="plantingTolerance"
                type="number"
                value={params.plantingDateToleranceDays}
                onChange={(e) =>
                  onChange({
                    ...params,
                    plantingDateToleranceDays: parseInt(e.target.value) || 0,
                  })
                }
                min={0}
                max={7}
              />
              <p className="text-xs text-muted-foreground">
                Keeps UAV spraying synchronized (±
                {params.plantingDateToleranceDays} days)
              </p>
            </div>
          </div>

          {/* Group Size Constraints */}
          <div className="space-y-3">
            <Label>Group Size Constraints</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-2">
                <Label htmlFor="minArea" className="text-xs">
                  Min Area (ha)
                </Label>
                <Input
                  id="minArea"
                  type="number"
                  value={params.minGroupAreaHa}
                  onChange={(e) =>
                    onChange({
                      ...params,
                      minGroupAreaHa: parseInt(e.target.value) || 0,
                    })
                  }
                  min={5}
                  max={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxArea" className="text-xs">
                  Max Area (ha)
                </Label>
                <Input
                  id="maxArea"
                  type="number"
                  value={params.maxGroupAreaHa}
                  onChange={(e) =>
                    onChange({
                      ...params,
                      maxGroupAreaHa: parseInt(e.target.value) || 0,
                    })
                  }
                  min={10}
                  max={200}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minPlots" className="text-xs">
                  Min Plots
                </Label>
                <Input
                  id="minPlots"
                  type="number"
                  value={params.minPlots}
                  onChange={(e) =>
                    onChange({
                      ...params,
                      minPlots: parseInt(e.target.value) || 0,
                    })
                  }
                  min={1}
                  max={50}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxPlots" className="text-xs">
                  Max Plots
                </Label>
                <Input
                  id="maxPlots"
                  type="number"
                  value={params.maxPlots}
                  onChange={(e) =>
                    onChange({
                      ...params,
                      maxPlots: parseInt(e.target.value) || 0,
                    })
                  }
                  min={1}
                  max={100}
                />
              </div>
            </div>
          </div>

          {/* Supervisor Assignment */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoAssign"
              checked={params.autoAssignSupervisors}
              onChange={(e) =>
                onChange({
                  ...params,
                  autoAssignSupervisors: e.target.checked,
                })
              }
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="autoAssign" className="font-normal cursor-pointer">
              Auto-assign supervisors (round-robin)
            </Label>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={onPreview}
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <Eye className="mr-2 h-4 w-4" />
              Preview Groups
            </>
          )}
        </Button>
        <Button onClick={onFormNow} disabled={isLoading} className="flex-1">
          <Zap className="mr-2 h-4 w-4" />
          Form Groups Now
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Preview recommended to review grouping results before creation
      </p>
    </div>
  );
};

