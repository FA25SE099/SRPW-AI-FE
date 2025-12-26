import { Search, UserCheck, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Supervisor } from '../types';

type SupervisorSelectDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedSupervisorIds: string[];
    supervisors: Supervisor[];
    allSupervisors: Supervisor[];
    isLoading: boolean;
    search: string;
    phoneSearch: string;
    advancedSearch: string;
    page: number;
    hasNext: boolean;
    hasPrevious: boolean;
    totalPages: number;
    totalCount: number;
    onSearchChange: (value: string) => void;
    onPhoneSearchChange: (value: string) => void;
    onAdvancedSearchChange: (value: string) => void;
    onPageChange: (page: number) => void;
    onToggleSelect: (supervisor: Supervisor) => void;
    onConfirm: () => void;
    // Create supervisor props
    isCreateDialogOpen: boolean;
    onCreateDialogOpenChange: (open: boolean) => void;
    newSupervisor: {
        fullName: string;
        email: string;
        phoneNumber: string;
        maxFarmerCapacity: number;
    };
    onNewSupervisorChange: (field: string, value: string | number) => void;
    onCreateSubmit: (e: React.FormEvent) => void;
    isCreating: boolean;
};

export const SupervisorSelectDialog = ({
    open,
    onOpenChange,
    selectedSupervisorIds,
    supervisors,
    allSupervisors,
    isLoading,
    search,
    phoneSearch,
    advancedSearch,
    page,
    hasNext,
    hasPrevious,
    totalPages,
    totalCount,
    onSearchChange,
    onPhoneSearchChange,
    onAdvancedSearchChange,
    onPageChange,
    onToggleSelect,
    onConfirm,
    isCreateDialogOpen,
    onCreateDialogOpenChange,
    newSupervisor,
    onNewSupervisorChange,
    onCreateSubmit,
    isCreating,
}: SupervisorSelectDialogProps) => {
    // Get selected supervisors from allSupervisors
    const selectedSupervisors = allSupervisors.filter(s =>
        selectedSupervisorIds.includes(s.supervisorId)
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <div className="w-full space-y-2">
                    <Button type="button" variant="outline" className="w-full justify-start">
                        {selectedSupervisorIds.length > 0 ? (
                            <div className="flex items-center gap-2">
                                <UserCheck className="h-4 w-4" />
                                <span>{selectedSupervisorIds.length} supervisor(s) selected</span>
                            </div>
                        ) : (
                            'Select supervisors'
                        )}
                    </Button>
                    {selectedSupervisors.length > 0 && (
                        <div className="border rounded-md p-3 bg-gray-50 space-y-2">
                            {selectedSupervisors.map((supervisor) => (
                                <div key={supervisor.supervisorId} className="text-sm">
                                    <div className="font-medium">{supervisor.supervisorName}</div>
                                    <div className="text-gray-600">{supervisor.supervisorPhoneNumber}</div>
                                    <div className="text-gray-600">{supervisor.email}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        Select Supervisors ({selectedSupervisorIds.length} selected)
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Search Filters */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                placeholder="Search by name/email"
                                value={search}
                                onChange={(e) => {
                                    onSearchChange(e.target.value);
                                    onPageChange(1);
                                }}
                                className="pl-9"
                            />
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                placeholder="Search by phone number"
                                value={phoneSearch}
                                onChange={(e) => {
                                    onPhoneSearchChange(e.target.value);
                                    onPageChange(1);
                                }}
                                className="pl-9"
                            />
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                placeholder="Advanced search"
                                value={advancedSearch}
                                onChange={(e) => {
                                    onAdvancedSearchChange(e.target.value);
                                    onPageChange(1);
                                }}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    {/* Create New Supervisor Button */}
                    <Dialog open={isCreateDialogOpen} onOpenChange={onCreateDialogOpenChange}>
                        <DialogTrigger asChild>
                            <Button type="button" variant="outline" className="w-full">
                                Create New Supervisor
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Supervisor</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={onCreateSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="supervisorName">Full Name *</Label>
                                    <Input
                                        id="supervisorName"
                                        value={newSupervisor.fullName}
                                        onChange={(e) => onNewSupervisorChange('fullName', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="supervisorEmail">Email *</Label>
                                    <Input
                                        id="supervisorEmail"
                                        type="email"
                                        value={newSupervisor.email}
                                        onChange={(e) => onNewSupervisorChange('email', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="supervisorPhone">Phone Number *</Label>
                                    <Input
                                        id="supervisorPhone"
                                        value={newSupervisor.phoneNumber}
                                        onChange={(e) => onNewSupervisorChange('phoneNumber', e.target.value)}
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={isCreating}>
                                    {isCreating ? 'Creating...' : 'Create Supervisor'}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>

                    {/* Available Supervisors List */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">
                            Available Supervisors
                        </h3>
                        <div className="border rounded-md max-h-[300px] overflow-y-auto">
                            {isLoading ? (
                                <div className="p-4 text-center text-gray-500">Loading supervisors...</div>
                            ) : supervisors.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">No supervisors found</div>
                            ) : (
                                <div className="divide-y">
                                    {supervisors
                                        .filter((s) => !s.clusterId)
                                        .map((supervisor) => {
                                            const isSelected = selectedSupervisorIds.includes(
                                                supervisor.supervisorId
                                            );
                                            return (
                                                <button
                                                    key={supervisor.supervisorId}
                                                    type="button"
                                                    onClick={() => onToggleSelect(supervisor)}
                                                    className={`w-full p-4 hover:bg-gray-50 transition-colors flex items-center justify-between ${isSelected ? 'bg-blue-50' : ''
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <UserCheck className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                                        <div className="text-left flex-1">
                                                            <div className="font-medium">
                                                                {supervisor.supervisorName}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {supervisor.supervisorPhoneNumber}
                                                            </div>
                                                            <div className="text-sm text-gray-400">
                                                                {supervisor.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {isSelected && (
                                                        <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {supervisors.length > 0 && (
                            <div className="flex items-center justify-between text-sm border-t pt-4 mt-2">
                                <span className="text-gray-600">
                                    Page {page} of {totalPages} ({totalCount} total)
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onPageChange(Math.max(1, page - 1))}
                                        disabled={!hasPrevious}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onPageChange(page + 1)}
                                        disabled={!hasNext}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Selected Supervisors Section - Below Available List */}
                    {selectedSupervisors.length > 0 && (
                        <div className="border rounded-md p-4 bg-blue-50">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">
                                Selected Supervisors ({selectedSupervisors.length})
                            </h3>
                            <div className="space-y-2">
                                {selectedSupervisors.map((supervisor) => (
                                    <div
                                        key={supervisor.supervisorId}
                                        className="flex items-center justify-between bg-white p-3 rounded border"
                                    >
                                        <div className="flex items-center gap-3 flex-1">
                                            <UserCheck className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                            <div className="flex-1">
                                                <div className="font-medium text-sm">
                                                    {supervisor.supervisorName}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {supervisor.supervisorPhoneNumber}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {supervisor.email}
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onToggleSelect(supervisor)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Confirm Button */}
                <div className="flex justify-end gap-2 border-t pt-4">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={onConfirm}>
                        Confirm Selection
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
