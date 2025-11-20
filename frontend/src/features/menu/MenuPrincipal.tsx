import React from 'react';
import { useAuth } from '../../hooks';
import { useNavigate } from 'react-router';


export const MenuPrincipal: React.FC = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    if (!currentUser)
        return <h2>Nada por aquí</h2>;

    const tieneRol = (nombre_rol: string) => {
        const rolesValidos = ['admin', nombre_rol];
        return rolesValidos.includes(currentUser.role_name);
    }

    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 300, margin: '0 auto' }}>
                <button>Todos los roles ven este botón</button>
                {tieneRol('alumno') ? <button onClick={() => navigate("/encuestas")}>Encuestas alumno</button> : null}
                {tieneRol('alumno') ? <button onClick={() => navigate("/informes")}>Informes Actividad Curricular</button> : null}
                {tieneRol('secretaria_academica') ? <button onClick={() => navigate("/informes")}>Informes Sintéticos</button> : null}
                <button onClick={() => navigate("/perfil")}>Perfil</button>
                <button onClick={() => navigate("/cambiar-contraseña")}>Cambiar contraseña</button>
                <button onClick={() => logout()}>Cerrar sesión</button>

            </div>
        </>
    )
}