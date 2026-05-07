import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

/**
 * PATRÓN PROXY (BFF - Backend For Frontend)
 * Este endpoint actúa como un intermediario seguro entre nuestra interfaz web y las APIs.
 */
export const GET = async ({ cookies, fetch }) => {
    // CLAVE 1: SEGURIDAD (Zero Trust)
    // Leemos el token directamente de la cookie segura del servidor (httpOnly). 
    // Así evitamos que el Token viaje al navegador y lo exponemos a robos (ataques XSS).
    const token = cookies.get('hubspot_token');
    
    if (!token) {
        return json({ error: 'No autenticado en HubSpot' }, { status: 401 });
    }

    try {
        // CLAVE 2: ORQUESTACIÓN DE DATOS (Paso 1)
        // El servidor hace la petición a nuestra propia API de Ads para obtener la inversión publicitaria.
        const resAds = await fetch('https://sos2526-23.onrender.com/api/v2/global-ads-performance');
        const adsData = await resAds.json();

        // CLAVE 3: EVASIÓN DE CORS Y LLAMADA EXTERNA (Paso 2)
        // Hacemos la petición a HubSpot desde el backend para evitar bloqueos CORS del navegador.
        // Inyectamos el Bearer Token aquí, de forma invisible para el usuario.
        const resHubspot = await fetch('https://api.hubapi.com/crm/v3/objects/deals?properties=amount,closedate,dealname', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const hubspotData = await resHubspot.json();

        // CLAVE 4: CUMPLIMIENTO DE REQUISITOS (Data Pura)
        // No devolvemos un widget ni HTML prefabricado. Agrupamos los datos crudos de ambas 
        // fuentes y enviamos un único JSON unificado para que el frontend lo procese y dibuje.
        return json({ 
            ads: adsData, 
            sales: hubspotData.results || [] 
        });

    } catch (error) {
        return json({ error: 'Fallo al procesar datos combinados' }, { status: 500 });
    }
};