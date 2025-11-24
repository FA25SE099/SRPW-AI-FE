import { ContentLayout } from '@/components/layouts';
import { Authorization, ROLES } from '@/lib/authorization';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Search, AlertTriangle, ShieldAlert, Bug, Cloud, Edit } from 'lucide-react';
import { CreateEmergencyProtocolDialog } from '@/features/emergency-protocols/components/create-emergency-protocol-dialog';
import { useEmergencyProtocols, type EmergencyProtocol } from '@/features/emergency-protocols/api/get-emergency-protocols';
import { useCategories } from '@/features/rice-varieties/api/get-categories';
import { Spinner } from '@/components/ui/spinner';

export default function EmergencyProtocolsRoute() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingProtocol, setEditingProtocol] = useState<EmergencyProtocol | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isActive, setIsActive] = useState(true);

    const categoriesQuery = useCategories();
    const protocolsQuery = useEmergencyProtocols({
        params: {
            currentPage,
            pageSize: 10,
            categoryId: selectedCategory || null,
            searchTerm: searchQuery,
            isActive,
        },
    });

    const categories = categoriesQuery.data || [];
    const protocols = protocolsQuery.data?.data || [];
    const totalCount = protocolsQuery.data?.totalCount || 0;

    return (
        <Authorization allowedRoles={[ROLES.AgronomyExpert]}>
            <ContentLayout title="Emergency Protocols">
                <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Emergency Protocols</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Manage emergency response protocols for pest and weather incidents
                            </p>
                        </div>
                        <Button
                            onClick={() => setIsCreateDialogOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Create Protocol
                        </Button>
                    </div>

                    {/* Search and Filter Bar */}
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search protocols..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={categoriesQuery.isLoading}
                        >
                            <option value="">All Categories</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.categoryName}
                                </option>
                            ))}
                        </select>
                        <select
                            value={isActive ? 'true' : 'false'}
                            onChange={(e) => setIsActive(e.target.value === 'true')}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="rounded-lg border bg-white p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-orange-100">
                                    <Bug className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Total Protocols</p>
                                    <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border bg-white p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-100">
                                    <Cloud className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Total Tasks</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {protocols.reduce((sum, p) => sum + p.totalTasks, 0)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border bg-white p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-green-100">
                                    <ShieldAlert className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Active Protocols</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {protocols.filter(p => p.isActive).length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Protocols List */}
                    {protocolsQuery.isLoading ? (
                        <div className="flex items-center justify-center py-12 bg-white rounded-lg border">
                            <Spinner size="lg" />
                        </div>
                    ) : protocols.length === 0 ? (
                        <div className="rounded-lg border border-gray-200 bg-white">
                            <div className="p-8 text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                                    <AlertTriangle className="h-8 w-8 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-1">
                                    No Emergency Protocols Found
                                </h3>
                                <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">
                                    {searchQuery || selectedCategory
                                        ? 'Try adjusting your filters to find protocols.'
                                        : 'Create your first emergency protocol to prepare for pest outbreaks, weather events, and other agricultural emergencies.'}
                                </p>
                                <Button
                                    onClick={() => setIsCreateDialogOpen(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create First Protocol
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {protocols.map((protocol) => (
                                    <div
                                        key={protocol.id}
                                        className="rounded-lg border bg-white p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-semibold text-gray-900 flex-1">{protocol.name}</h3>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setEditingProtocol(protocol)}
                                                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                                                    title="Edit protocol"
                                                >
                                                    <Edit className="h-4 w-4 text-gray-600" />
                                                </button>
                                                <span
                                                    className={`px-2 py-1 text-xs rounded ${protocol.isActive
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-700'
                                                        }`}
                                                >
                                                    {protocol.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-3">{protocol.description}</p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                                {protocol.categoryName}
                                            </span>
                                            <span>{protocol.totalDuration} days</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-gray-600 border-t pt-3">
                                            <span>{protocol.totalStages} stages</span>
                                            <span>•</span>
                                            <span>{protocol.totalTasks} tasks</span>
                                            <span>•</span>
                                            <span>{protocol.totalThresholds} thresholds</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {protocolsQuery.data && protocolsQuery.data.totalPages > 1 && (
                                <div className="flex items-center justify-between bg-white rounded-lg border p-4">
                                    <p className="text-sm text-gray-600">
                                        Page {currentPage} of {protocolsQuery.data.totalPages} ({totalCount} total)
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
                        </>
                    )}
                </div>

                {/* Create/Edit Dialog */}
                <CreateEmergencyProtocolDialog
                    isOpen={isCreateDialogOpen || !!editingProtocol}
                    onClose={() => {
                        setIsCreateDialogOpen(false);
                        setEditingProtocol(null);
                    }}
                    protocol={editingProtocol}
                />
            </ContentLayout>
        </Authorization>
    );
}