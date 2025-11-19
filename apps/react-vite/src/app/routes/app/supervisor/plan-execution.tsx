import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ContentLayout } from '@/components/layouts';
import { 
  PlanExecutionDashboard, 
  CultivationTasksList,
  PlotImplementationDialog 
} from '@/features/production-plans/components';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const PlanExecutionPage = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const [showTasks, setShowTasks] = useState(false);
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);

  if (!planId) {
    return (
      <ContentLayout title="Plan Execution">
        <Card className="border-destructive/50">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Plan ID is required</p>
          </CardContent>
        </Card>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout 
      title={showTasks ? "Cultivation Tasks" : "Plan Execution"}
    >
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            icon={<ArrowLeft className="h-4 w-4" />}
          >
            Back
          </Button>
          {showTasks && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTasks(false)}
            >
              View Summary
            </Button>
          )}
        </div>

        {!showTasks ? (
          <PlanExecutionDashboard
            planId={planId}
            onViewTasks={() => setShowTasks(true)}
            onViewPlotDetails={(plotId) => setSelectedPlotId(plotId)}
          />
        ) : (
          <CultivationTasksList planId={planId} />
        )}

        {selectedPlotId && (
          <PlotImplementationDialog
            isOpen={!!selectedPlotId}
            onClose={() => setSelectedPlotId(null)}
            plotId={selectedPlotId}
            productionPlanId={planId}
          />
        )}
      </div>
    </ContentLayout>
  );
};

export default PlanExecutionPage;

