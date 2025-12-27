import { useState, useMemo } from 'react';
import {
  Settings,
  Search,
  Edit,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { useSystemSettings, useSystemSettingCategories } from '../api';
import { SystemSetting } from '../types';
import { EditSystemSettingModal } from './edit-system-setting-modal';

export const SystemSettingsList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchKey, setSearchKey] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSetting, setSelectedSetting] = useState<SystemSetting | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useMemo(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchKey);
      setCurrentPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchKey]);

  const { data: categoriesData, isLoading: categoriesLoading } =
    useSystemSettingCategories();

  const { data, isLoading, error, refetch } = useSystemSettings({
    params: {
      currentPage,
      pageSize,
      searchKey: debouncedSearch || undefined,
      category: selectedCategory || undefined,
    },
  });

  const handleEdit = (setting: SystemSetting) => {
    setSelectedSetting(setting);
    setIsEditModalOpen(true);
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
    setCurrentPage(1);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  if (isLoading && currentPage === 1) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
        <div>
          <p className="font-medium text-red-900">Failed to load system settings</p>
          <p className="text-sm text-red-700">Please try again later</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" className="ml-auto">
          Retry
        </Button>
      </div>
    );
  }

  const settings = data?.data || [];
  const totalPages = data?.totalPages || 1;
  const totalCount = data?.totalCount || 0;
  const categories = categoriesData?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="h-6 w-6" />
            System Settings
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage system-wide configuration settings
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by setting key or description..."
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            {!categoriesLoading && categories.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Filter className="h-4 w-4" />
                  Filter by Category:
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === '' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleCategoryFilter('')}
                  >
                    All
                  </Button>
                  {categories.map((category: string) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleCategoryFilter(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <p>
          Showing {settings.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} -{' '}
          {Math.min(currentPage * pageSize, totalCount)} of {totalCount} settings
        </p>
        {(debouncedSearch || selectedCategory) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchKey('');
              setSelectedCategory('');
              setCurrentPage(1);
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Settings List */}
      {settings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No settings found</p>
            <p className="text-sm text-gray-500 mt-1">
              {debouncedSearch || selectedCategory
                ? 'Try adjusting your search or filters'
                : 'System settings will appear here'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {settings.map((setting: any) => (
            <Card key={setting.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{setting.settingKey}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {setting.settingCategory}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{setting.settingDescription}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(setting)}
                    className="ml-4"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Current Value */}
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs font-medium text-blue-900 mb-1">Current Value:</p>
                    <p className="text-sm font-mono font-semibold text-blue-700">
                      {setting.settingValue}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-gray-500">Created</p>
                      <p className="font-medium text-gray-900 mt-0.5">
                        {formatDate(setting.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Last Modified</p>
                      <p className="font-medium text-gray-900 mt-0.5">
                        {formatDate(setting.lastModifiedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || isLoading}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <EditSystemSettingModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSetting(null);
        }}
        setting={selectedSetting}
      />
    </div>
  );
};

