import React, { useState } from 'react';
import { Link } from 'react-router';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // const { login } = useAuth(); // (Assuming your logic hook)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // login(email, password);
        console.log('Inicio de sesión:', { email, password });
    };

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
                    <label htmlFor="email">Correo Electrónico</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
