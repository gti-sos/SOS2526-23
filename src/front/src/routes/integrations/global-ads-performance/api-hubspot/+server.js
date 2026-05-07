import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const GET = async ({ cookies, fetch }) => {
    const token = cookies.get('hubspot_token');
    
    if (!token) {
        return json({ error: 'No autenticado en HubSpot' }, { status: 401 });
    }

    try {
        // 1. Petición a tu API de Ads (Impacto)
        const resAds = await fetch('https://sos2526-23.onrender.com/api/v2/global-ads-performance');
        const adsData = await resAds.json();

        // 2. Petición a la API de HubSpot (Ventas reales)
        // Pedimos los 'deals' (tratos) con sus propiedades de precio y fecha de cierre
        const resHubspot = await fetch('https://api.hubapi.com/crm/v3/objects/deals?properties=amount,closedate,dealname', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const hubspotData = await resHubspot.json();

        // 3. Devolvemos el JSON combinado
        // No enviamos widgets, enviamos DATA pura para que el frontend la procese.
        return json({ 
            ads: adsData, 
            sales: hubspotData.results || [] 
        });

    } catch (error) {
        return json({ error: 'Fallo al procesar datos combinados' }, { status: 500 });
    }
};