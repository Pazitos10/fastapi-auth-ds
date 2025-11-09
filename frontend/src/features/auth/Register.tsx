import { useState } from "react";
import { Link } from "react-router";

export const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    // const { login } = useAuth(); // (Assuming your logic hook)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // login(email, password);
        console.log('Creando cuenta:', { username, email, password });
    };

    return (
        <div>
            <h3>Crear nueva cuenta</h3>

            <form onSubmit={handleSubmit} className="nueva-cuenta-form"
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
                    Crear
                </button>

                <p className="auth-links">
                    <Link to="/iniciar-sesion">Ya tengo una cuenta</Link>
                </p>
            </form>
        </div>
    );
}
