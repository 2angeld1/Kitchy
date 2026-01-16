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
import { personAdd } from 'ionicons/icons';
import { useRegister } from '../hooks/useRegister';

const Register: React.FC = () => {
    const {
        nombre,
        setNombre,
        email,
        setEmail,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        loading,
        error,
        setError,
        handleRegister
    } = useRegister();

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
                                <p>Únete a la plataforma líder en gestión de restaurantes.</p>
                            </div>
                        </div>

                        {/* Form Panel */}
                        <div className="auth-form-panel">
                            <div className="auth-header">
                                <img src="/logo.png" alt="Kitchy Logo" className="mobile-logo" />
                                <h2>Crear cuenta</h2>
                                <p>Comienza a gestionar tu negocio hoy mismo.</p>
                            </div>

                            <form onSubmit={handleRegister} className="login-form">
                                <IonInput
                                    type="text"
                                    label="Nombre completo"
                                    labelPlacement="floating"
                                    value={nombre}
                                    onIonInput={(e) => setNombre(e.detail.value || '')}
                                    className="login-input"
                                    fill="outline"
                                />

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

                                <IonInput
                                    type="password"
                                    label="Confirmar contraseña"
                                    labelPlacement="floating"
                                    value={confirmPassword}
                                    onIonInput={(e) => setConfirmPassword(e.detail.value || '')}
                                    className="login-input"
                                    fill="outline"
                                />

                                <IonButton
                                    expand="block"
                                    type="submit"
                                    className="login-button"
                                >
                                    <IonIcon icon={personAdd} slot="start" />
                                    Registrarse
                                </IonButton>
                            </form>

                            <div className="auth-footer">
                                <p>
                                    ¿Ya tienes cuenta?
                                    <IonButton
                                        fill="clear"
                                        routerLink="/login"
                                        className="link-button"
                                    >
                                        Inicia sesión
                                    </IonButton>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <IonLoading isOpen={loading} message="Registrando..." />
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

export default Register;
