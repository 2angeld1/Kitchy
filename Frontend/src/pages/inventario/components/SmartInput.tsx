import React from 'react';
import { IonIcon } from '@ionic/react';
import { sparkles, mic, send } from 'ionicons/icons';
import { motion } from 'framer-motion';
import { slideUp, springTransition } from '../../../animations/variants';

interface SmartInputProps {
    smartText: string;
    setSmartText: (text: string) => void;
    handleSmartAction: () => void;
    startListening: () => void;
    isListening: boolean;
}

const SmartInput: React.FC<SmartInputProps> = ({
    smartText,
    setSmartText,
    handleSmartAction,
    startListening,
    isListening
}) => {
    return (
        <motion.div
            variants={slideUp}
            initial="initial"
            animate="animate"
            className="mt-4 bg-white backdrop-blur-xl border border-zinc-200 rounded-[2.5rem] p-4 shadow-lg shadow-zinc-200/50 ring-1 ring-black/5"
        >
            <div className="flex items-center gap-3 bg-zinc-100/50 rounded-2xl px-4 py-1 border border-zinc-200/50 transition-all focus-within:ring-2 ring-primary/20">
                <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                >
                    <IonIcon icon={sparkles} className="text-xl text-amber-500" />
                </motion.div>

                <input
                    type="text"
                    placeholder="Buscar o dictar (Ej: 10kg Tomate)"
                    value={smartText}
                    onChange={(e) => setSmartText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSmartAction()}
                    className="bg-transparent border-none outline-none flex-1 py-3 text-zinc-800 placeholder:text-zinc-400 font-medium text-base"
                />

                <div className="flex items-center">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={startListening}
                        className={`p-2 rounded-full transition-all ${isListening ? "text-danger bg-danger/10" : "text-primary hover:bg-primary/10"}`}
                    >
                        <IonIcon icon={mic} className={`text-xl ${isListening ? 'animate-bounce' : ''}`} />
                    </motion.button>

                    <motion.button
                        whileTap={{ scale: 0.8 }}
                        transition={springTransition}
                        onClick={handleSmartAction}
                        className="p-2 !text-primary hover:opacity-70 ml-1"
                    >
                        <IonIcon icon={send} className="text-base" />
                    </motion.button>
                </div>
            </div>

            <div className="mt-3 px-2">
                <motion.p
                    layout
                    className="text-[0.8rem] font-bold text-black"
                >
                    {isListening ? (
                        <span className="flex items-center gap-2 text-danger">
                            <motion.span
                                animate={{ opacity: [1, 0.4, 1] }}
                                transition={{ repeat: Infinity, duration: 1 }}
                                className="w-2 h-2 rounded-full bg-danger"
                            />
                            Escuchando voz...
                        </span>
                    ) : (
                        <span className="opacity-90 italic">💡 Tip: Prueba "Gaste 2 lb Harina"</span>
                    )}
                </motion.p>
            </div>
        </motion.div>
    );
};

export default SmartInput;
