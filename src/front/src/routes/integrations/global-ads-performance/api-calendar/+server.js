import { json } from '@sveltejs/kit';
import { google } from 'googleapis';
// Usamos dynamic para evitar fallos de carga en tiempo de compilación
import { env } from '$env/dynamic/private';

export const GET = async ({ cookies, fetch }) => {
    const token = cookies.get('google_calendar_token');
    
    // Si no hay token, devolvemos un 401 claro para el frontend
    if (!token) {
        return json({ error: 'No autenticado en Google' }, { status: 401 });
    }

    try {
        // 1. Obtener datos de tu API de Ads
        const resAds = await fetch('https://sos2526-23.onrender.com/api/v2/global-ads-performance');
        if (!resAds.ok) throw new Error("Fallo al conectar con la API de Ads");
        const adsData = await resAds.json();

        // 2. Configurar cliente de Google
        const oauth2Client = new google.auth.OAuth2(
            env.GOOGLE_CLIENT_ID,
            env.GOOGLE_CLIENT_SECRET
        );
        oauth2Client.setCredentials({ access_token: token });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        // 3. Traer eventos (obtenemos los últimos 100 eventos del año)
        const resEvents = await calendar.events.list({
            calendarId: 'primary',
            timeMin: (new Date('2024-01-01')).toISOString(),
            maxResults: 100,
            singleEvents: true,
            orderBy: 'startTime',
        });
        
        const events = (resEvents.data.items || []).map(event => ({
            date: event.start.date || (event.start.dateTime ? event.start.dateTime.split('T')[0] : null),
            title: event.summary || "Evento sin título"
        })).filter(e => e.date !== null);

        return json({ adsData, events });
    } catch (error) {
        console.error("❌ Error en el servidor API-Calendar:", error.message);
        return json({ error: "Error interno del servidor", detalle: error.message }, { status: 500 });
    }
};