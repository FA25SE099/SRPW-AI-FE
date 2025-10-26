import { AlertTriangle, Clock, MapPin } from 'lucide-react';
import { ContentLayout } from '@/components/layouts';

const EmergencyRoute = () => {
    const emergencies = [
        {
            id: 1,
            title: 'Severe Pest Outbreak',
            farmer: 'John Doe',
            location: 'Field A-12, Cluster 3',
            crop: 'Rice',
            severity: 'critical',
            description: 'Brown planthopper infestation affecting 20 hectares',
            reported: '30 minutes ago',
            status: 'open',
        },
        {
            id: 2,
            title: 'Disease Detected',
            farmer: 'Jane Smith',
            location: 'Field B-8, Cluster 2',
            crop: 'Wheat',
            severity: 'high',
            description: 'Possible wheat rust infection spreading rapidly',
            reported: '2 hours ago',
            status: 'investigating',
        },
        {
            id: 3,
            title: 'Irrigation System Failure',
            farmer: 'Bob Wilson',
            location: 'Field C-5, Cluster 1',
            crop: 'Corn',
            severity: 'medium',
            description: 'Main pump malfunction affecting water supply',
            reported: '4 hours ago',
            status: 'resolved',
        },
    ];

    return (
        <ContentLayout title="Emergency Actions">
            <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border bg-white p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Emergencies</p>
                                <p className="text-2xl font-bold">5</p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-red-500" />
                        </div>
                    </div>
                    <div className="rounded-lg border bg-white p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                                <p className="text-2xl font-bold">45m</p>
                            </div>
                            <Clock className="h-8 w-8 text-blue-500" />
                        </div>
                    </div>
                    <div className="rounded-lg border bg-white p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Resolved Today</p>
                                <p className="text-2xl font-bold">12</p>
                            </div>
                            <MapPin className="h-8 w-8 text-green-500" />
                        </div>
                    </div>
                </div>

                {/* Emergency List */}
                <div className="space-y-4">
                    {emergencies.map((emergency) => (
                        <div
                            key={emergency.id}
                            className={`rounded-lg border p-4 ${emergency.severity === 'critical'
                                    ? 'border-red-300 bg-red-50'
                                    : emergency.severity === 'high'
                                        ? 'border-orange-300 bg-orange-50'
                                        : 'border-yellow-300 bg-yellow-50'
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle
                                            className={`h-5 w-5 ${emergency.severity === 'critical'
                                                    ? 'text-red-600'
                                                    : emergency.severity === 'high'
                                                        ? 'text-orange-600'
                                                        : 'text-yellow-600'
                                                }`}
                                        />
                                        <h3 className="text-lg font-semibold">{emergency.title}</h3>
                                        <span
                                            className={`rounded-full px-2 py-1 text-xs font-medium ${emergency.status === 'open'
                                                    ? 'bg-red-100 text-red-700'
                                                    : emergency.status === 'investigating'
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-green-100 text-green-700'
                                                }`}
                                        >
                                            {emergency.status}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm">
                                        <span className="font-medium">{emergency.farmer}</span> - {emergency.crop}
                                    </p>
                                    <div className="mt-1 flex items-center gap-1 text-sm text-gray-600">
                                        <MapPin className="h-4 w-4" />
                                        <span>{emergency.location}</span>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-700">{emergency.description}</p>
                                    <p className="mt-2 text-xs text-gray-500">Reported: {emergency.reported}</p>
                                </div>
                                <button className="ml-4 rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600">
                                    Take Action
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </ContentLayout>
    );
};

export default EmergencyRoute;
