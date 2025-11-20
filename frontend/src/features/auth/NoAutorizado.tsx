import React from 'react';
import { useNavigate } from 'react-router';


export const NoAutorizado: React.FC = () => {
    const navigate = useNavigate();
    const goBack = () => { window.history.length > 2 ? navigate(-1) : navigate("/", { replace: true }); }

    return <>
        <h3>El sitio que buscás no existe o no tenés permisos para acceder a el.
            <br />
            <button onClick={goBack}>Volver atrás.</button>
        </h3>
    </>;
}