import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { ContentLayout } from '@/components/layouts';

const ApprovalsRoute = () => {
    const pendingApprovals = [
        {
            id: 1,
            type: 'Emergency Action',
            farmer: 'John Doe',
            crop: 'Rice',
            issue: 'Pest outbreak - Brown planthopper',
            submitted: '2 hours ago',
            priority: 'high',
        },
        {
            id: 2,
            type: 'Material Request',
            farmer: 'Jane Smith',
            crop: 'Wheat',
            issue: 'Fertilizer shortage',
            submitted: '5 hours ago',
            priority: 'medium',
        },
        {
            id: 3,
            type: 'Standard Plan Modification',
            farmer: 'Bob Wilson',
            crop: 'Corn',
            issue: 'Adjust planting schedule',
            submitted: '1 day ago',
            priority: 'low',
        },
    ];

    return (
        <ContentLayout title="Approvals">
            <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border bg-white p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending</p>
                                <p className="text-2xl font-bold">12</p>
                            </div>
                            <Clock className="h-8 w-8 text-yellow-500" />
                        </div>
                    </div>
                    <div className="rounded-lg border bg-white p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Approved Today</p>
                                <p className="text-2xl font-bold">8</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                    </div>
                    <div className="rounded-lg border bg-white p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Rejected Today</p>
                                <p className="text-2xl font-bold">2</p>
                            </div>
                            <XCircle className="h-8 w-8 text-red-500" />
                        </div>
                    </div>
                </div>

                {/* Pending Approvals */}
                <div className="rounded-lg border bg-white">
                    <div className="border-b p-4">
                        <h2 className="text-lg font-semibold">Pending Approvals</h2>
                    </div>
                    <div className="divide-y">
                        {pendingApprovals.map((approval) => (
                            <div key={approval.id} className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium">{approval.type}</h3>
                                            <span
                                                className={`rounded-full px-2 py-1 text-xs ${approval.priority === 'high'
                                                        ? 'bg-red-100 text-red-700'
                                                        : approval.priority === 'medium'
                                                            ? 'bg-yellow-100 text-yellow-700'
                                                            : 'bg-blue-100 text-blue-700'
                                                    }`}
                                            >
                                                {approval.priority}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm text-gray-600">
                                            <span className="font-medium">{approval.farmer}</span> - {approval.crop}
                                        </p>
                                        <p className="mt-1 text-sm text-gray-500">{approval.issue}</p>
                                        <p className="mt-1 text-xs text-gray-400">{approval.submitted}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600">
                                            Approve
                                        </button>
                                        <button className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </ContentLayout>
    );
};

export default ApprovalsRoute;
