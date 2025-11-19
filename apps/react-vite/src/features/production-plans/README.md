# Production Plans Feature

This feature implements the complete production plan workflow from template creation to execution monitoring.

## Quick Start

### Creating a Production Plan

```tsx
import { CreateProductionPlanDialog } from '@/features/production-plans/components';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <CreateProductionPlanDialog
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      groupId="group-id"
      groupName="Group A"
      seasonId="season-id"
    />
  );
}
```

### Monitoring Plan Execution

```tsx
import { PlanExecutionDashboard } from '@/features/production-plans/components';

function MonitoringPage() {
  return (
    <PlanExecutionDashboard
      planId="plan-id"
      onViewTasks={() => console.log('View tasks')}
      onViewPlotDetails={(plotId) => console.log('View plot', plotId)}
    />
  );
}
```

### Viewing Cultivation Tasks

```tsx
import { CultivationTasksList } from '@/features/production-plans/components';

function TasksPage() {
  return (
    <CultivationTasksList
      planId="plan-id"
      initialStatus="InProgress"
    />
  );
}
```

### Viewing Plot Implementation

```tsx
import { PlotImplementationDialog } from '@/features/production-plans/components';

function MyComponent() {
  return (
    <PlotImplementationDialog
      isOpen={true}
      onClose={() => {}}
      plotId="plot-id"
      productionPlanId="plan-id"
    />
  );
}
```

### Submit Plan for Approval

```tsx
import { SubmitPlanButton } from '@/features/production-plans/components';

function PlanDetailPage() {
  return (
    <SubmitPlanButton
      planId="plan-id"
      planName="Winter-Spring 2025"
      supervisorId="supervisor-id"
      onSuccess={() => console.log('Submitted!')}
    />
  );
}
```

## API Hooks

### Queries (GET)

```tsx
// Get production plan draft preview
const { data: draft } = useProductionPlanDraft({
  params: {
    standardPlanId: 'template-id',
    groupId: 'group-id',
    basePlantingDate: '2025-02-01'
  }
});

// Get production plan details
const { data: plan } = useProductionPlan({
  planId: 'plan-id'
});

// Get execution summary
const { data: summary } = useExecutionSummary({
  planId: 'plan-id'
});

// Get cultivation tasks
const { data: tasks } = useCultivationTasks({
  params: {
    planId: 'plan-id',
    status: 'InProgress',
    plotId: 'plot-id' // optional
  }
});

// Get plot implementation
const { data: implementation } = usePlotImplementation({
  params: {
    plotId: 'plot-id',
    productionPlanId: 'plan-id'
  }
});

// Get approved plans
const { data: plans } = useApprovedPlans({
  params: {
    groupId: 'group-id', // optional
    fromDate: '2025-01-01', // optional
    toDate: '2025-12-31' // optional
  }
});
```

### Mutations (POST/PUT)

```tsx
// Create production plan
const createMutation = useCreateProductionPlan({
  mutationConfig: {
    onSuccess: (data) => {
      console.log('Created plan:', data.productionPlanId);
    }
  }
});

createMutation.mutate({
  standardPlanId: 'template-id',
  groupId: 'group-id',
  basePlantingDate: '2025-02-01',
  planName: 'Custom Plan Name' // optional
});

// Update production plan (Draft only)
const updateMutation = useUpdateProductionPlan({
  mutationConfig: {
    onSuccess: () => console.log('Updated!')
  }
});

updateMutation.mutate({
  planId: 'plan-id',
  planName: 'New Name',
  basePlantingDate: '2025-02-05',
  stages: [...] // optional
});

// Submit for approval
const submitMutation = useSubmitProductionPlan({
  mutationConfig: {
    onSuccess: () => console.log('Submitted!')
  }
});

submitMutation.mutate({
  planId: 'plan-id',
  supervisorId: 'supervisor-id'
});
```

## Types

### Main Types

