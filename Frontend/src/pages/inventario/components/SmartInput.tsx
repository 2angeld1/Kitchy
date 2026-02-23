import React from 'react';
import { IonIcon } from '@ionic/react';
import { sparkles, mic, send } from 'ionicons/icons';

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
        <div className="mt-4 bg-white dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200 dark:border-white/10 rounded-[2.5rem] p-4 shadow-lg shadow-zinc-200/50 dark:shadow-none ring-1 ring-black/5">
            <div className="flex items-center gap-3 bg-zinc-100/50 dark:bg-black/30 rounded-2xl px-4 py-1 border border-zinc-200/50 dark:border-white/5 transition-all focus-within:ring-2 ring-primary/20">
                <IonIcon icon={sparkles} className="text-xl text-amber-500 animate-pulse" />
                <input
                    type="text"
                    placeholder="Buscar o dictar (Ej: 10kg Tomate)"
                    value={smartText}
                    onChange={(e) => setSmartText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSmartAction()}
                    className="bg-transparent border-none outline-none flex-1 py-3 text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 font-medium text-base"
                />
                <div className="flex items-center">
                    <button
                        onClick={startListening}
                        className={`p-2 rounded-full transition-all ${isListening ? "text-danger bg-danger/10 animate-pulse" : "text-primary hover:bg-primary/10"}`}
                    >
                        <IonIcon icon={mic} className="text-xl" />
                    </button>
                    <button
                        onClick={handleSmartAction}
                        className="p-2 !text-primary hover:opacity-70 transition-all active:scale-90 ml-1"
                    >
                        <IonIcon icon={send} className="text-base" />
                    </button>
                </div>
            </div>

            <div className="mt-3 px-2">
                <p className="text-[0.8rem] font-black text-black dark:text-zinc-400">
                    {isListening ? (
                        <span className="flex items-center gap-2 text-danger">
                            <span className="w-2 h-2 rounded-full bg-danger animate-ping" />
                            Escuchando voz...
                        </span>
                    ) : (
                        <span className="opacity-90 italic">💡 Tip: Prueba "Gaste 2 lb Harina"</span>
                    )}
                </p>
            </div>
        </div>
    );
};

export default SmartInput;
