import React, { useState } from 'react';

export const NuevaPassword: React.FC = () => {
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [passwordsDontMatch, setPasswordsDontMatch] = useState(false);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('contraseñas:', { password, repeatPassword });
    };

    const updateRepeatPassword = (repeatPassword: string) => {
        setRepeatPassword(repeatPassword);
        if (repeatPassword != password)
            setPasswordsDontMatch(true);
        else
            setPasswordsDontMatch(false);

    }

    return (
        <div>
            <h3>Nueva contraseña</h3>
            <form onSubmit={handleSubmit} className="login-form"
                style={{
                    display: "flex",
                    flexDirection: "column",
                    margin: '0 auto',
                    width: '400px',
                    padding: '10px 50px'
                }}>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <label htmlFor="repeatPassword">Repetir contraseña</label>
                    <input
                        id="repeatPassword"
                        type="password"
                        value={repeatPassword}
                        onChange={(e) => updateRepeatPassword(e.target.value)}
                        required
                    />
                </div>
                {passwordsDontMatch ? <p style={{ color: 'red' }}>Las contraseñas no coinciden</p> : null}
                <button
                    type="submit"
                    style={{ marginTop: 20 }}
                    disabled={passwordsDontMatch
                        || repeatPassword.length != password.length
                        || password.length == 0}>
                    Actualizar contraseña
                </button>
            </form>
        </div>
    );
};
