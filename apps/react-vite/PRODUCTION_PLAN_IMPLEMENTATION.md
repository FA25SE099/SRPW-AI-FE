# Production Plan Workflow Implementation

This document describes the implementation of the Production Plan workflow in the frontend application.

## 📁 File Structure

```
src/features/production-plans/
├── api/
│   ├── create-production-plan.ts          ✅ Create production plan from template
│   ├── get-production-plan-draft.ts       ✅ Preview plan with cost estimates
│   ├── get-production-plan.ts             ✅ Get single production plan
│   ├── update-production-plan.ts          ✅ Update draft plans
│   ├── submit-production-plan.ts          ✅ Submit for expert approval
│   ├── get-execution-summary.ts           ✅ Monitor plan execution
│   ├── get-cultivation-tasks.ts           ✅ View all tasks in plan
│   ├── get-plot-implementation.ts         ✅ View plot-specific tasks
│   ├── get-approved-plans.ts              ✅ List all approved plans
│   └── index.ts
├── components/
│   ├── create-production-plan-dialog.tsx  ✅ Two-step plan creation with preview
│   ├── plan-execution-dashboard.tsx       ✅ Monitor plan progress
│   ├── cultivation-tasks-list.tsx         ✅ Filterable task list
│   ├── plot-implementation-dialog.tsx     ✅ Detailed plot view
│   ├── submit-plan-button.tsx             ✅ Submit for approval
│   └── index.ts
└── types.ts                               ✅ TypeScript definitions

src/app/routes/app/
├── cluster/dashboard.tsx                  ✅ Integrated plan creation
├── supervisor/plan-execution.tsx          ✅ New page for monitoring
└── expert/plan-monitoring.tsx             ✅ New page for experts
```

## 🎯 Implemented Features

### 1. Production Plan Creation (Supervisor)

**Location:** Cluster Dashboard → Active Groups → "Create Plan" button

**Flow:**
1. **Select Template & Date**: Choose standard plan template and planting date
2. **Preview Draft**: System fetches current material prices and shows:
   - Estimated total cost
   - Price warnings (if any materials have outdated prices)
   - Full stage and task breakdown
   - Material requirements per hectare
3. **Create Plan**: Saves as "Draft" status
4. **Submit for Approval**: Changes status to "Pending"

**Components:**
- `CreateProductionPlanDialog`: Handles entire creation flow
- Integrates with `GroupsDashboard` in cluster dashboard

### 2. Plan Execution Monitoring

**Location:** 
- Supervisor: `/app/supervisor/plan-execution/:planId`
- Expert: `/app/expert/plan-monitoring`

**Features:**
- **Execution Summary Dashboard**:
  - Overall completion percentage
  - Cost tracking (estimated vs actual)
  - Task status breakdown (completed, in progress, pending)
  - Farmer participation stats
  - Plot-by-plot performance

- **Cultivation Tasks List**:
  - View all tasks across all plots
  - Filter by status (Draft, Pending, InProgress, Completed, Cancelled)
  - Shows farmer assignments, dates, and costs

- **Plot Implementation View**:
  - Detailed view for individual plots
  - Task timeline with execution order
  - Material usage (planned vs actual)
  - Cost breakdown per task

**Components:**
- `PlanExecutionDashboard`: Main monitoring interface
- `CultivationTasksList`: Filterable task list
- `PlotImplementationDialog`: Plot-specific details

### 3. Submit Plan for Approval

**Location:** Production plan detail pages

**Features:**
- Confirmation dialog with plan summary
- Changes status from "Draft" → "Pending"
- Prevents further editing until approved/rejected
- Success notification on submission

**Component:**
- `SubmitPlanButton`: Reusable button with confirmation

### 4. Expert Approval (Enhanced)

**Location:** Expert dashboard → Pending Approvals

**Existing Features** (already implemented):
- View pending plans
- Approve or reject with comments
- System auto-creates cultivation tasks on approval

**New Feature:**
- Plan Monitoring page to view all approved plans and their execution status

## 🔄 Workflow Implementation

### Phase 1: Standard Plan (Template) ✅ Already Exists
- Expert creates reusable templates
- Defined with relative dates and quantities per hectare

### Phase 2: Create Production Plan ✅ NEW
1. Supervisor selects group and standard plan
2. System shows draft preview with:
   - Current material prices
   - Calculated quantities based on group area
   - Price warnings for outdated prices
3. Supervisor reviews and creates plan (Draft status)
4. Optional: Edit plan before submission
5. Supervisor submits for approval (Pending status)

### Phase 3: Expert Approval ✅ Enhanced
- Expert reviews pending plans
- Approves or rejects with comments
- Backend auto-creates cultivation tasks on approval

### Phase 4: Automatic Task Distribution ✅ Backend Handled
- System creates tasks for each plot
- Scales quantities by plot area
- Assigns to plot owners (farmers)

### Phase 5: Monitor Execution ✅ NEW
- Supervisors and experts can monitor:
  - Overall plan progress
  - Task completion by plot
  - Cost tracking
  - Material usage
- View individual plot implementation details

## 🎨 UI Components

### Key UI Patterns Used

1. **Two-Step Dialogs**:
   - Step 1: Input form
   - Step 2: Preview/confirmation
   - Used in: `CreateProductionPlanDialog`

