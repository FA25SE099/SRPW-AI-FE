# Supervisor Group Management - "My Group This Season"

## 📋 Overview

This feature allows supervisors to view and manage their assigned group for the current season, including all plots with detailed information and a comprehensive readiness check for production plan creation.

**Key Constraint**: One supervisor manages **ONE group per season**.

---

## 🎯 Feature Purpose

### What Problem Does It Solve?

When a cluster manager imports farmers with plot data, the system auto-assigns polygon boundary tasks to supervisors. This feature provides supervisors with:

1. **Single Dashboard View** - Complete overview of their group and all plots
2. **Polygon Completion Tracking** - See which plots have boundaries and which need attention
3. **Production Plan Readiness** - Know if the group is ready for production plan creation
4. **Farmer Information** - Quick access to farmer details for each plot
5. **Season Context** - Clear visibility of which season they're managing
6. **Historical Data** - Access to past groups and their performance across seasons

---

## 🏗️ Architecture

### Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    Supervisor Dashboard                          │
│                                                                  │
│  GET /api/Supervisor/my-group?seasonId={optional}               │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  GetMyGroupThisSeasonQuery                                │  │
│  │  - SupervisorId (from auth)                               │  │
│  │  - SeasonId (optional, defaults to active season)         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  GetMyGroupThisSeasonQueryHandler                         │  │
│  │  - Fetches group for supervisor + season                  │  │
│  │  - Loads all plots with farmers                           │  │
│  │  - Calculates readiness score                             │  │
│  │  - Returns comprehensive group data                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  MyGroupResponse                                          │  │
│  │  - Group details                                          │  │
│  │  - List of plots with polygon status                     │  │
│  │  - Readiness assessment                                   │  │
│  │  - Production plans summary                               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📡 API Endpoints

### **GET** `/api/Supervisor/my-group`

**Authorization**: Required (Supervisor role)

**Query Parameters**:
- `seasonId` (optional, Guid): Specific season ID. If not provided, automatically determines current season based on today's date.

### **GET** `/api/Supervisor/my-group/history`

**Authorization**: Required (Supervisor role)

**Query Parameters**:
- `year` (optional, int): Filter groups by year
- `includeCurrentSeason` (optional, bool): Include current season group in results (default: false)

### Request Examples

#### Get Current Season Group

GET /api/Supervisor/my-group
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Get Specific Season Group

GET /api/Supervisor/my-group?seasonId=550e8400-e29b-41d4-a716-446655440000 
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Get Past Groups History

GET /api/Supervisor/my-group/history HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Get Past Groups for Specific Year

GET /api/Supervisor/my-group/history?year=2024
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response Examples

#### Get My Group Response

```json
{
  "succeeded": true,
  "message": null,
  "data": {
    "groupId": "019a0806-24ef-7df0-ac28-74495da52a15",
    "groupName": "Group 019a0806",
    "status": "Active",
    "plantingDate": "2024-12-15T00:00:00Z",
    "totalArea": 25.5,
    "areaGeoJson": "{\"type\":\"Polygon\",\"coordinates\":[...]}",
    "riceVarietyId": "550e8400-e29b-41d4-a716-446655440001",
    "riceVarietyName": "IR64",
    "season": {
      "seasonId": "550e8400-e29b-41d4-a716-446655440000",
      "seasonName": "Đông Xuân",
      "seasonType": "Winter-Spring",
      "startDate": "12/01",
      "endDate": "04/30",
      "isActive": true
    },
    "clusterId": "550e8400-e29b-41d4-a716-446655440002",
    "clusterName": "Mekong Delta Cluster",
    "plots": [
      {
        "plotId": "019a0806-24ef-7df0-ac28-74495da52a16",
        "soThua": 15,
        "soTo": 36,
        "area": 5.5,
        "soilType": "Đất phù sa",
        "hasPolygon": false,
        "polygonGeoJson": null,
        "centroidGeoJson": null,
        "status": "PendingPolygon",
        "farmerId": "019a0806-24ef-7df0-ac28-74495da52a17",
        "farmerName": "Trần Thị B",
        "farmerPhone": "0912345678",
        "farmerAddress": "123 Đường Lúa, Xã Tân Thành",
        "farmCode": "FARM001"
      },
      {
        "plotId": "019a0806-24ef-7df0-ac28-74495da52a18",
        "soThua": 16,
        "soTo": 37,
        "area": 3.2,
        "soilType": "Đất cát",
        "hasPolygon": true,
        "polygonGeoJson": "{\"type\":\"Polygon\",\"coordinates\":[[[105.7,10.0],[105.7,10.005],[105.708,10.005],[105.708,10.0],[105.7,10.0]]]}",
        "centroidGeoJson": "{\"type\":\"Point\",\"coordinates\":[105.704,10.0025]}",
        "status": "Active",
        "farmerId": "019a0806-24ef-7df0-ac28-74495da52a19",
        "farmerName": "Nguyễn Văn C",
        "farmerPhone": "0923456789",
        "farmerAddress": "456 Đường Mía, Xã Tân Thành",
        "farmCode": "FARM002"
      }
    ],
    "readiness": {
      "isReady": false,
      "readinessScore": 75,
      "readinessLevel": "Almost Ready",
      "hasRiceVariety": true,
      "hasTotalArea": true,
      "hasPlots": true,
      "allPlotsHavePolygons": false,
      "blockingIssues": [
        "5 plot(s) missing polygon boundaries"
      ],
      "warnings": [],
      "totalPlots": 15,
      "plotsWithPolygon": 10,
      "plotsWithoutPolygon": 5
    },
    "productionPlans": {
      "totalPlans": 1,
      "activePlans": 0,
      "draftPlans": 1,
      "approvedPlans": 0,
      "hasActiveProductionPlan": false
    }
  }
}
```

