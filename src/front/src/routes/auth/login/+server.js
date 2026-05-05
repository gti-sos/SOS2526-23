// Ruta: src/routes/auth/login/+server.js
import { redirect } from '@sveltejs/kit';
import { google } from 'googleapis';
// Importamos las variables secretas de forma segura en SvelteKit
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '$env/static/private';
import { PUBLIC_BASE_URL } from '$env/static/public';
export const GET = async () => {
    // 1. Configuramos el cliente con tus credenciales
    const oauth2Client = new google.auth.OAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        `${PUBLIC_BASE_URL}/auth/callback` // Tiene que coincidir exactamente con la consola de Google
    );

    // 2. Le decimos a Google qué queremos leer (el calendario)
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline', 
        scope: ['https://www.googleapis.com/auth/calendar.readonly']
    });

    // 3. Empujamos al navegador a esa URL de Google
    throw redirect(302, url);
};