2. **Status Badges**:
   - Draft (gray)
   - Pending (yellow)
   - Approved (green)
   - InProgress (blue)
   - Completed (green)

3. **Progress Indicators**:
   - Progress bars for completion %
   - Color-coded stats cards
   - Timeline visualizations

4. **Price Warnings**:
   - Prominent yellow alert boxes
   - List of outdated materials
   - Warning icons next to affected items

5. **Filterable Lists**:
   - Toggle filters panel
   - Status, plot, and date filters
   - Real-time filtering

## 🔌 API Integration

All API hooks follow the established patterns:

```typescript
// Query Hooks (GET)
useProductionPlanDraft({ params, queryConfig })
useProductionPlan({ planId, queryConfig })
useExecutionSummary({ planId, queryConfig })
useCultivationTasks({ params, queryConfig })
usePlotImplementation({ params, queryConfig })
useApprovedPlans({ params, queryConfig })

// Mutation Hooks (POST/PUT)
useCreateProductionPlan({ mutationConfig })
useUpdateProductionPlan({ mutationConfig })
useSubmitProductionPlan({ mutationConfig })
```

### API Endpoints Expected

```
GET  /api/production-plans/draft
POST /api/production-plans
GET  /api/production-plans/{id}
PUT  /api/production-plans/{id}
POST /api/production-plans/{id}/submit
GET  /api/production-plans/{id}/execution-summary
GET  /api/production-plans/{id}/cultivation-tasks
GET  /api/production-plans/plot-implementation
GET  /api/production-plans/approved
```

## 🚀 Usage Examples

### For Cluster Managers

1. **Create Production Plan**:
   - Navigate to Cluster Dashboard
   - Find the group in "Active Groups" section
   - Click "Create Plan" button
   - Select standard plan template
   - Choose planting date
   - Review preview with costs
   - Create plan

2. **Submit for Approval**:
   - Open the created plan
   - Click "Submit for Approval"
   - Confirm submission

### For Supervisors

1. **Monitor Plan Execution**:
   - Navigate to plan execution page
   - View overall progress dashboard
   - Check plot performance
   - Click on plots for detailed view
   - View all tasks with filters

### For Experts

1. **Approve Plans**:
   - Navigate to Pending Approvals
   - Review plan details
   - Approve or reject

2. **Monitor Approved Plans**:
   - Navigate to Plan Monitoring
   - View list of all approved plans
   - Click to see execution details
   - Monitor progress and costs

## 🎯 Key Features Highlights

### 1. Dynamic Price Fetching
- System fetches current material prices at plan creation
- Warns if prices are outdated
- Calculates total costs automatically

### 2. Area-Based Calculations
- Standard plan defines quantities per hectare
- System scales to actual group/plot area
- Automatic cost estimation

### 3. Real-Time Monitoring
- Track completion percentages
- Compare estimated vs actual costs
- Monitor individual plot progress
- View farmer task assignments

### 4. Status Workflow
- Clear progression: Draft → Pending → Approved
- Edit protection based on status
- Audit trail with approval info

### 5. Comprehensive Task Management
- Tasks distributed to all plots automatically
- Filterable by status, plot, date
- Material tracking (planned vs actual)
- Cost breakdown per task

## 🔒 Security & Permissions

- Supervisors can only create plans for their groups
- Only Draft plans can be edited
- Experts can approve/reject any pending plan
- Status changes are restricted by role

## 📱 Responsive Design

All components are responsive:
- Mobile: Single column layouts
- Tablet: 2-column grids
- Desktop: 3-4 column grids with expanded views

## 🎨 Visual Design

- Consistent color coding for statuses
- Icon-based visual hierarchy
- Card-based layouts
- Progress bars and badges
- Alert boxes for warnings

## ⚡ Performance Considerations

- Query caching with React Query
- Lazy loading of components
- Conditional rendering
- Optimistic updates on mutations
- Infinite scroll ready (for large task lists)

## 🧪 Testing Recommendations

1. **Component Testing**:
   - Test dialog flows
   - Test form validation
   - Test filter functionality

2. **Integration Testing**:
   - Test full plan creation flow
   - Test approval workflow
   - Test monitoring dashboards

3. **E2E Testing**:
   - Test supervisor creating and submitting plan
   - Test expert approving plan
   - Test monitoring after approval

## 📝 Future Enhancements

Potential improvements:
1. Export execution reports to Excel
2. Real-time notifications for status changes
3. Task assignment to specific farmers
4. Calendar view for tasks
5. Cost comparison analytics
6. Yield prediction integration
7. Weather integration for task scheduling
8. Mobile app for farmers

## 🔗 Related Documentation

- `ProductionPlanWorkflow.md`: API workflow guide
- `FrontendImplementationGuide.md`: General frontend patterns
- `API_USAGE_GUIDE.md`: API documentation

## ✅ Completion Status

All tasks completed:
- ✅ API hooks implementation
- ✅ Component development
- ✅ Integration with cluster dashboard
- ✅ Routes and navigation
- ✅ TypeScript types
- ✅ Responsive design
- ✅ Error handling
- ✅ Loading states

The production plan workflow is now fully functional in the frontend!

