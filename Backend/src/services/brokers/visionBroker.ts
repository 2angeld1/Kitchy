import axios from 'axios';
import Negocio from '../../models/Negocio';
import Inventario from '../../models/Inventario';
import { uploadImage, deleteImage } from '../../utils/imageUpload';

const CAITLYN_URL = process.env.CAITLYN_URL || 'http://localhost:8000';

export const procesarFacturaService = async (imagen: string, negocioId: string) => {
    const negocio = await Negocio.findById(negocioId).select('categoria');
    const negocioTipo = negocio?.categoria || 'GASTRONOMIA';

    console.log(`🤖 Enviando factura a Caitlyn ([${negocioTipo}]) para análisis...`);
    const caitlynResponse = await axios.post(
        `${CAITLYN_URL}/agent/invoice`,
        { imagen, negocio_tipo: negocioTipo },
        { timeout: 60000 }
    );

    if (caitlynResponse.data.success) {
        const productosDetectados = caitlynResponse.data.productos || [];
        const fiscal = caitlynResponse.data.fiscal || {};
        const metadata = {
            proveedor: fiscal.proveedor,
            ruc: fiscal.ruc,
            dv: fiscal.dv,
            fecha: fiscal.fecha,
            receptor: fiscal.receptor,
            nroFactura: fiscal.nroFactura,
            subtotal: fiscal.subtotal,
            itbms: fiscal.itbms,
            total: fiscal.total
        };

        return {
            message: productosDetectados.length > 0
                ? `Caitlyn detectó ${productosDetectados.length} productos en tu factura`
                : 'Caitlyn detectó la factura pero no productos específicos.',
            items: productosDetectados,
            metadata
        };
    } else {
        throw new Error(caitlynResponse.data.error || 'Caitlyn no pudo procesar la factura');
    }
};

export const aprenderAliasVisualService = async (invoice_text: string, product_id: string, negocioId: string) => {
    const response = await axios.post(`${CAITLYN_URL}/agent/vision/learn-alias`, { 
        invoice_text, 
        product_id,
        negocio_id: negocioId 
    });
    return response.data;
};

export const buscarMatchesVisualesService = async (extracted_items: any[], negocioId: string) => {
    const inventario = await Inventario.find({ negocioId }).select('nombre unidad _id');

    const response = await axios.post(`${CAITLYN_URL}/agent/vision/match-products`, {
        extracted_items,
        inventory_items: inventario,
        negocio_id: negocioId
    });

    return response.data;
};

export const procesarCuadernoVentasService = async (imagen: string) => {
    let imageUrl = null;
    try {
        imageUrl = await uploadImage(imagen, 'notebook_scans');
    } catch (uploadError) {
        console.error('❌ Error subiendo a Cloudinary:', uploadError);
        imageUrl = imagen;
    }

    const response = await axios.post(
        `${CAITLYN_URL}/agent/notebook`,
        { imagen: imageUrl },
        { 
            timeout: 90000, 
            maxBodyLength: Infinity,
            maxContentLength: Infinity
        }
    );

    if (imageUrl && imageUrl.startsWith('http')) {
        deleteImage(imageUrl).catch(console.error);
    }

    if (response.data.success) {
        return response.data;
    } else {
        throw new Error(response.data.error || 'Error interno de procesado de cuaderno');
    }
};
