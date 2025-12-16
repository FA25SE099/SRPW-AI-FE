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

type CreateExpertDialogProps = {
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

export const CreateExpertDialog = ({
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
}: CreateExpertDialogProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                    Create New Agronomy Expert
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Agronomy Expert</DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="expertName">Full Name *</Label>
                        <Input
                            id="expertName"
                            value={fullName}
                            onChange={(e) => onFullNameChange(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="expertEmail">Email *</Label>
                        <Input
                            id="expertEmail"
                            type="email"
                            value={email}
                            onChange={(e) => onEmailChange(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="expertPhone">Phone Number *</Label>
                        <Input
                            id="expertPhone"
                            value={phoneNumber}
                            onChange={(e) => onPhoneNumberChange(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={isCreating}>
                        {isCreating ? 'Creating...' : 'Create Expert'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};