#### Get Group History Response

```json
{
  "succeeded": true,
  "message": null,
  "data": [
    {
      "groupId": "019a0806-24ef-7df0-ac28-74495da52a15",
      "groupName": "Group 019a0806",
      "status": "Completed",
      "season": {
        "seasonId": "550e8400-e29b-41d4-a716-446655440000",
        "seasonName": "Hè Thu",
        "seasonType": "Summer-Autumn",
        "startDate": "05/01",
        "endDate": "08/31",
        "isActive": false
      },
      "totalArea": 25.5,
      "totalPlots": 8,
      "riceVarietyName": "IR64",
      "plantingDate": "2024-05-15T00:00:00Z",
      "productionPlansCount": 1,
      "clusterName": "Mekong Delta Cluster A"
    },
    {
      "groupId": "019a0806-24ef-7df0-ac28-74495da52a16",
      "groupName": "Group 019a0806",
      "status": "Completed",
      "season": {
        "seasonId": "550e8400-e29b-41d4-a716-446655440001",
        "seasonName": "Đông Xuân",
        "seasonType": "Winter-Spring",
        "startDate": "12/01",
        "endDate": "04/30",
        "isActive": false
      },
      "totalArea": 22.0,
      "totalPlots": 6,
      "riceVarietyName": "OM5451",
      "plantingDate": "2023-12-20T00:00:00Z",
      "productionPlansCount": 1,
      "clusterName": "Mekong Delta Cluster A"
    }
  ]
}
```

### Error Responses

**404 Not Found** - No group assigned for this season
```json
{
  "succeeded": false,
  "message": "No group assigned to this supervisor for season 'Đông Xuân'",
  "data": null
}
```

**401 Unauthorized** - Not authenticated or not a supervisor
```json
{
  "succeeded": false,
  "message": "User not authenticated",
  "data": null
}
```

---

## 🌾 Vietnam Season System

### Three Fixed Cultivation Seasons

The Season table stores **3 fixed cultivation seasons** used in Vietnam rice production:

| Season Name | English | Date Range | Notes |
|-------------|---------|------------|-------|
| **Đông Xuân** | Winter-Spring | 12/01 - 04/30 | Crosses year boundary |
| **Hè Thu** | Summer-Autumn | 05/01 - 08/31 | Peak summer season |
| **Thu Đông** | Autumn-Winter | 09/01 - 11/30 | Fall harvest season |

### Current Season Detection

When `seasonId` is **not provided**, the system automatically determines the current season based on today's date:

**Algorithm**:
1. Get current date (month and day)
2. Check which season's date range contains current date
3. Handle year-crossing seasons (Đông Xuân crosses from December to April)

**Example**:
```
Today: November 15, 2024

Check against seasons:
- Đông Xuân (12/01 - 04/30): ❌ No
- Hè Thu (05/01 - 08/31): ❌ No
- Thu Đông (09/01 - 11/30): ✅ Yes

Result: Current season = "Thu Đông" (Autumn-Winter)
```

### Season in Group Context

- Each **Group** is assigned to one of the 3 seasons via `Group.SeasonId`
- Groups are created per cultivation cycle (e.g., "Đông Xuân 2024-2025")
- Supervisor manages one group per season
- When querying without `seasonId`, system returns group for the current season

---

