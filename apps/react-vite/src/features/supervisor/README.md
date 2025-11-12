# Supervisor Group Management Feature

Implementation of the Supervisor Group Management feature based on `SupervisorGroupManagement.md`.

## 📁 Structure

```
src/features/supervisor/
├── api/
│   ├── get-my-group.ts          # API hook for fetching current/specific season group
│   ├── get-group-history.ts     # API hook for fetching historical groups
│   └── index.ts
├── components/
│   ├── readiness-card.tsx       # Production plan readiness indicator
│   ├── group-info-card.tsx      # Group details display
│   ├── plots-table.tsx          # Plots listing with farmer info
│   └── index.ts
└── README.md
```

## 🎯 Features Implemented

### 1. **Group Overview Page** (`/app/supervisor/group`)
- View current season's group or select from history
- Comprehensive dashboard with three tabs:
  - **Overview**: Readiness card + Group info
  - **Plots**: Detailed table of all plots with polygon status
  - **History**: Past groups and their summaries

### 2. **Readiness Card Component**
- Visual progress indicator (0-100% score)
- 4 requirement checks with clear pass/fail indicators:
  - ✅ Rice Variety Selected
  - ✅ Total Area Defined
  - ✅ Plots Assigned
  - ✅ All Polygons Assigned
- Blocking issues alert (red)
- Warnings alert (yellow)
- Success state when ready

### 3. **Group Info Card**
- Season information (name, type, date range)
- Cluster details
- Rice variety
- Planting date
- Total area
- Production plans summary (if any exist)

### 4. **Plots Table**
- Summary statistics (total, with polygon, without polygon)
- Detailed table with:
  - Plot ID
  - Tờ/Thửa numbers
  - Area (hectares)
  - Soil type
  - Polygon status badge
  - Farmer information (name, code)
  - Contact details (phone, address)
  - Plot status
  - View map action (for plots with polygons)
- Visual highlighting for plots missing polygons

## 🔌 API Integration

### Endpoints Used

**Get Current/Specific Season Group:**
```typescript
GET /api/Supervisor/my-group
GET /api/Supervisor/my-group?seasonId={id}
```

**Get Group History:**
```typescript
GET /api/Supervisor/my-group/history
GET /api/Supervisor/my-group/history?year={year}
GET /api/Supervisor/my-group/history?includeCurrentSeason=true
```

### React Query Hooks

```typescript
import { useMyGroup, useGroupHistory } from '@/features/supervisor/api';

// Get current season group
const { data: group } = useMyGroup();

// Get specific season
const { data: group } = useMyGroup({ seasonId: '...' });

// Get history
const { data: history } = useGroupHistory();
```

## 🎨 UI Components Created

New UI components added to support this feature:

- `src/components/ui/alert/` - Alert, AlertTitle, AlertDescription
- `src/components/ui/badge/` - Badge with variants
- `src/components/ui/card/` - Card, CardHeader, CardTitle, CardContent
- `src/components/ui/progress/` - Progress bar
- `src/components/ui/tabs/radix-tabs.tsx` - Radix-based Tabs components

## 🚀 Usage

### Navigate to Group Management
```typescript
import { paths } from '@/config/paths';
navigate(paths.app.supervisor.group.getHref());
```

### Check Readiness Before Creating Plan
```typescript
const { data: group } = useMyGroup();

if (group?.readiness.isReady) {
  // Allow plan creation
  navigate(`/app/supervisor/plans?groupId=${group.groupId}`);
} else {
  // Show blocking issues
  console.log('Blocking issues:', group.readiness.blockingIssues);
}
```

## 📊 Data Flow

```
User visits /app/supervisor/group
         ↓
useMyGroup() hook called
         ↓
GET /api/Supervisor/my-group
         ↓
Response with group data
         ↓
Render components:
  - ReadinessCard (shows readiness status)
  - GroupInfoCard (shows group details)
  - PlotsTable (shows all plots)
  - History tab (shows past groups)
```

## 🔄 Season Switching

Users can view different seasons using the dropdown:
1. Select season from dropdown
2. `selectedSeasonId` state updates
3. `useMyGroup({ seasonId })` refetches data
4. UI updates with new season's group data

## ✅ Implementation Checklist

- [x] Type definitions for all API responses
- [x] API client functions with React Query
- [x] Readiness indicator component
- [x] Group info display component
- [x] Plots table with detailed information
- [x] Main group management page with tabs
- [x] Season selector for viewing history
- [x] History view with clickable cards
- [x] Route configuration
- [x] Error handling and loading states
- [x] No linting errors

## 🚧 Not Yet Implemented

- [ ] Map visualization for plots (specified as not needed)
- [ ] Polygon assignment flow
- [ ] Production plan creation integration (needs separate implementation)

## 📝 Notes

- The route `/app/supervisor/group` already exists in the router
- Navigation items in `src/app/routes/app/root.tsx` already include the group management link
- Ready for integration with production plan creation feature

