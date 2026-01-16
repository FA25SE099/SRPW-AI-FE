import { Authorization, ROLES } from '@/lib/authorization';
import { EmergencyProtocolsList } from '@/features/emergency-protocols/components/emergency-protocols-list';

const EmergencyProtocolsRoute = () => {
    return (
        <Authorization
            forbiddenFallback={<div>Chỉ chuyên gia mới có thể xem trang này.</div>}
            allowedRoles={[ROLES.AgronomyExpert]}
        >
            <EmergencyProtocolsList />
        </Authorization>
    );
};

// Default export for lazy loading
export default EmergencyProtocolsRoute;