import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, Eye, Settings } from 'lucide-react';

type SuccessStepProps = {
  groupsCreated: number;
  plotsGrouped: number;
  ungroupedPlots: number;
  onViewGroups: () => void;
  onHandleUngrouped: () => void;
};

export const SuccessStep = ({
  groupsCreated,
  plotsGrouped,
  ungroupedPlots,
  onViewGroups,
  onHandleUngrouped,
}: SuccessStepProps) => {
  return (
    <div className="space-y-6 text-center">
      {/* Success Icon */}
      <div className="flex justify-center">
        <div className="rounded-full bg-green-100 p-6">
          <CheckCircle2 className="h-16 w-16 text-green-600" />
        </div>
      </div>

      {/* Success Message */}
      <div className="space-y-2">
        <h3 className="text-2xl font-bold">Groups Created Successfully!</h3>
        <p className="text-muted-foreground">
          {groupsCreated} groups have been created for this season
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg">
          <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{groupsCreated}</p>
          <p className="text-xs text-muted-foreground">Groups Created</p>
        </div>
        <div className="p-4 border rounded-lg">
          <CheckCircle2 className="h-6 w-6 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{plotsGrouped}</p>
          <p className="text-xs text-muted-foreground">Plots Assigned</p>
        </div>
        <div className="p-4 border rounded-lg">
          <AlertTriangle
            className={`h-6 w-6 mx-auto mb-2 ${
              ungroupedPlots > 0 ? 'text-orange-600' : 'text-gray-400'
            }`}
          />
          <p className="text-2xl font-bold">{ungroupedPlots}</p>
          <p className="text-xs text-muted-foreground">Need Manual Assignment</p>
        </div>
      </div>

      {/* What's Next Section */}
      <div className="text-left space-y-4 p-4 border rounded-lg bg-muted/30">
        <h4 className="font-semibold">What's Next?</h4>

        <div className="space-y-3">
          {/* Automatic Actions */}
          <div>
            <p className="text-sm font-medium flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Automatic Actions Completed:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6">
              <li>• Groups created and activated</li>
              <li>• Plots assigned to groups</li>
              <li>• Supervisors assigned to groups</li>
              <li>• Group boundaries calculated</li>
            </ul>
          </div>

          {/* Manual Actions */}
          <div>
            <p className="text-sm font-medium flex items-center gap-2 mb-2">
              <Settings className="h-4 w-4 text-blue-600" />
              Manual Actions Required:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6">
              {ungroupedPlots > 0 && (
                <li>
                  • Handle {ungroupedPlots} ungrouped{' '}
                  {ungroupedPlots === 1 ? 'plot' : 'plots'}
                </li>
              )}
              <li>• Review group assignments</li>
              <li>• Create production plans for each group</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 pt-4">
        <Button onClick={onViewGroups} className="w-full" size="lg">
          <Eye className="mr-2 h-5 w-5" />
          View Groups
        </Button>
        {ungroupedPlots > 0 && (
          <Button
            onClick={onHandleUngrouped}
            variant="outline"
            className="w-full"
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Handle Ungrouped Plots ({ungroupedPlots})
          </Button>
        )}
      </div>
    </div>
  );
};

