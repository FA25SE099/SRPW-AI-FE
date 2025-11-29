import { Authorization, ROLES } from '@/lib/authorization';
import { EmergencyProtocolsList } from '@/features/emergency-protocols/components/emergency-protocols-list';

const EmergencyProtocolsRoute = () => {
    return (
        <Authorization
            forbiddenFallback={<div>Only experts can view this.</div>}
            allowedRoles={[ROLES.AgronomyExpert]}
        >
            <EmergencyProtocolsList />
        </Authorization>
    );
};

// Default export for lazy loading
export default EmergencyProtocolsRoute;