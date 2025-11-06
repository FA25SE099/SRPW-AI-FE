import { BarChart3, TrendingUp, Users, Activity, Download } from 'lucide-react';
import { ContentLayout } from '@/components/layouts';

type ReportCardProps = {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  lastGenerated: string;
};

const ReportCard = ({ title, description, icon: Icon, color, lastGenerated }: ReportCardProps) => (
  <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
    <div className="mb-4 flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div className={`rounded-lg p-2 ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
    
    <div className="mb-4 text-xs text-gray-500">
      Last generated: {lastGenerated}
    </div>

    <div className="flex gap-2">
      <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
        <Download className="h-4 w-4" />
        Download
      </button>
      <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
        View
      </button>
    </div>
  </div>
);

const AdminReportsRoute = () => {
  return (
    <ContentLayout title="Reports & Analytics">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Generate and download system reports
          </p>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Generate Custom Report
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm text-gray-600">Total Reports</p>
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">247</p>
            <p className="text-xs text-gray-500">+12 this month</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm text-gray-600">Downloads</p>
              <Download className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">1,432</p>
            <p className="text-xs text-gray-500">+56 this week</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm text-gray-600">Scheduled</p>
              <Activity className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">8</p>
            <p className="text-xs text-gray-500">Active schedules</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm text-gray-600">Storage Used</p>
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">4.2 GB</p>
            <p className="text-xs text-gray-500">of 10 GB</p>
          </div>
        </div>

        {/* System Reports */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">System Reports</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ReportCard
              title="User Activity Report"
              description="Detailed user engagement and activity metrics"
              icon={Users}
              color="bg-blue-600"
              lastGenerated="2 hours ago"
            />
            
            <ReportCard
              title="System Performance"
              description="Server health, response times, and uptime"
              icon={Activity}
              color="bg-green-600"
              lastGenerated="1 day ago"
            />
            
            <ReportCard
              title="Security Audit"
              description="Login attempts, failed authentications, and threats"
              icon={BarChart3}
              color="bg-red-600"
              lastGenerated="3 days ago"
            />
            
            <ReportCard
              title="Usage Statistics"
              description="Feature usage, popular pages, and user behavior"
              icon={TrendingUp}
              color="bg-purple-600"
              lastGenerated="1 week ago"
            />
          </div>
        </div>

        {/* Agricultural Reports */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Agricultural Reports</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ReportCard
              title="Cultivation Plans"
              description="Summary of all approved and pending plans"
              icon={BarChart3}
              color="bg-green-600"
              lastGenerated="Today"
            />
            
            <ReportCard
              title="Material Usage"
              description="Pesticides, fertilizers, and material consumption"
              icon={Activity}
              color="bg-orange-600"
              lastGenerated="Yesterday"
            />
            
            <ReportCard
              title="Rice Variety Performance"
              description="Yield data and variety comparison"
              icon={TrendingUp}
              color="bg-blue-600"
              lastGenerated="3 days ago"
            />
            
            <ReportCard
              title="Expert Approvals"
              description="Approval rates, response times, and rejections"
              icon={Users}
              color="bg-purple-600"
              lastGenerated="1 week ago"
            />
          </div>
        </div>

        {/* Scheduled Reports */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Scheduled Reports</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
              <div>
                <p className="font-medium text-gray-900">Daily System Health</p>
                <p className="text-sm text-gray-600">Generated daily at 6:00 AM</p>
              </div>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                Active
              </span>
            </div>
            
            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
              <div>
                <p className="font-medium text-gray-900">Weekly User Analytics</p>
                <p className="text-sm text-gray-600">Generated every Monday at 8:00 AM</p>
              </div>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                Active
              </span>
            </div>
            
            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
              <div>
                <p className="font-medium text-gray-900">Monthly Financial Summary</p>
                <p className="text-sm text-gray-600">Generated 1st of each month at 9:00 AM</p>
              </div>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </ContentLayout>
  );
};

export default AdminReportsRoute;

