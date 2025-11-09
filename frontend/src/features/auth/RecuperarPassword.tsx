import { useState } from "react";
import { Link } from "react-router";

export const RecuperarPassword = () => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // login(email, password);
        console.log('Pidiendo link de recuperacion de contraseña:', { email });
    };

    return (
        <div>
            <h3>Recuperar Contraseña</h3>
            <p>Te enviaremos un enlace para que recuperes tu contraseña.</p>
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

                <button type="submit" style={{marginTop: 20}}>
                    Enviar
                </button>

                <p className="auth-links">
                    <Link to="/iniciar-sesion">Volver a inicio</Link>
                </p>
            </form>
        </div>
    );
}