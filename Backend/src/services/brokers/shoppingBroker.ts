import axios from 'axios';

const CAITLYN_URL = process.env.CAITLYN_URL || 'http://localhost:8000';

export const parseShoppingListService = async (text: string, image: string) => {
    const response = await axios.post(`${CAITLYN_URL}/agent/shopping/parse`, {
        text,
        image
    });

    if (response.data.success) {
        return response.data;
    } else {
        throw new Error(response.data.error || 'Error procesando presupuesto.');
    }
};

export const aprenderPrecioService = async (item_name: string, price: number, negocioId: string) => {
    const response = await axios.post(`${CAITLYN_URL}/agent/shopping/learn-price`, {
        item_name,
        price,
        negocio_id: negocioId
    });
    return response.data;
};
