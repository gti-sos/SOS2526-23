import { json } from '@sveltejs/kit';

export const GET = async ({ fetch }) => {
    try {
        // Consultamos la tasa de cambio base USD desde un servicio externo
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        
        if (!response.ok) {
            return json({ error: 'Fallo al obtener tasas' }, { status: response.status });
        }

        const data = await response.json();
        return json(data);
    } catch (error) {
        return json({ error: error.message }, { status: 500 });
    }
};