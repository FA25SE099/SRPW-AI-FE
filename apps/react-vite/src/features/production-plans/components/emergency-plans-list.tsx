import { useState } from 'react';
import { AlertTriangle, Calendar, FileText, MapPin, Search, Users } from 'lucide-react';
import { useEmergencyPlans } from '../api/get-emergency-plans';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/utils/format';
import { EmergencyPlanListItem } from '../types';

type EmergencyPlansListProps = {
    onViewPlan: (planId: string) => void;
    onSolveEmergency: (planId: string, planName: string) => void;
};

export const EmergencyPlansList = ({ onViewPlan, onSolveEmergency }: EmergencyPlansListProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const emergencyPlansQuery = useEmergencyPlans({
        params: {
            currentPage,
            pageSize,
            searchTerm: searchTerm || undefined,
        },
    });

    const plans = (emergencyPlansQuery.data?.data || []) as EmergencyPlanListItem[];
    const totalPages = emergencyPlansQuery.data?.totalPages || 1;

    if (emergencyPlansQuery.isLoading) {
        return (
            <div className="flex h-48 items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg border bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Emergency Plans</p>
                            <p className="text-2xl font-bold text-red-600">{emergencyPlansQuery.data?.totalCount || 0}</p>
                        </div>
                        <AlertTriangle className="h-8 w-8 text-red-500" />
                    </div>
                </div>
                <div className="rounded-lg border bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Area Affected</p>
                            <p className="text-2xl font-bold text-orange-600">
                                {plans.reduce((sum: number, plan) => {
                                    const area = parseFloat(plan.groupArea.replace(' ha', '')) || 0;
                                    return sum + area;
                                }, 0).toFixed(2)} ha
                            </p>
                        </div>
                        <MapPin className="h-8 w-8 text-orange-500" />
                    </div>
                </div>
                <div className="rounded-lg border bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Requires Action</p>
                            <p className="text-2xl font-bold text-yellow-600">{plans.length}</p>
                        </div>
                        <Users className="h-8 w-8 text-yellow-500" />
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search emergency plans..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                </div>
            </div>

            {/* Plans List */}
            <div className="space-y-3">
                {plans.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                        <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">No emergency plans found</p>
                    </div>
                ) : (
                    plans.map((plan) => (
                        <div
                            key={plan.id}
                            className="rounded-lg border-2 border-red-200 bg-red-50 p-4 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertTriangle className="h-5 w-5 text-red-600" />
                                        <h3 className="text-lg font-semibold text-gray-900">{plan.planName}</h3>
                                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                                            {plan.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                        <div className="flex items-center gap-1.5 text-gray-600">
                                            <MapPin className="h-4 w-4" />
                                            <span>Area: <span className="font-medium text-gray-900">{plan.groupArea}</span></span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-gray-600">
                                            <Calendar className="h-4 w-4" />
                                            <span>Planting: <span className="font-medium text-gray-900">{formatDate(plan.basePlantingDate)}</span></span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-gray-600">
                                            <Users className="h-4 w-4" />
                                            <span>Submitted by: <span className="font-medium text-gray-900">{plan.submitterName}</span></span>
                                        </div>
                                        {plan.submittedAt && (
                                            <div className="flex items-center gap-1.5 text-gray-600">
                                                <FileText className="h-4 w-4" />
                                                <span>Submitted: <span className="font-medium text-gray-900">{formatDate(plan.submittedAt)}</span></span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 ml-4">
                                    <Button
                                        onClick={() => onSolveEmergency(plan.id, plan.planName)}
                                        variant="default"
                                        size="sm"
                                        className="bg-red-600 hover:bg-red-700 text-white whitespace-nowrap"
                                    >
                                        <AlertTriangle className="h-4 w-4 mr-1" />
                                        Solve Emergency
                                    </Button>
                                    <Button
                                        onClick={() => onViewPlan(plan.id)}
                                        variant="outline"
                                        size="sm"
                                        className="whitespace-nowrap"
                                    >
                                        View Details
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-4">
                    <p className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            variant="outline"
                            size="sm"
                        >
                            Previous
                        </Button>
                        <Button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            variant="outline"
                            size="sm"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};