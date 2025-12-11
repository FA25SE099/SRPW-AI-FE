import { useState } from 'react';
import { Users, MapPin } from 'lucide-react';

import { ContentLayout } from '@/components/layouts';
import { Spinner } from '@/components/ui/spinner';
import { Authorization, ROLES } from '@/lib/authorization';
import { useUser } from '@/lib/auth';
import { LateFarmersList, LatePlotsList } from '@/features/late-farmer-record/components';

type ActiveTab = 'farmers' | 'plots';

const LateManagementRoute = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('farmers');
    const user = useUser();
    const supervisorId = user.data?.id;

    return (
        <Authorization
            forbiddenFallback={<div>Only supervisors can view this.</div>}
            allowedRoles={[ROLES.Supervisor]}
        >
            <ContentLayout title="Late Management">
                {user.isLoading ? (
                    <div className="flex justify-center py-8">
                        <Spinner size="lg" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Description */}
                        <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <p className="text-sm text-gray-600">
                                Track and manage farmers and plots with late task submissions in your groups.
                                View detailed late records and monitor compliance.
                            </p>
                        </div>

                        {/* Tabs */}
                        <div className="border-b border-gray-200">
                            <nav className="flex gap-4">
                                <button
                                    onClick={() => setActiveTab('farmers')}
                                    className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'farmers'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <Users className="h-4 w-4" />
                                    Farmer Lateness
                                </button>
                                <button
                                    onClick={() => setActiveTab('plots')}
                                    className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'plots'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <MapPin className="h-4 w-4" />
                                    Plot Lateness
                                </button>
                            </nav>
                        </div>

                        {/* Tab Content */}
                        <div className="rounded-lg border border-gray-200 bg-white p-6">
                            {activeTab === 'farmers' && (
                                <LateFarmersList supervisorId={supervisorId} />
                            )}
                            {activeTab === 'plots' && (
                                <LatePlotsList supervisorId={supervisorId} />
                            )}
                        </div>
                    </div>
                )}
            </ContentLayout>
        </Authorization>
    );
};

export default LateManagementRoute;
