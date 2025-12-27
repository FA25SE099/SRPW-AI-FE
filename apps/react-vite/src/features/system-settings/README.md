# System Settings Feature - Implementation Guide

## 📋 Overview

The System Settings feature allows administrators to view and manage system-wide configuration settings through a modern, user-friendly interface.

## 🏗️ Architecture

```
src/features/system-settings/
├── api/
│   ├── get-system-settings.ts    # Fetch paginated settings
│   ├── get-system-setting.ts     # Fetch single setting by ID
│   ├── update-system-setting.ts  # Update setting value/description
│   ├── get-categories.ts         # Fetch all categories
│   └── index.ts
├── components/
│   ├── system-settings-list.tsx         # Main list component with pagination
│   ├── edit-system-setting-modal.tsx    # Edit modal dialog
│   └── index.ts
├── types/
│   └── index.ts                  # TypeScript types
└── index.ts
```

## 🔌 API Endpoints

### 1. Get All System Settings (Paginated)
**POST** `/api/SystemSetting/get-all`

```typescript
const { data, isLoading } = useSystemSettings({
  params: {
    currentPage: 1,
    pageSize: 10,
    searchKey: 'supervisor',    // Optional
    category: 'GroupFormation'  // Optional
  }
});
```

### 2. Get System Setting by ID
**GET** `/api/SystemSetting/{id}`

```typescript
const { data } = useSystemSetting({
  id: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
});
```

### 3. Update System Setting
**PUT** `/api/SystemSetting/{id}`

```typescript
const updateMutation = useUpdateSystemSetting();

await updateMutation.mutateAsync({
  id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  data: {
    settingValue: '150',
    settingDescription: 'Updated description'
  }
});
```

### 4. Get All Categories
**GET** `/api/SystemSetting/categories`

```typescript
const { data: categoriesData } = useSystemSettingCategories();
// Returns: { data: ['GroupFormation', 'MaterialDistribution'] }
```

## 🎨 Components

### SystemSettingsList

Main component that displays all system settings with:
- **Search**: Real-time search by key or description
- **Category Filter**: Filter settings by category
- **Pagination**: Navigate through pages of settings
- **Edit Action**: Click to edit any setting

```typescript
import { SystemSettingsList } from '@/features/system-settings';

<SystemSettingsList />
```

### EditSystemSettingModal

Modal dialog for editing a system setting:
- Read-only fields: Key, Category
- Editable fields: Value, Description
- Displays creation and modification timestamps
- Form validation and error handling

```typescript
<EditSystemSettingModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  setting={selectedSetting}
/>
```

## 📊 Types

```typescript
interface SystemSetting {
  id: string;
  settingKey: string;
  settingValue: string;
  settingCategory: string;
  settingDescription: string;
  createdAt: string;
  lastModifiedAt: string | null;
}

interface GetSystemSettingsParams {
  currentPage: number;
  pageSize: number;
  searchKey?: string;
  category?: string;
}

interface UpdateSystemSettingRequest {
  settingValue: string;
  settingDescription?: string;
}
```

## 🎯 Features

### ✅ Implemented

1. **Pagination**
   - Navigate through multiple pages
   - Configurable page size
   - Shows total count and current range

2. **Search**
   - Real-time search with debouncing
   - Searches in key and description
   - Auto-resets to page 1 on search

3. **Category Filtering**
   - Filter by specific category
   - "All" option to clear filter
   - Dynamic category list from API

4. **Edit Functionality**
   - Edit setting value
   - Edit setting description
   - Cannot edit key or category
   - Shows metadata (created/modified dates)

5. **Responsive Design**
   - Mobile-friendly layout
   - Card-based UI
   - Clear visual hierarchy

6. **Error Handling**
   - Loading states
   - Error messages with retry
   - Form validation

7. **Authorization**
   - Admin-only access
   - Protected route

## 🚀 Usage in Admin Panel

The SystemSettings feature is integrated into the admin dashboard:

### Route
`/app/admin/settings`

### Navigation
Available in the admin sidebar as "System Settings"

### Code
```typescript
// src/app/routes/app/admin/settings.tsx
import { SystemSettingsList } from '@/features/system-settings';

const AdminSettingsRoute = () => {
  return (
    <Authorization allowedRoles={[ROLES.Admin]}>
      <ContentLayout title="System Settings">
        <SystemSettingsList />
      </ContentLayout>
    </Authorization>
  );
};
```

## 📝 Example Settings

### GroupFormation Category
- `SupervisorMaxAreaCapacity`: Maximum area a supervisor can manage
- `DefaultProximityThreshold`: Default proximity for group formation

### MaterialDistribution Category
- Distribution timing settings
- Confirmation deadline settings
- Notification preferences

## 🎬 User Flow

1. **View Settings**
   - Admin navigates to System Settings
   - Sees paginated list of all settings
   - Can search and filter

2. **Edit Setting**
   - Clicks "Edit" button on a setting
   - Modal opens with current values
   - Modifies value and/or description
   - Saves changes

3. **Search & Filter**
   - Types in search box (debounced)
   - Clicks category filter buttons
   - Results update automatically
   - Can clear filters

## 🔒 Security

- **Authorization**: Only Admin role can access
- **Read-Only Fields**: Key and Category cannot be modified
- **Validation**: Required fields enforced
- **Error Handling**: Proper error messages for failed operations

## 🎨 UI/UX Features

- **Visual Feedback**
  - Loading spinners
  - Success/error notifications
  - Disabled states during operations
  
- **Accessibility**
  - Keyboard navigation
  - Screen reader friendly
  - Proper ARIA labels

- **Responsive**
  - Works on mobile and desktop
  - Touch-friendly buttons
  - Adaptive layouts

## 🔧 Customization

### Change Page Size
```typescript
// In system-settings-list.tsx
const [pageSize] = useState(20); // Default is 10
```

### Add Custom Validation
```typescript
// In edit-system-setting-modal.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Add custom validation
  if (settingValue.length < 1) {
    addNotification({ type: 'error', message: 'Value too short' });
    return;
  }
  
  // ... rest of submit logic
};
```

## 📦 Dependencies

- `@tanstack/react-query`: Data fetching and caching
- `lucide-react`: Icons
- `date-fns`: Date formatting (if needed)
- Custom UI components: Dialog, Button, Input, Card, etc.

## 🐛 Troubleshooting

### Settings not loading
- Check API endpoint URL
- Verify authentication token
- Check network console for errors

### Edit not working
- Verify admin permissions
- Check PUT endpoint permissions
- Verify request payload structure

### Search not working
- Ensure debounce is working
- Check API search parameter name
- Verify backend search implementation

## 📚 Related Documentation

- Backend API: See `BACKEND_API_REQUIREMENTS.txt`
- Material Distribution: `/features/material-distribution`
- Admin Routes: `/app/routes/app/admin`

## ✨ Future Enhancements

- [ ] Bulk edit multiple settings
- [ ] Setting value type validation (number, string, boolean, etc.)
- [ ] Setting history/audit log
- [ ] Import/Export settings
- [ ] Setting templates
- [ ] Advanced search with multiple filters
- [ ] Setting groups/sections
- [ ] Default value restoration

## 📞 Support

For issues or questions:
1. Check console for errors
2. Verify API responses in Network tab
3. Review backend logs
4. Check authorization/permissions

