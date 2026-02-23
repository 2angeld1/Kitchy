import React from 'react';
import { IonIcon } from '@ionic/react';
import { archive } from 'ionicons/icons';

interface EmptyInventoryProps {
    loading: boolean;
    itemCount: number;
}

const EmptyInventory: React.FC<EmptyInventoryProps> = ({ loading, itemCount }) => {
    if (loading || itemCount > 0) return null;

    return (
        <div className="flex flex-col items-center justify-center py-20 opacity-30 grayscale transition-all hover:opacity-50">
            <IonIcon icon={archive} className="text-9xl mb-6 text-zinc-300 dark:text-zinc-800" />
            <p className="font-bold text-lg">Tu inventario está vacío</p>
            <p className="text-sm">Agrega algo o usa el comando de voz</p>
        </div>
    );
};

export default EmptyInventory;
