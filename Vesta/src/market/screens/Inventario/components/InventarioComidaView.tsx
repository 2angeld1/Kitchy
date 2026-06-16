import React from 'react';
import { InventarioItemCard } from './InventarioItemCard';

interface Props {
    items: any[];
    categoriaNegocio: string;
    colors: any;
    styles: any;
    onEdit: (item: any) => void;
    onDelete: (id: string) => void;
    onMovimiento: (item: any, tipo: 'entrada' | 'salida' | 'merma') => void;
}

export const InventarioComidaView: React.FC<Props> = ({
    items, categoriaNegocio, colors, styles, onEdit, onDelete, onMovimiento
}) => {
    return (
        <>
            {items.map((item, i) => (
                <InventarioItemCard
                    key={item._id}
                    item={item} index={i}
                    categoriaNegocio={categoriaNegocio}
                    colors={colors} styles={styles}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onMovimiento={onMovimiento}
                />
            ))}
        </>
    );
};
