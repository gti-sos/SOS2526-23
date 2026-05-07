import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const GET = async () => {
    // 1. Definimos qué queremos leer de HubSpot (el scope exacto que marcamos en el panel)
    const scope = 'crm.objects.deals.read';
    
    // 2. Construimos la URL de retorno (debe coincidir con la que pusiste en tu panel de HubSpot)
    const redirectUri = encodeURIComponent(`${env.BASE_URL}/auth/hubspot/callback`);
    
    // 3. Montamos la URL oficial de autorización de HubSpot
    const hubspotAuthUrl = `https://app.hubspot.com/oauth/authorize?client_id=${env.HUBSPOT_CLIENT_ID_DAVID}&redirect_uri=${redirectUri}&scope=${scope}`;

    // 4. Redirigimos al usuario a la pantalla de permisos de HubSpot
    throw redirect(302, hubspotAuthUrl);
};