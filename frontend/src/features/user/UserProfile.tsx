import React from 'react';
import { useUser } from '../../hooks/useUser';
import type { UserProfileProps } from '../../types/UserTypes';

const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
    const { user, isLoading, error } = useUser(userId);

    if (isLoading) {
        return (
            <div>
                <p> Cargando datos para el usuario con id {userId}...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <p> Error buscando perfil del usuario {error}</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div>
                <p>Datos de perfil no disponibles :/ </p>
            </div>
        );
    }

    return (
        <div>
            <h2>Bienvenido {user.username}!</h2>
            <p>Id: {user.id}</p>
            <p>Email: {user.email}</p>
        </div>
    );
};

export default UserProfile;