import { Bell, Mail, Shield, Database, Globe, Clock } from 'lucide-react';
import { ContentLayout } from '@/components/layouts';

type SettingSectionProps = {
  title: string;
  description: string;
  icon: React.ElementType;
  children: React.ReactNode;
};

const SettingSection = ({ title, description, icon: Icon, children }: SettingSectionProps) => (
  <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
    <div className="mb-4 flex items-start gap-3">
      <div className="rounded-lg bg-blue-50 p-2">
        <Icon className="h-5 w-5 text-blue-600" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

type ToggleSettingProps = {
  label: string;
  description: string;
  enabled: boolean;
};

const ToggleSetting = ({ label, description, enabled }: ToggleSettingProps) => (
  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
    <div>
      <p className="font-medium text-gray-900">{label}</p>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
    <button
      className={`relative h-6 w-11 rounded-full transition-colors ${
        enabled ? 'bg-blue-600' : 'bg-gray-300'
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-0.5'
        }`}
      />
    </button>
  </div>
);

const AdminSettingsRoute = () => {
  return (
    <ContentLayout title="System Settings">
      <div className="space-y-6">
        <p className="text-sm text-gray-600">
          Configure system-wide settings and preferences
        </p>

        <SettingSection
          title="Notifications"
          description="Manage notification preferences and alerts"
          icon={Bell}
        >
          <ToggleSetting
            label="Email Notifications"
            description="Send email notifications for important events"
            enabled={true}
          />
          <ToggleSetting
            label="Push Notifications"
            description="Enable browser push notifications"
            enabled={false}
          />
          <ToggleSetting
            label="Emergency Alerts"
            description="Receive alerts for critical system events"
            enabled={true}
          />
        </SettingSection>

        <SettingSection
          title="Email Configuration"
          description="Configure email server and sending options"
          icon={Mail}
        >
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">SMTP Server</label>
              <input
                type="text"
                placeholder="smtp.example.com"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Port</label>
                <input
                  type="text"
                  placeholder="587"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">From Email</label>
                <input
                  type="email"
                  placeholder="noreply@example.com"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        </SettingSection>

        <SettingSection
          title="Security"
          description="Security and authentication settings"
          icon={Shield}
        >
          <ToggleSetting
            label="Two-Factor Authentication"
            description="Require 2FA for all users"
            enabled={false}
          />
          <ToggleSetting
            label="Password Expiration"
            description="Force password change every 90 days"
            enabled={true}
          />
          <ToggleSetting
            label="Session Timeout"
            description="Auto-logout after 30 minutes of inactivity"
            enabled={true}
          />
        </SettingSection>

        <SettingSection
          title="Database"
          description="Database and backup configuration"
          icon={Database}
        >
          <ToggleSetting
            label="Automatic Backups"
            description="Run automated backups daily at 2 AM"
            enabled={true}
          />
          <ToggleSetting
            label="Query Logging"
            description="Log all database queries for debugging"
            enabled={false}
          />
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="mb-2 font-medium text-gray-900">Last Backup</p>
            <p className="text-sm text-gray-600">Today at 2:00 AM - 2.4 GB</p>
            <button className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              Backup Now
            </button>
          </div>
        </SettingSection>

        <SettingSection
          title="Localization"
          description="Language and regional settings"
          icon={Globe}
        >
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Default Language</label>
              <select className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option>English</option>
                <option>Vietnamese</option>
                <option>Spanish</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Timezone</label>
              <select className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option>UTC+7 (Bangkok, Hanoi)</option>
                <option>UTC+0 (London)</option>
                <option>UTC-5 (New York)</option>
              </select>
            </div>
          </div>
        </SettingSection>

        <SettingSection
          title="System Maintenance"
          description="Maintenance and performance settings"
          icon={Clock}
        >
          <ToggleSetting
            label="Maintenance Mode"
            description="Put system in maintenance mode for updates"
            enabled={false}
          />
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="mb-2 font-medium text-gray-900">Cache Management</p>
            <p className="mb-3 text-sm text-gray-600">Clear system cache to improve performance</p>
            <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Clear Cache
            </button>
          </div>
        </SettingSection>

        <div className="flex justify-end gap-3">
          <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Save Changes
          </button>
        </div>
      </div>
    </ContentLayout>
  );
};

export default AdminSettingsRoute;

