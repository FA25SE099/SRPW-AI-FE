import { useState } from 'react';
import { useEmergencyProtocols } from '../api/get-emergency-protocols';
import { useCategories } from '@/features/rice-varieties/api/get-categories';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';

export const EmergencyProtocolsList = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isActive, setIsActive] = useState<boolean>(true);

    const categoriesQuery = useCategories();
    const protocolsQuery = useEmergencyProtocols({
        params: {
            currentPage,
            pageSize,
            categoryId,
            searchTerm,
            isActive,
        },
    });

    const categories = categoriesQuery.data || [];
    const protocols = protocolsQuery.data?.data || [];

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search protocols..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <select
                    value={categoryId || ''}
                    onChange={(e) => setCategoryId(e.target.value || null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>

                <Button icon={<Plus className="h-4 w-4" />}>
                    Create Protocol
                </Button>
            </div>

            {/* Content */}
            {protocolsQuery.isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Spinner size="lg" />
                </div>
            ) : protocols.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No emergency protocols found</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {protocols.map((protocol) => (
                            <div key={protocol.id} className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                                <h3 className="font-semibold text-gray-900">{protocol.name}</h3>
                                <p className="text-sm text-gray-600 mt-1">{protocol.description}</p>
                                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                        {protocol.categoryName}
                                    </span>
                                    <span>{protocol.totalDuration} days</span>
                                    <span>•</span>
                                    <span>{protocol.totalStages} stages</span>
                                    <span>•</span>
                                    <span>{protocol.totalTasks} tasks</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
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
                </>
            )}
        </div>
    );
};