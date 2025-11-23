import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../hooks";

export const ResetPassword = () => {
    const { currentUser, resetPassword, error, setError } = useAuth();
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordError, setNewPasswordError] = useState<string | null>();
    const [newPasswordRepeat, setNewPasswordRepeat] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await resetPassword({ current_password: currentPassword, new_password: newPassword });
        if (success)
            navigate("/", { replace: true });
    };

    const checkPasswordsMatch = (value: string) => {
        //setNewPasswordRepeat(value);
        //console.log(newPassword, newPasswordRepeat, newPasswordRepeat === newPassword)
        if (value !== newPassword)
            setNewPasswordError("Las contraseñas no coinciden");
        else {
            setNewPasswordError(null);
        }
    }

    return (
        <div>
            <h3>Cambiar contraseña de {currentUser?.username}</h3>
            <form onSubmit={handleSubmit} className="login-form"
                style={{
                    display: "flex",
                    flexDirection: "column",
                    margin: '0 auto',
                    width: '400px',
                    padding: '10px 50px'
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <label htmlFor="newPassword">Contraseña actual</label>
                    <input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => {setError(null); setCurrentPassword(e.target.value)}}
                        required
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <label htmlFor="newPassword">Nueva contraseña</label>
                    <input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <label htmlFor="newPasswordRepeat">Repetir nueva contraseña</label>
                    <input
                        id="newPasswordRepeat"
                        type="password"
                        onChange={(e) => checkPasswordsMatch(e.target.value)}
                        required
                    />
                </div>
                {newPasswordError ? <p style={{ color: 'red' }}>{newPasswordError}</p> : null}
                {error ? <p style={{ color: 'red' }}>{error}</p> : null}
                <button type="submit" style={{ marginTop: 20 }}>
                    Enviar
                </button>

                <p className="auth-links">
                    <Link to="/iniciar-sesion">Volver a inicio</Link>
                </p>
            </form>
        </div>
    );
}