import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router';
import { useAuth } from '../../hooks';

export const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { currentUser, isAuthenticated, isLoading, login, error } = useAuth();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        login({username, password});
    };

    // useEffect(() => {
    //     console.log({currentUser})
    // }, []);
    if (isLoading)
        return <div>Cargando datos del usuario...</div>

    if (isAuthenticated)
        return (<Navigate to="/" replace />)

    return (
        <div>
            <h3>Iniciar sesión</h3>
            <form onSubmit={handleSubmit} className="login-form"
                style={{
                    display: "flex",
                    flexDirection: "column",
                    margin: '0 auto',
                    width: '400px',
                    padding: '10px 50px'
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <label htmlFor="username">Nombre de usuario</label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <label htmlFor="password">Contraseña</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error ? <p style={{ color: 'red', fontSize: '.8em'}}>{error}</p> : null}
                <button type="submit" style={{ marginTop: 20 }}>
                    Iniciar Sesión
                </button>

                <p className="auth-links">
                    <Link to="/crear-cuenta">Crear una cuenta nueva</Link> | <Link to="/recuperar-contraseña">Olvidé mi contraseña</Link>
                </p>
            </form>
        </div>
    );
};
