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

type CreateManagerDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    fullName: string;
    email: string;
    phoneNumber: string;
    onFullNameChange: (value: string) => void;
    onEmailChange: (value: string) => void;
    onPhoneNumberChange: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    isCreating: boolean;
};

export const CreateManagerDialog = ({
    open,
    onOpenChange,
    fullName,
    email,
    phoneNumber,
    onFullNameChange,
    onEmailChange,
    onPhoneNumberChange,
    onSubmit,
    isCreating,
}: CreateManagerDialogProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                    Create New Cluster Manager
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Cluster Manager</DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="managerName">Full Name *</Label>
                        <Input
                            id="managerName"
                            value={fullName}
                            onChange={(e) => onFullNameChange(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="managerEmail">Email *</Label>
                        <Input
                            id="managerEmail"
                            type="email"
                            value={email}
                            onChange={(e) => onEmailChange(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="managerPhone">Phone Number *</Label>
                        <Input
                            id="managerPhone"
                            value={phoneNumber}
                            onChange={(e) => onPhoneNumberChange(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={isCreating}>
                        {isCreating ? 'Creating...' : 'Create Manager'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};
