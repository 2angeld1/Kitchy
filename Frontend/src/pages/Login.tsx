import React from 'react';
import {
    IonPage,
    IonContent,
    IonLoading,
    IonToast,
    IonIcon
} from '@ionic/react';
import { logIn, arrowForward, constructOutline } from 'ionicons/icons';
import { useLogin } from '../hooks/useLogin';
import { motion } from 'framer-motion';

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
        <IonPage>
            <IonContent fullscreen className="--background: transparent">
                <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row font-outfit">

                    {/* Visual Panel - Desktop Only */}
                    <div className="hidden md:flex flex-1 bg-zinc-900 relative overflow-hidden items-center justify-center p-12">
                        {/* Background Abstract Shapes */}
                        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[100px] rounded-full mix-blend-screen" />
                        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 blur-[100px] rounded-full mix-blend-screen" />

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="relative z-10 max-w-lg text-center"
                        >
                            <div className="w-24 h-24 bg-white/10 rounded-[2rem] backdrop-blur-xl border border-white/20 flex items-center justify-center mx-auto mb-8 shadow-2xl">
                                <span className="text-5xl font-black text-white">K<span className="text-primary">.</span></span>
                            </div>
                            <h1 className="text-5xl font-black text-white mb-6 tracking-tight leading-tight">
                                Gestión inteligente para tu <span className="text-primary">negocio</span>.
                            </h1>
                            <p className="text-lg font-medium text-zinc-400">
                                La plataforma que centraliza tus ventas, inventario y menú digital en un solo lugar.
                            </p>
                        </motion.div>
                    </div>

                    {/* Form Panel */}
                    <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-12 lg:px-24 relative bg-white">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="max-w-md w-full mx-auto"
                        >
                            {/* Mobile Logo */}
                            <div className="md:hidden w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-zinc-900/10">
                                <span className="text-3xl font-black text-white">K<span className="text-primary">.</span></span>
                            </div>

                            <div className="mb-10">
                                <h2 className="text-3xl lg:text-4xl font-black text-zinc-900 tracking-tight mb-2">¡Bienvenido!</h2>
                                <p className="text-zinc-500 font-medium">Ingresa a tu cuenta para continuar.</p>
                            </div>

                            <form onSubmit={(e) => { e.preventDefault(); handleLogin(e as any); }} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500 ml-1">Correo Electrónico</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="ejemplo@restaurante.com"
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4 text-base font-bold text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:ring-4 ring-primary/10 focus:border-primary/30 transition-all outline-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500">Contraseña</label>
                                        {/* Optional: <a href="#" className="text-[11px] font-bold text-primary hover:text-primary-shade transition-colors">¿Olvidaste tu contraseña?</a> */}
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4 text-base font-bold text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:ring-4 ring-primary/10 focus:border-primary/30 transition-all outline-none"
                                    />
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={loading}
                                    className="!w-full !bg-zinc-900 hover:!bg-zinc-800 !text-white !font-black !py-4 !rounded-2xl !shadow-xl !shadow-zinc-900/20 !transition-all !flex !items-center !justify-center !gap-2 !mt-4 disabled:!opacity-70 group"
                                >
                                    <span>Iniciar Sesión</span>
                                    <IonIcon icon={arrowForward} className="text-lg group-hover:translate-x-1 transition-transform" />
                                </motion.button>
                            </form>

                            <div className="mt-10 text-center">
                                <p className="text-sm font-medium text-zinc-500">
                                    ¿No tienes una cuenta aún?{' '}
                                    <a href="/register" className="font-black text-zinc-900 hover:text-primary transition-colors underline decoration-2 decoration-primary/30 underline-offset-4">
                                        Regístrate aquí
                                    </a>
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>

                <IonLoading isOpen={loading} message="Autorizando..." spinner="crescent" />
                <IonToast
                    isOpen={!!error}
                    message={error}
                    duration={4000}
                    color="danger"
                    onDidDismiss={() => setError('')}
                    position="top"
                />
            </IonContent>
        </IonPage>
    );
};

export default Login;
