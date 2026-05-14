import { redirect } from '@sveltejs/kit';
import { google } from 'googleapis';
import { env } from '$env/dynamic/private';

export const GET = async ({ url, cookies }) => {
    const code = url.searchParams.get('code');

    if (!code) {
        return new Response('No se ha recibido el código de autorización', { status: 400 });
    }

    const oauth2Client = new google.auth.OAuth2(
        env.GOOGLE_CLIENT_ID_MARIA,
        env.GOOGLE_CLIENT_SECRET_MARIA,
        `${env.BASE_URL}/auth/health/callback`
    );

    try {
        const { tokens } = await oauth2Client.getToken(code);
        
        cookies.set('google_health_token', tokens.access_token, {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 
        });

        // 5. Redirigimos al usuario
        throw redirect(303, '/integrations/online-sales-popular-marketplaces/api-health');

    } catch (error) {
        // Si el error es un redireccionamiento de SvelteKit, relánzalo para que funcione
        if (error.status && error.status >= 300 && error.status < 400) {
            throw error;
        }
        // ------------------------------------

        console.error('Error al intercambiar el código:', error);
        return new Response('Error en la autenticación con Google', { status: 500 });
    }
};