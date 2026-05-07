import { redirect, isRedirect } from '@sveltejs/kit';
import { google } from 'googleapis';
// CAMBIO AQUÍ: Usamos dynamic en lugar de static
import { env } from '$env/dynamic/private';
import { env as envPublic } from '$env/dynamic/private';

export const GET = async ({ url, cookies }) => {
    const code = url.searchParams.get('code');
    if (!code) throw redirect(302, '/?error=No_Code');

    // CAMBIO AQUÍ: Llamamos a las variables desde el objeto env
    const oauth2Client = new google.auth.OAuth2(
        env.GOOGLE_CLIENT_ID_DAVID,
        env.GOOGLE_CLIENT_SECRET_DAVID,
        `${envPublic.BASE_URL}/auth/calendar/callback`
    );

    try {
        const { tokens } = await oauth2Client.getToken(code);

        cookies.set('google_calendar_token', tokens.access_token, {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24
        });

        // 302 a la ruta de tu integración para que veas la gráfica directamente
        throw redirect(302, '/integrations/global-ads-performance/api-calendar');
        
    } catch (error) {
        // SI ES UN REDIRECT, LO LANZAMOS DE NUEVO (esto evita el fallo)
        if (isRedirect(error)) throw error;

        console.error("Error real al verificar el código:", error);
        throw redirect(302, '/?error=Fallo_Autenticacion_Real');
    }
};