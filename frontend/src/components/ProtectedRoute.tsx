import React from 'react';
import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../hooks';

interface ProtectedRouteProps {
    allowedRoles: Array<string>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }: ProtectedRouteProps) => {
    const { currentUser } = useAuth();
    const userRole = currentUser?.role_name;

    if (userRole && userRole !== 'admin' && !allowedRoles.includes(userRole)) {
        return <Navigate to="/no-autorizado" replace />;
    }

    return <Outlet />;
};