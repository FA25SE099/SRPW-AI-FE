import { Navigate, Route, Routes } from 'react-router-dom';
import { EmergencyProtocolsList } from '@/features/emergency-protocols/components/emergency-protocols-list';

export const EmergencyProtocolsRoutes = () => {
    return (
        <Routes>
            <Route path="" element={<EmergencyProtocolsList />} />
            <Route path="*" element={<Navigate to="." />} />
        </Routes>
    );
};