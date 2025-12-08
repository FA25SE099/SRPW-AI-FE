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

type CreateSupervisorDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    fullName: string;
    email: string;
    phoneNumber: string;
    maxFarmerCapacity: number;
    onFullNameChange: (value: string) => void;
    onEmailChange: (value: string) => void;
    onPhoneNumberChange: (value: string) => void;
    onMaxFarmerCapacityChange: (value: number) => void;
    onSubmit: (e: React.FormEvent) => void;
    isCreating: boolean;
};

export const CreateSupervisorDialog = ({
    open,
    onOpenChange,
    fullName,
    email,
    phoneNumber,
    maxFarmerCapacity,
    onFullNameChange,
    onEmailChange,
    onPhoneNumberChange,
    onMaxFarmerCapacityChange,
    onSubmit,
    isCreating,
}: CreateSupervisorDialogProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                    Create New Supervisor
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Supervisor</DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="supervisorName">Full Name *</Label>
                        <Input
                            id="supervisorName"
                            value={fullName}
                            onChange={(e) => onFullNameChange(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="supervisorEmail">Email *</Label>
                        <Input
                            id="supervisorEmail"
                            type="email"
                            value={email}
                            onChange={(e) => onEmailChange(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="supervisorPhone">Phone Number *</Label>
                        <Input
                            id="supervisorPhone"
                            value={phoneNumber}
                            onChange={(e) => onPhoneNumberChange(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="maxCapacity">Max Farmer Capacity</Label>
                        <Input
                            id="maxCapacity"
                            type="number"
                            min={1}
                            value={maxFarmerCapacity}
                            onChange={(e) => onMaxFarmerCapacityChange(parseInt(e.target.value) || 10)}
                        />
                        <p className="text-xs text-gray-500">
                            Maximum number of farmers this supervisor can manage
                        </p>
                    </div>
                    <Button type="submit" className="w-full" disabled={isCreating}>
                        {isCreating ? 'Creating...' : 'Create Supervisor'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};