```typescript
// Production Plan Status
type ProductionPlanStatus = 'Draft' | 'Pending' | 'Approved' | 'Rejected';

// Cultivation Task Status
type CultivationTaskStatus = 'Draft' | 'PendingApproval' | 'InProgress' | 'Completed' | 'Cancelled';

// Production Plan Draft (preview)
interface ProductionPlanDraft {
  standardPlanId: string;
  groupId: string;
  planName: string;
  totalArea: number;
  basePlantingDate: string;
  estimatedTotalPlanCost: number;
  hasPriceWarnings: boolean;
  priceWarnings: string[];
  stages: StageInPlan[];
}

// Production Plan
interface ProductionPlan {
  productionPlanId: string;
  planName: string;
  status: ProductionPlanStatus;
  basePlantingDate: string;
  totalArea: number;
  estimatedTotalCost: number;
  groupId: string;
  groupName: string;
  // ... more fields
}

// Execution Summary
interface ExecutionSummary {
  planId: string;
  planName: string;
  approvedAt: string;
  approvedByExpert: string;
  totalTasksCreated: number;
  tasksCompleted: number;
  tasksInProgress: number;
  tasksPending: number;
  completionPercentage: number;
  estimatedCost: number;
  actualCost: number;
  plotSummaries: PlotSummary[];
}
```

See `types.ts` for complete type definitions.

## Component Props

### CreateProductionPlanDialog

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| isOpen | boolean | Yes | Dialog open state |
| onClose | () => void | Yes | Close handler |
| groupId | string | Yes | Group ID |
| groupName | string | Yes | Group name for display |
| seasonId | string | No | Season ID |

### PlanExecutionDashboard

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| planId | string | Yes | Production plan ID |
| onViewTasks | () => void | No | Handler for viewing all tasks |
| onViewPlotDetails | (plotId: string) => void | No | Handler for viewing plot details |

### CultivationTasksList

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| planId | string | Yes | Production plan ID |
| initialStatus | CultivationTaskStatus | No | Initial status filter |
| initialPlotId | string | No | Initial plot filter |

### PlotImplementationDialog

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| isOpen | boolean | Yes | Dialog open state |
| onClose | () => void | Yes | Close handler |
| plotId | string | Yes | Plot ID |
| productionPlanId | string | Yes | Production plan ID |

### SubmitPlanButton

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| planId | string | Yes | Production plan ID |
| planName | string | Yes | Plan name for confirmation |
| supervisorId | string | Yes | Supervisor ID |
| disabled | boolean | No | Disable button |
| onSuccess | () => void | No | Success callback |

## Workflow States

### Plan Status Flow

```
Draft → Pending → Approved
  ↓
Rejected → (Back to Draft if re-opened)
```

### Task Status Flow

```
Draft → PendingApproval → InProgress → Completed
                              ↓
                          Cancelled
```

## Best Practices

1. **Always check for price warnings** when displaying draft previews
2. **Show loading states** for all async operations
3. **Handle errors gracefully** with user-friendly messages
4. **Use optimistic updates** where appropriate
5. **Invalidate relevant queries** after mutations
6. **Respect status restrictions** (e.g., only edit Draft plans)

## Error Handling

All hooks include error handling:

```tsx
const { data, isLoading, error } = useProductionPlan({ planId });

if (error) {
  return <ErrorMessage message={error.message} />;
}
```

## Cache Management

React Query automatically manages caching. Query keys:

```typescript
['production-plan-draft', params]
['production-plan', planId]
['execution-summary', planId]
['cultivation-tasks', params]
['plot-implementation', params]
['approved-plans', params]
```

Mutations automatically invalidate related queries.

## Styling

All components use:
- Tailwind CSS for styling
- shadcn/ui components
- Lucide React icons
- Responsive design patterns

## Integration Points

This feature integrates with:
- `@/features/cluster` - Group management
- `@/features/standard-plans` - Template selection
- `@/features/expert` - Approval workflow
- `@/features/supervisor` - Plan monitoring

## Routes

Recommended routes:

```tsx
// Supervisor routes
/app/supervisor/plan-execution/:planId

// Expert routes
/app/expert/plan-monitoring

// Or integrate into existing dashboards
```

## Testing

Example test:

```tsx
import { render, screen } from '@/testing/test-utils';
import { CreateProductionPlanDialog } from './create-production-plan-dialog';

test('renders create plan dialog', () => {
  render(
    <CreateProductionPlanDialog
      isOpen={true}
      onClose={jest.fn()}
      groupId="test-group"
      groupName="Test Group"
    />
  );
  
  expect(screen.getByText('Create Production Plan')).toBeInTheDocument();
});
```

## Support

For issues or questions:
1. Check the workflow documentation: `ProductionPlanWorkflow.md`
2. Review the implementation guide: `PRODUCTION_PLAN_IMPLEMENTATION.md`
3. Check API documentation: `API_USAGE_GUIDE.md`