## 🔍 Data Model

### MyGroupResponse

| Field | Type | Description |
|-------|------|-------------|
| `groupId` | Guid | Unique identifier for the group |
| `groupName` | string | Display name of the group |
| `status` | string | Group status (Draft, Active, ReadyForOptimization, Locked, Exception) |
| `plantingDate` | DateTime? | Planned planting date |
| `totalArea` | decimal? | Total cultivation area in hectares |
| `areaGeoJson` | string? | GeoJSON of group boundary polygon |
| `riceVarietyId` | Guid? | Selected rice variety ID |
| `riceVarietyName` | string? | Name of rice variety |
| `season` | SeasonInfo | Season information |
| `clusterId` | Guid | Cluster this group belongs to |
| `clusterName` | string? | Cluster name |
| `plots` | PlotDetail[] | List of all plots in group |
| `readiness` | GroupReadinessInfo | Production plan readiness assessment |
| `productionPlans` | ProductionPlansSummary | Existing plans summary |

### PlotDetail

| Field | Type | Description |
|-------|------|-------------|
| `plotId` | Guid | Plot unique identifier |
| `soThua` | int? | Plot number (Thửa) |
| `soTo` | int? | Map sheet number (Tờ) |
| `area` | decimal | Plot area in hectares |
| `soilType` | string? | Type of soil |
| `hasPolygon` | bool | **Whether polygon boundary is assigned** |
| `polygonGeoJson` | string? | GeoJSON of plot boundary (if assigned) |
| `centroidGeoJson` | string? | GeoJSON of plot center point |
| `status` | string | Plot status (Active, PendingPolygon, etc.) |
| `farmerId` | Guid | Farmer who owns this plot |
| `farmerName` | string? | Farmer's full name |
| `farmerPhone` | string? | Farmer's phone number |
| `farmerAddress` | string? | Farmer's address |
| `farmCode` | string? | Farmer's identification code |

### GroupReadinessInfo

| Field | Type | Description |
|-------|------|-------------|
| `isReady` | bool | **Overall readiness (true if no blocking issues)** |
| `readinessScore` | int | Score from 0-100 |
| `readinessLevel` | string | "Ready", "Almost Ready", "In Progress", "Not Ready" |
| `hasRiceVariety` | bool | Rice variety selected |
| `hasTotalArea` | bool | Total area defined |
| `hasPlots` | bool | At least one plot assigned |
| `allPlotsHavePolygons` | bool | **All plots have polygon boundaries** |
| `blockingIssues` | string[] | **Issues preventing production plan creation** |
| `warnings` | string[] | Non-critical warnings |
| `totalPlots` | int | Total number of plots |
| `plotsWithPolygon` | int | Plots with boundaries assigned |
| `plotsWithoutPolygon` | int | **Plots needing polygon assignment** |

### GroupHistorySummary

| Field | Type | Description |
|-------|------|-------------|
| `groupId` | Guid | Unique identifier for the group |
| `groupName` | string | Display name of the group |
| `status` | string | Group status |
| `season` | SeasonInfo | Season information |
| `totalArea` | decimal? | Total cultivation area in hectares |
| `totalPlots` | int | Number of plots in this group |
| `riceVarietyName` | string? | Name of rice variety used |
| `plantingDate` | DateTime? | When planting occurred |
| `productionPlansCount` | int | Number of production plans created |
| `clusterName` | string? | Cluster name |

---

## 🎯 Readiness Calculation Logic

### Required Checks (Must ALL Pass)

1. ✅ **Rice Variety Selected** - `group.RiceVarietyId != null`
2. ✅ **Total Area Defined** - `group.TotalArea > 0`
3. ✅ **Plots Assigned** - `plots.Count > 0`
4. ✅ **All Plots Have Polygons** - `plots.All(p => p.Boundary != null)`

### Readiness Score Calculation

```csharp
readinessScore = (passedChecks / totalRequiredChecks) * 100
```

- **100%** = All 4 required checks passed → `isReady = true`
- **75-99%** = 3/4 passed → "Almost Ready"
- **50-74%** = 2/4 passed → "In Progress"
- **0-49%** = 0-1 passed → "Not Ready"

### Warnings (Non-Blocking)

- Group status is not Active/ReadyForOptimization
- No planting date set (can specify later when creating plan)
- Active production plan already exists

---

## 📊 Use Cases

### Use Case 1: Supervisor Views Their Group

**Scenario**: Supervisor logs in and wants to see their group for the current season.

