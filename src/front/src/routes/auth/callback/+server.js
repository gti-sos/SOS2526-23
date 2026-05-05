import { redirect, isRedirect } from '@sveltejs/kit'; // Añadimos isRedirect
import { google } from 'googleapis';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '$env/static/private';
import { PUBLIC_BASE_URL } from '$env/static/public';

export const GET = async ({ url, cookies }) => {
    const code = url.searchParams.get('code');
    if (!code) throw redirect(302, '/?error=No_Code');

    const oauth2Client = new google.auth.OAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        `${PUBLIC_BASE_URL}/auth/callback`
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
        throw redirect(302, '/integrations');
        
    } catch (error) {
        // SI ES UN REDIRECT, LO LANZAMOS DE NUEVO (esto evita el fallo)
        if (isRedirect(error)) throw error;

        console.error("Error real al verificar el código:", error);
        throw redirect(302, '/?error=Fallo_Autenticacion_Real');
    }
};