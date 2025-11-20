import React from 'react';
import { useAuth } from '../../hooks';

export const Encuestas: React.FC = () => {
    const { isLoading } = useAuth();

    if (isLoading) {
        return <div>Cargando...</div>
    }


    return (
        <div>
            <h2>Encuestas</h2>
        </div>
    );
};
