/**
 * EXAMPLE: Using the New Group Formation Workflow
 * 
 * This file demonstrates how to integrate the new GroupFormationModalV2
 * into your application.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GroupFormationModalV2 } from '@/features/cluster/components';
import { Badge } from '@/components/ui/badge';

/**
 * Example 1: Basic Usage
 * Simple integration with minimal configuration
 */
export function BasicUsageExample() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setIsModalOpen(true)}>
        Form Groups (New Workflow)
      </Button>

      <GroupFormationModalV2
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        clusterId="your-cluster-id"
        seasonId="your-season-id"
        year={2024}
        availablePlots={100}
        onGroupsCreated={() => {
          console.log('Groups created successfully!');
          // Refresh your data here
        }}
      />
    </div>
  );
}

/**
 * Example 2: With Callback Handling
 * Shows how to handle success/error cases
 */
export function WithCallbacksExample() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGroupsCreated = async () => {
    setIsLoading(true);
    try {
      // Refresh your cluster data
      // await refetchClusterData();
      
      // Show success message
      console.log('Groups created and data refreshed');
      
      // Close modal
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Button 
        onClick={() => setIsModalOpen(true)}
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Form Groups'}
      </Button>

      <GroupFormationModalV2
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        clusterId="your-cluster-id"
        seasonId="your-season-id"
        year={2024}
        availablePlots={100}
        onGroupsCreated={handleGroupsCreated}
      />
    </div>
  );
}

/**
 * Example 3: Integration with Cluster Dashboard
 * Shows how to integrate with existing cluster data
 */
export function ClusterDashboardExample({
  clusterData,
}: {
  clusterData: {
    clusterId: string;
    currentSeason: {
      seasonId: string;
      year: number;
    };
    readiness: {
      availablePlots: number;
      isReadyToFormGroups: boolean;
      blockingIssues: string[];
    };
  };
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const canFormGroups = 
    clusterData.readiness.isReadyToFormGroups &&
    clusterData.readiness.blockingIssues.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Group Formation</h3>
          <p className="text-sm text-muted-foreground">
            {clusterData.readiness.availablePlots} plots available
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          disabled={!canFormGroups}
        >
          Form Groups
        </Button>
      </div>

      {!canFormGroups && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm font-medium text-orange-900">
            Cannot form groups:
          </p>
          <ul className="mt-2 text-sm text-orange-800 list-disc list-inside">
            {clusterData.readiness.blockingIssues.map((issue, index) => (
              <li key={index}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      <GroupFormationModalV2
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        clusterId={clusterData.clusterId}
        seasonId={clusterData.currentSeason.seasonId}
        year={clusterData.currentSeason.year}
        availablePlots={clusterData.readiness.availablePlots}
        onGroupsCreated={() => {
          // Invalidate and refetch cluster data
          console.log('Refreshing cluster dashboard...');
        }}
      />
    </div>
  );
}

/**
 * Example 4: Side-by-Side Comparison
 * Shows both old and new workflows for comparison
 */
export function WorkflowComparisonExample() {
  const [isOldModalOpen, setIsOldModalOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const sharedProps = {
    clusterId: 'your-cluster-id',
    seasonId: 'your-season-id',
    year: 2024,
    availablePlots: 100,
    onGroupsCreated: () => console.log('Groups created'),
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Old Workflow */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold">Old Workflow</h4>
            <Badge variant="outline" className="bg-gray-100">Legacy</Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Preview only, no editing capabilities
          </p>
          <Button
            variant="outline"
            onClick={() => setIsOldModalOpen(true)}
          >
            Open Old Modal
          </Button>
        </div>

        {/* New Workflow */}
        <div className="p-4 border-2 border-blue-500 rounded-lg bg-blue-50">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold">New Workflow</h4>
            <Badge className="bg-blue-600">Recommended</Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Editable preview with supervisor assignment
          </p>
          <Button onClick={() => setIsNewModalOpen(true)}>
            Open New Modal
          </Button>
        </div>
      </div>

      {/* Old Modal - Import from GroupFormationModal */}
      {/* <GroupFormationModal
        isOpen={isOldModalOpen}
        onClose={() => setIsOldModalOpen(false)}
        {...sharedProps}
      /> */}

      {/* New Modal */}
      <GroupFormationModalV2
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        {...sharedProps}
      />
    </div>
  );
}

/**
 * Example 5: Custom Success Handler
 * Shows how to handle different success scenarios
 */
export function CustomSuccessHandlerExample() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successStats, setSuccessStats] = useState<{
    groupsCreated: number;
    timestamp: Date;
  } | null>(null);

  const handleGroupsCreated = () => {
    // Record success
    setSuccessStats({
      groupsCreated: 0, // This will be updated by the modal
      timestamp: new Date(),
    });

    // You could also:
    // - Send analytics event
    // - Show custom notification
    // - Navigate to groups page
    // - Trigger data refresh

    console.log('Groups created at:', new Date().toISOString());
  };

  return (
    <div className="space-y-4">
      <Button onClick={() => setIsModalOpen(true)}>
        Form Groups
      </Button>

      {successStats && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm font-medium text-green-900">
            ✅ Groups created successfully!
          </p>
          <p className="text-xs text-green-700 mt-1">
            {successStats.timestamp.toLocaleString()}
          </p>
        </div>
      )}

      <GroupFormationModalV2
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        clusterId="your-cluster-id"
        seasonId="your-season-id"
        year={2024}
        availablePlots={100}
        onGroupsCreated={handleGroupsCreated}
      />
    </div>
  );
}

