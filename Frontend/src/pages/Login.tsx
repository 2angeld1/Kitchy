import React, { useState } from 'react';
import {
    IonPage,
    IonContent,
    IonInput,
    IonButton,
    IonLoading,
    IonToast,
    IonIcon
} from '@ionic/react';
import { restaurant, logIn } from 'ionicons/icons';
import { useAuth } from '../context/AuthContext';
import { useHistory } from 'react-router-dom';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const history = useHistory();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Por favor completa todos los campos');
            return;
        }

        setLoading(true);
        try {
            await login(email, password);
            history.replace('/ventas');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <IonPage>
            <IonContent className="login-content">
                <div className="login-container">
                    <div className="login-header">
                        <div className="logo-container">
                            <img src="/logo.png" alt="Kitchy Logo" className="logo-image" />
                        </div>
                        <p>Sistema de Punto de Venta</p>
                    </div>

                    <form onSubmit={handleLogin} className="login-form">
                        <IonInput
                            type="email"
                            label="Correo electrónico"
                            labelPlacement="floating"
                            value={email}
                            onIonInput={(e) => setEmail(e.detail.value || '')}
                            className="login-input"
                            fill="outline"
                        />

                        <IonInput
                            type="password"
                            label="Contraseña"
                            labelPlacement="floating"
                            value={password}
                            onIonInput={(e) => setPassword(e.detail.value || '')}
                            className="login-input"
                            fill="outline"
                        />

                        <IonButton
                            expand="block"
                            type="submit"
                            className="login-button"
                        >
                            <IonIcon icon={logIn} slot="start" />
                            Iniciar Sesión
                        </IonButton>
                    </form>

                    <div className="login-footer">
                        <IonButton
                            fill="clear"
                            routerLink="/register"
                            className="register-link"
                        >
                            ¿No tienes cuenta? Regístrate
                        </IonButton>
                    </div>
                </div>

                <IonLoading isOpen={loading} message="Iniciando sesión..." />
                <IonToast
                    isOpen={!!error}
                    message={error}
                    duration={3000}
                    color="danger"
                    onDidDismiss={() => setError('')}
                />
            </IonContent>
        </IonPage>
    );
};

export default Login;
