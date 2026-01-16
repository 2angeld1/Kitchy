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
import { logIn } from 'ionicons/icons';
import { useLogin } from '../hooks/useLogin';

const Login: React.FC = () => {
    const {
        email,
        setEmail,
        password,
        setPassword,
        loading,
        error,
        setError,
        handleLogin
    } = useLogin();

    return (
        <IonPage className="login-page">
            <IonContent className="login-content" scrollY={false}>
                <div className="auth-full-container">
                    <div className="auth-wrapper">
                        {/* Visual Panel - Visible on Desktop */}
                        <div className="auth-visual-panel">
                            <div className="visual-content">
                                <img src="/logo.png" alt="Kitchy Logo" className="logo-large" />
                                <h1>Kitchy</h1>
                                <p>Gestión inteligente para tu negocio gastronómico.</p>
                            </div>
                        </div>

                        {/* Form Panel */}
                        <div className="auth-form-panel">
                            <div className="auth-header">
                                <img src="/logo.png" alt="Kitchy Logo" className="mobile-logo" />
                                <h2>¡Bienvenido de nuevo!</h2>
                                <p>Ingresa tus credenciales para continuar.</p>
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

                            <div className="auth-footer">
                                <p>
                                    ¿No tienes cuenta?
                                    <IonButton
                                        fill="clear"
                                        routerLink="/register"
                                        className="link-button"
                                    >
                                        Regístrate aquí
                                    </IonButton>
                                </p>
                            </div>
                        </div>
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
