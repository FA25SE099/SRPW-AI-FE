import { Search, UserCheck, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { AgronomyExpert } from '../types'; type ExpertSelectDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedExpertId: string;
    selectedExpertName: string;
    experts: AgronomyExpert[];
    isLoading: boolean;
    search: string;
    phoneSearch: string;
    freeOrAssigned: boolean | null;
    page: number;
    hasNext: boolean;
    hasPrevious: boolean;
    totalPages: number;
    totalCount: number;
    onSearchChange: (value: string) => void;
    onPhoneSearchChange: (value: string) => void;
    onFilterChange: (filter: boolean | null) => void;
    onPageChange: (page: number) => void;
    onSelect: (expert: AgronomyExpert) => void;
};

export const ExpertSelectDialog = ({
    open,
    onOpenChange,
    selectedExpertId,
    selectedExpertName,
    experts,
    isLoading,
    search,
    phoneSearch,
    freeOrAssigned,
    page,
    hasNext,
    hasPrevious,
    totalPages,
    totalCount,
    onSearchChange,
    onPhoneSearchChange,
    onFilterChange,
    onPageChange,
    onSelect,
}: ExpertSelectDialogProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button type="button" variant="outline" className="w-full justify-start">
                    {selectedExpertId ? (
                        <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4" />
                            <span>{selectedExpertName}</span>
                        </div>
                    ) : (
                        'Select an agronomy expert'
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Select Agronomy Expert</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
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
                    </div>

                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant={freeOrAssigned === null ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                                onFilterChange(null);
                                onPageChange(1);
                            }}
                        >
                            All
                        </Button>
                        <Button
                            type="button"
                            variant={freeOrAssigned === true ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                                onFilterChange(true);
                                onPageChange(1);
                            }}
                        >
                            Free
                        </Button>
                        <Button
                            type="button"
                            variant={freeOrAssigned === false ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                                onFilterChange(false);
                                onPageChange(1);
                            }}
                        >
                            Assigned
                        </Button>
                    </div>
                </div>

                <div className="border rounded-md max-h-[400px] overflow-y-auto">
                    {isLoading ? (
                        <div className="p-4 text-center text-gray-500">Loading experts...</div>
                    ) : experts.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">No experts found</div>
                    ) : (
                        <div className="divide-y">
                            {experts.map((expert) => (
                                <button
                                    key={expert.expertId}
                                    type="button"
                                    onClick={() => onSelect(expert)}
                                    className="w-full p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <UserCheck className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                        <div className="text-left flex-1">
                                            <div className="font-medium">{expert.expertName}</div>
                                            <div className="text-sm text-gray-500">{expert.expertPhoneNumber}</div>
                                            <div className="text-sm text-gray-400">{expert.email}</div>
                                        </div>
                                    </div>
                                    {selectedExpertId === expert.expertId && (
                                        <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {experts.length > 0 && (
                    <div className="flex items-center justify-between text-sm border-t pt-4">
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
            </DialogContent>
        </Dialog>
    );
};
