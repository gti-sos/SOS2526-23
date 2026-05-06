import { redirect } from '@sveltejs/kit';
import { google } from 'googleapis';
// CAMBIO AQUÍ
import { env } from '$env/dynamic/private';
import { env as envPublic } from '$env/dynamic/public';

export const GET = async () => {
    const oauth2Client = new google.auth.OAuth2(
        env.GOOGLE_CLIENT_ID_DAVID,
        env.GOOGLE_CLIENT_SECRET_DAVID,
        `${envPublic.BASE_URL}/auth/callback`
    );


    // 2. Le decimos a Google qué queremos leer (el calendario)
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline', 
        scope: ['https://www.googleapis.com/auth/calendar.readonly']
    });

    // 3. Empujamos al navegador a esa URL de Google
    throw redirect(302, url);
};