**Steps**:
1. Supervisor authenticates
2. Frontend calls `GET /api/Supervisor/my-group`
3. System retrieves group for current active season
4. Returns group with all plots and readiness status

**Result**: Supervisor sees:
- 15 total plots
- 10 plots with polygons ✅
- 5 plots without polygons ❌
- Readiness: 75% - "Almost Ready"
- Blocking issue: "5 plot(s) missing polygon boundaries"

---

### Use Case 2: Check Readiness Before Creating Production Plan

**Scenario**: Supervisor wants to create a production plan.

**Steps**:
1. Call `GET /api/Supervisor/my-group`
2. Check `readiness.isReady` field
3. If `false`, review `readiness.blockingIssues`
4. Complete polygon assignments for missing plots
5. Re-check readiness

**Decision Logic**:
```javascript
if (response.data.readiness.isReady) {
  // Allow: Navigate to production plan creation
  navigate(`/production-plan/create?groupId=${groupId}`);
} else {
  // Block: Show blocking issues
  showAlert("Cannot create production plan", 
    response.data.readiness.blockingIssues);
  // Direct to polygon assignment tasks
  navigate('/supervisor/polygon-tasks');
}
```

---

### Use Case 3: View Specific Season's Group

**Scenario**: Supervisor wants to review a different season's group (e.g., reviewing last season's data).

**Steps**:
1. Get list of 3 seasons: `GET /api/seasons`
   - Returns: Đông Xuân, Hè Thu, Thu Đông
2. Select season (e.g., "Hè Thu" from previous cycle)
3. Call `GET /api/Supervisor/my-group?seasonId={seasonId}`
4. View group data for that season

**Note**: Even though there are only 3 season types, groups are created per year-season cycle, so supervisor may have managed multiple "Đông Xuân" groups across different years.

---

### Use Case 4: View Group History

**Scenario**: Supervisor wants to review all past groups they have managed.

**Steps**:
1. Call `GET /api/Supervisor/my-group/history`
2. System returns summary of all past groups (excluding current season by default)
3. Sorted by most recent season first

**Result**: Supervisor sees:
- List of all historical groups
- Season information for each group
- Total plots and area for each
- Rice variety used
- Number of production plans created
- Completion status

**Filtering Options**:
```http
GET /api/Supervisor/my-group/history?year=2024
GET /api/Supervisor/my-group/history?includeCurrentSeason=true
```

---

## 🔗 Integration with Other Features

### 1. Polygon Assignment Tasks

After cluster manager imports farmers:
```
Farmer Import → Plots Created (no polygons) → Tasks Auto-Assigned to Supervisor
                                                         ↓
                                            Supervisor completes polygon tasks
                                                         ↓
                                            Plot.Boundary updated
                                                         ↓
                                    My Group readiness score increases
```

**Related Endpoints**:
- `GET /api/Supervisor/polygon-tasks` - View pending polygon assignments
- `POST /api/Supervisor/polygon-tasks/{taskId}/complete` - Complete polygon assignment

### 2. Production Plan Creation

Before creating a production plan:
```
Check Readiness → GET /api/Supervisor/my-group
                       ↓
                  readiness.isReady?
                       ↓
            Yes → Allow plan creation
                  GET /api/production-plans/draft
                       ↓
                  POST /api/production-plans
```

**Flow**:
1. Check group readiness
2. If ready, generate plan draft
3. Review and customize
4. Submit for expert approval

### 3. Group Management

Supervisors can only view, not edit group properties. Group editing is done by:
- **Cluster Manager** - Assigns supervisors, sets rice variety
- **System** - Auto-calculates total area from plots
- **Supervisor** - Only creates production plans

---

## 🎨 Frontend Implementation Guide

### Dashboard Card Component

```typescript
interface GroupDashboardProps {
  seasonId?: string;
}

function GroupDashboard({ seasonId }: GroupDashboardProps) {
  const [group, setGroup] = useState<MyGroupResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = seasonId 
      ? `/api/Supervisor/my-group?seasonId=${seasonId}`
      : '/api/Supervisor/my-group';
    
    fetch(url, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
      .then(res => res.json())
      .then(result => {
        if (result.succeeded) {
          setGroup(result.data);
        }
        setLoading(false);
      });
  }, [seasonId]);

  if (loading) return <Loading />;
  if (!group) return <NoGroupAssigned />;

  return (
    <div className="group-dashboard">
      <h1>My Group - {group.season.seasonName}</h1>
      
      {/* Readiness Card */}
      <ReadinessCard readiness={group.readiness} />
      
      {/* Group Info */}
      <GroupInfoCard group={group} />
      
      {/* Plots Table */}
      <PlotsTable 
        plots={group.plots} 
        onPolygonAssign={handlePolygonAssign}
      />
      
      {/* Map View */}
      <MapView 
        plots={group.plots.filter(p => p.hasPolygon)}
        groupArea={group.areaGeoJson}
      />
      
      {/* Action Buttons */}
      {group.readiness.isReady ? (
        <button onClick={handleCreatePlan}>
          Create Production Plan
        </button>
      ) : (
        <button onClick={handleFixIssues}>
          Fix {group.readiness.plotsWithoutPolygon} Missing Polygons
        </button>
      )}
    </div>
  );
}
```

