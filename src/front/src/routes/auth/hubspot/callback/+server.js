import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const GET = async ({ url, cookies }) => {
    // 1. Extraemos el código temporal que nos envía HubSpot en la URL
    const code = url.searchParams.get('code');
    
    if (!code) {
        console.error("❌ No se recibió el código de HubSpot");
        throw redirect(302, '/integrations/global-ads-performance?error=no_code');
    }

    try {
        // 2. Preparamos la petición para intercambiar el código por un Token
        // HubSpot requiere que enviemos los datos como x-www-form-urlencoded
        const formData = new URLSearchParams();
        formData.append('grant_type', 'authorization_code');
        formData.append('client_id', env.HUBSPOT_CLIENT_ID_DAVID);
        formData.append('client_secret', env.HUBSPOT_CLIENT_SECRET_DAVID);
        formData.append('redirect_uri', `${env.BASE_URL}/auth/hubspot/callback`);
        formData.append('code', code);

        const response = await fetch('https://api.hubapi.com/oauth/v1/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData
        });

        const tokens = await response.json();

        if (!response.ok) {
            throw new Error(tokens.message || "Fallo al canjear el token");
        }

        // 3. Guardamos el access_token en una cookie segura
        // Nota: HubSpot suele dar tokens que duran 30 minutos.
        cookies.set('hubspot_token', tokens.access_token, {
            path: '/',
            httpOnly: false, // Permitir acceso desde JS para futuras llamadas al proxy
            sameSite: 'lax',
            secure: true,
            maxAge: tokens.expires_in // Usamos la duración que nos da HubSpot
        });

        // 4. Redirigimos de vuelta a tu página de la integración
        throw redirect(302, '/integrations/global-ads-performance/api-hubspot');

    } catch (error) {
        if (error.status === 302) throw error; // Permitir la redirección normal
        console.error("❌ Error en Callback de HubSpot:", error.message);
        throw redirect(302, '/integrations/global-ads-performance?error=auth_failed');
    }
};