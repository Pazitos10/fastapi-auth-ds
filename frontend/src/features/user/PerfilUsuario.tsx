import React from 'react';
import { useAuth } from '../../hooks';

export const PerfilUsuario: React.FC = () => {
    const { currentUser, isLoading, error } = useAuth();

    if (isLoading) {
        return (
            <div>
                <p> Cargando datos para el usuario...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <p> Error buscando perfil del usuario</p>
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div>
                <p>Datos de perfil no disponibles :/ </p>
            </div>
        );
    }

    return (
        <div>
            <h2>Bienvenido {currentUser.username}!</h2>
            <p>Id: {currentUser.id}</p>
            <p>Email: {currentUser.email}</p>
            <p>Rol: {currentUser.role_name} </p>
        </div>
    );
};