### Readiness Indicator Component

```typescript
function ReadinessCard({ readiness }: { readiness: GroupReadinessInfo }) {
  const getColor = () => {
    if (readiness.isReady) return 'success';
    if (readiness.readinessScore >= 75) return 'warning';
    return 'error';
  };

  return (
    <Card className={`readiness-card ${getColor()}`}>
      <h3>Production Plan Readiness</h3>
      
      <CircularProgress 
        value={readiness.readinessScore} 
        color={getColor()}
      />
      
      <Badge color={getColor()}>
        {readiness.readinessLevel}
      </Badge>
      
      <div className="checks">
        <Check passed={readiness.hasRiceVariety}>Rice Variety</Check>
        <Check passed={readiness.hasTotalArea}>Total Area</Check>
        <Check passed={readiness.hasPlots}>Plots Assigned</Check>
        <Check passed={readiness.allPlotsHavePolygons}>
          All Polygons ({readiness.plotsWithPolygon}/{readiness.totalPlots})
        </Check>
      </div>
      
      {readiness.blockingIssues.length > 0 && (
        <Alert severity="error">
          <strong>Blocking Issues:</strong>
          <ul>
            {readiness.blockingIssues.map(issue => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </Alert>
      )}
    </Card>
  );
}
```

---

## 🧪 Testing Scenarios

### Test 1: New Group (No Plots)
**Expected**: 
- `readiness.isReady = false`
- `readiness.readinessScore = 25%` (1/4 checks: has variety)
- Blocking issue: "No plots assigned to this group"

### Test 2: Plots Added, No Polygons
**Expected**:
- `readiness.readinessScore = 75%` (3/4 checks)
- `readiness.readinessLevel = "Almost Ready"`
- Blocking issue: "X plot(s) missing polygon boundaries"

### Test 3: All Polygons Assigned
**Expected**:
- `readiness.isReady = true`
- `readiness.readinessScore = 100%`
- `readiness.readinessLevel = "Ready"`
- No blocking issues
- Can create production plan

---

## 📈 Performance Considerations

### Query Optimization

The handler loads multiple related entities efficiently:
```csharp
// Single query for group
var group = await repository.FindAsync(g => g.SupervisorId == id && g.SeasonId == seasonId);

// Single query for all plots
var plots = await repository.ListAsync(p => p.GroupId == groupId);

// Single query for all farmers
var farmers = await repository.ListAsync(f => farmerIds.Contains(f.Id));
```

**Result**: Only 5-6 database queries regardless of plot count.

---

## 🔐 Security

### Authorization

- **Endpoint**: `[Authorize(Roles = "Supervisor")]`
- **Data Filtering**: Only returns groups where `SupervisorId == currentUserId`
- **Season Access**: Supervisors can view any season they were assigned to

### Data Privacy

- Farmer personal data (phone, address) included for supervisor's operational needs
- No sensitive financial data exposed
- Plot boundaries (GeoJSON) included for map visualization

---

## 📝 Summary

This feature provides supervisors with a **comprehensive dashboard** for managing their group, with special emphasis on:

1. ✅ **Current Group Overview** - Complete view of current season's group with all plots
2. ✅ **Polygon Completion Status** - Know which plots need boundaries
3. ✅ **Production Plan Readiness** - Clear go/no-go decision
4. ✅ **Actionable Information** - Direct links to fix issues
5. ✅ **Season Context** - Clear which season is being managed
6. ✅ **Historical Data** - Access past groups and performance trends

### Feature Endpoints

| Endpoint | Purpose | Returns |
|----------|---------|---------|
| `GET /api/Supervisor/my-group` | Current/specific season group | Full group details with plots and readiness |
| `GET /api/Supervisor/my-group/history` | Past groups summary | List of all historical groups |

**Key Benefit**: Supervisors have complete visibility into current operations and historical performance, enabling informed decision-making and continuous improvement! 🌾

