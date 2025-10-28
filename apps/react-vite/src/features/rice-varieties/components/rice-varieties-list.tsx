import { useState } from 'react';
import { Download, FileDown, Sprout, Calendar, Plus, Settings, Edit, Trash2 } from 'lucide-react';

import { useRiceVarieties } from '../api/get-rice-varieties';
import { useDownloadRiceVarietyTemplate } from '../api/download-rice-variety-template';
import { AssociateSeasonDialog } from './associate-season-dialog';
import { ExportDialog } from './export-dialog';
import { CreateRiceVarietyDialog } from './create-rice-variety-dialog';
import { EditRiceVarietyDialog } from './edit-rice-variety-dialog';
import { DeleteRiceVarietyDialog } from './delete-rice-variety-dialog';
import { RiceVarietyWithSeasons, RiceVarietyCategory } from '@/types/api';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/form';

export const RiceVarietiesList = () => {
  const [search, setSearch] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(true);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [associateDialogOpen, setAssociateDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedVariety, setSelectedVariety] = useState<RiceVarietyWithSeasons | null>(null);

  const riceVarietiesQuery = useRiceVarieties({
    params: {
      search: debouncedSearch || undefined,
      isActive: isActiveFilter,
    },
  });

  const downloadTemplateMutation = useDownloadRiceVarietyTemplate();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    // Simple debounce
    const timer = setTimeout(() => {
      setDebouncedSearch(value);
    }, 300);
    return () => clearTimeout(timer);
  };

  const handleAssociateSeason = (variety: RiceVarietyWithSeasons) => {
    setSelectedVariety(variety);
    setAssociateDialogOpen(true);
  };

  const handleEdit = (variety: RiceVarietyWithSeasons) => {
    setSelectedVariety(variety);
    setEditDialogOpen(true);
  };

  const handleDelete = (variety: RiceVarietyWithSeasons) => {
    setSelectedVariety(variety);
    setDeleteDialogOpen(true);
  };

  const handleExport = () => {
    setExportDialogOpen(true);
  };

  const handleDownloadTemplate = () => {
    downloadTemplateMutation.mutate();
  };

  if (riceVarietiesQuery.isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const riceVarieties = riceVarietiesQuery.data || [];
  
  // Group by category
  const groupedVarieties = riceVarieties.reduce((acc, variety) => {
    if (!acc[variety.categoryName]) {
      acc[variety.categoryName] = [];
    }
    acc[variety.categoryName].push(variety);
    return acc;
  }, {} as Record<string, typeof riceVarieties>);

  // Extract unique categories for export dialog
  const categories: RiceVarietyCategory[] = riceVarieties.reduce((acc, variety) => {
    const existing = acc.find(cat => cat.id === variety.categoryId);
    if (!existing) {
      acc.push({
        id: variety.categoryId,
        name: variety.categoryName,
      });
    }
    return acc;
  }, [] as RiceVarietyCategory[]);

  return (
    <div className="space-y-4">
      {/* Search and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-1 gap-2 max-w-md">
          <Input
            type="text"
            placeholder="Search rice varieties..."
            value={search}
            onChange={handleSearchChange}
            className="flex-1"
          />
          <div className="flex gap-2">
            <Button
              variant={isActiveFilter === undefined ? 'default' : 'outline'}
              onClick={() => setIsActiveFilter(undefined)}
            >
              All
            </Button>
            <Button
              variant={isActiveFilter === true ? 'default' : 'outline'}
              onClick={() => setIsActiveFilter(true)}
            >
              Active
            </Button>
            <Button
              variant={isActiveFilter === false ? 'default' : 'outline'}
              onClick={() => setIsActiveFilter(false)}
            >
              Inactive
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="default"
            onClick={() => setCreateDialogOpen(true)}
            icon={<Plus className="h-4 w-4" />}
          >
            Create Variety
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            icon={<Download className="h-4 w-4" />}
          >
            Export
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadTemplate}
            isLoading={downloadTemplateMutation.isPending}
            icon={<FileDown className="h-4 w-4" />}
          >
            Template
          </Button>
        </div>
      </div>

      {/* Rice Varieties by Category */}
      {riceVarieties.length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedVarieties).map(([categoryName, varieties]) => (
            <div key={categoryName} className="space-y-4">
              <div className="border-b pb-2">
                <h2 className="text-lg font-semibold text-gray-900">{categoryName}</h2>
                <p className="text-sm text-gray-500">{varieties.length} varieties</p>
              </div>
              
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {varieties.map((variety) => (
                  <div
                    key={variety.id}
                    className="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-green-100 p-2">
                          <Sprout className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {variety.varietyName}
                          </h3>
                          <p className="text-sm text-gray-500">{variety.categoryName}</p>
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          variety.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {variety.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-500">Growth Duration:</span>
                        <span className="font-medium">
                          {variety.baseGrowthDurationDays} days
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Yield/Hectare:</span>
                        <span className="font-medium">
                          {variety.baseYieldPerHectare} tons
                        </span>
                      </div>
                    </div>

                    {variety.description && (
                      <p className="mt-3 line-clamp-2 text-sm text-gray-600">
                        {variety.description}
                      </p>
                    )}

                    {variety.characteristics && (
                      <div className="mt-3 rounded-md bg-gray-50 p-2">
                        <p className="line-clamp-2 text-xs text-gray-600">
                          <span className="font-medium">Characteristics: </span>
                          {variety.characteristics}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-4 flex gap-2 border-t pt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(variety)}
                        icon={<Edit className="h-3 w-3" />}
                        className="flex-1"
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(variety)}
                        icon={<Trash2 className="h-3 w-3" />}
                        className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>

                    {/* Season Association */}
                    <div className="mt-4 border-t pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500">Season Associations</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAssociateSeason(variety)}
                          icon={<Plus className="h-3 w-3" />}
                        >
                          Add Season
                        </Button>
                      </div>
                      
                      {variety.associatedSeasons && variety.associatedSeasons.length > 0 ? (
                        <div className="space-y-2">
                          {variety.associatedSeasons.map((association) => (
                            <div key={association.id} className="rounded-md bg-blue-50 p-2">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-blue-900">
                                      {association.seasonName}
                                    </span>
                                    {association.isRecommended && (
                                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                        Recommended
                                      </span>
                                    )}
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                      association.riskLevel === 0 ? 'bg-green-100 text-green-700' :
                                      association.riskLevel === 1 ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-red-100 text-red-700'
                                    }`}>
                                      {association.riskLevel === 0 ? 'Low Risk' :
                                       association.riskLevel === 1 ? 'Medium Risk' : 'High Risk'}
                                    </span>
                                  </div>
                                  <div className="mt-1 text-xs text-blue-700">
                                    <div className="grid grid-cols-2 gap-2">
                                      <span>Duration: {association.growthDurationDays} days</span>
                                      <span>Yield: {association.expectedYieldPerHectare} tons/ha</span>
                                      <span>Planting: {association.optimalPlantingStart} - {association.optimalPlantingEnd}</span>
                                      <span>Season: {association.seasonName}</span>
                                    </div>
                                    {association.seasonalNotes && (
                                      <p className="mt-1 text-gray-600 italic">
                                        "{association.seasonalNotes}"
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-2">
                          <p className="text-xs text-gray-400">No seasons associated</p>
                          <p className="text-xs text-gray-400">Click "Add Season" to create an association</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex h-48 items-center justify-center rounded-lg border border-dashed">
          <p className="text-gray-500">No rice varieties found</p>
        </div>
      )}

      {/* Dialogs */}
      <CreateRiceVarietyDialog
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />

      <EditRiceVarietyDialog
        isOpen={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        variety={selectedVariety}
      />

      <DeleteRiceVarietyDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        variety={selectedVariety}
      />

      <AssociateSeasonDialog
        isOpen={associateDialogOpen}
        onClose={() => setAssociateDialogOpen(false)}
        riceVariety={selectedVariety}
      />

      <ExportDialog
        isOpen={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        categories={categories}
      />
    </div>
  );
};

