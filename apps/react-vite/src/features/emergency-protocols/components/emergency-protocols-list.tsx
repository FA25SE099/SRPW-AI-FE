import { useState } from 'react';
import { ContentLayout } from '@/components/layouts';
import { Button } from '@/components/ui/button';
import { Plus, Search, Edit, Eye, Calendar, Activity } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useEmergencyProtocols } from '../api/get-emergency-protocols';
import { CreateEmergencyProtocolDialog } from './create-emergency-protocol-dialog';
import { ProtocolsManagementTabs } from './protocols-management-tabs';
import { EmergencyProtocolDetailDialog } from './emergency-protocol-detail-dialog';

type ActiveTab = 'emergency' | 'protocols';

export const EmergencyProtocolsList = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('emergency');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingProtocol, setEditingProtocol] = useState<any>(null);
    const [detailProtocol, setDetailProtocol] = useState<any>(null);

    const pageSize = 10;

    const protocolsQuery = useEmergencyProtocols({
        params: { currentPage, pageSize, searchTerm: searchTerm },
    });

    const protocols = protocolsQuery.data?.data || [];

    return (
        <ContentLayout title="Emergency Center">
            <div className="space-y-6">
                {/* Main Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('emergency')}
                            className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'emergency'
                                ? 'border-green-500 text-green-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Emergency Protocols
                        </button>
                        <button
                            onClick={() => setActiveTab('protocols')}
                            className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'protocols'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Protocols Management
                        </button>
                    </nav>
                </div>

                {/* Emergency Protocols Tab */}
                {activeTab === 'emergency' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search emergency protocols..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Button onClick={() => setIsCreateOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Emergency Protocol
                            </Button>
                        </div>

                        {protocolsQuery.isLoading ? (
                            <div className="p-8 text-center">
                                <Spinner size="lg" />
                            </div>
                        ) : protocols.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 bg-white rounded-lg border">
                                No emergency protocols found
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {protocols.map((protocol: any) => (
                                    <div
                                        key={protocol.id}
                                        className="bg-white rounded-lg border hover:shadow-lg transition-shadow p-6 space-y-4"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg text-gray-900 mb-1">
                                                    {protocol.planName}
                                                </h3>
                                                <p className="text-sm text-gray-500">{protocol.categoryName}</p>
                                            </div>
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${protocol.isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                    }`}
                                            >
                                                {protocol.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-600 line-clamp-2">
                                            {protocol.description || 'No description available'}
                                        </p>

                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                <span>{protocol.totalDurationDays} days</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Activity className="h-4 w-4" />
                                                <span>{protocol.totalStages || 0} stages</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 pt-2 border-t">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => setDetailProtocol(protocol)}
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                Detail
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => {
                                                    setEditingProtocol(protocol);
                                                    setIsCreateOpen(true);
                                                }}
                                            >
                                                <Edit className="h-4 w-4 mr-1" />
                                                Edit
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {protocolsQuery.data && protocolsQuery.data.totalPages > 1 && (
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-600">
                                    Page {currentPage} of {protocolsQuery.data.totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={!protocolsQuery.data.hasPrevious}
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={!protocolsQuery.data.hasNext}
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Protocols Management Tab (Pest & Weather) */}
                {activeTab === 'protocols' && <ProtocolsManagementTabs />}
            </div>

            {/* Create/Edit Dialog */}
            <CreateEmergencyProtocolDialog
                isOpen={isCreateOpen}
                onClose={() => {
                    setIsCreateOpen(false);
                    setEditingProtocol(null);
                }}
                protocol={editingProtocol}
            />

            {/* Detail Dialog */}
            <EmergencyProtocolDetailDialog
                isOpen={!!detailProtocol}
                onClose={() => setDetailProtocol(null)}
                protocolId={detailProtocol?.id}
            />
        </ContentLayout>
    );
};