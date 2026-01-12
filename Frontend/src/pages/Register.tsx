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
import { restaurant, personAdd } from 'ionicons/icons';
import { useAuth } from '../context/AuthContext';
import { useHistory } from 'react-router-dom';

const Register: React.FC = () => {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { register } = useAuth();
    const history = useHistory();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombre || !email || !password) {
            setError('Por favor completa todos los campos');
            return;
        }
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }
        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);
        try {
            await register(email, password, nombre);
            history.replace('/ventas');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al registrar');
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
                            <IonIcon icon={restaurant} className="logo-icon" />
                        </div>
                        <h1>Kitchy</h1>
                        <p>Crear cuenta</p>
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

                    <div className="login-footer">
                        <IonButton
                            fill="clear"
                            routerLink="/login"
                            className="register-link"
                        >
                            ¿Ya tienes cuenta? Inicia sesión
                        </IonButton>
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
