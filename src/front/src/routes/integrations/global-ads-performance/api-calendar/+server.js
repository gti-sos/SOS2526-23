import { json } from '@sveltejs/kit';
import { google } from 'googleapis';

// Importamos las variables de entorno de forma dinámica y privada.
// 'dynamic' asegura que se lean en tiempo de ejecución (vital para plataformas como Render).
// 'private' asegura que estas variables (como el SECRET_ID) nunca viajen al navegador del usuario.
import { env } from '$env/dynamic/private';

/**
 * Endpoint GET que actúa como Proxy (Backend-For-Frontend).
 * Se encarga de cruzar los datos de nuestra API de Ads con la agenda privada del usuario.
 */
export const GET = async ({ cookies, fetch }) => {
    // 1. VALIDACIÓN DE AUTENTICACIÓN
    // Extraemos la cookie de sesión que guardamos durante el proceso de OAuth con Google.
    const token = cookies.get('google_calendar_token');
    
    // Si no hay token, cortamos la ejecución inmediatamente.
    // Devolvemos un error 401 (Unauthorized) para que el frontend sepa que debe mostrar el botón de Login.
    if (!token) {
        return json({ error: 'No autenticado en Google' }, { status: 401 });
    }

    try {
        // 2. OBTENCIÓN DE DATOS DE LA API PROPIA (ADS)
        // Usamos el 'fetch' interno de SvelteKit para llamar a nuestro backend principal en Render.
        const resAds = await fetch('https://sos2526-23.onrender.com/api/v2/global-ads-performance');
        if (!resAds.ok) throw new Error("Fallo al conectar con la API de Ads");
        const adsData = await resAds.json();

        // 3. CONFIGURACIÓN DEL CLIENTE DE GOOGLE
        // Inicializamos el cliente OAuth2 usando las credenciales seguras del servidor (.env).
        const oauth2Client = new google.auth.OAuth2(
            env.GOOGLE_CLIENT_ID_DAVID,
            env.GOOGLE_CLIENT_SECRET_DAVID
        );
        
        // Le inyectamos el token temporal del usuario (leído de la cookie)
        // A partir de aquí, todas las peticiones a Google se hacen "en nombre" de ese usuario.
        oauth2Client.setCredentials({ access_token: token });
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        // 4. OBTENCIÓN DE EVENTOS DEL CALENDARIO
        const resEvents = await calendar.events.list({
            calendarId: 'primary', // El calendario principal del usuario logueado.
            timeMin: (new Date('2024-01-01')).toISOString(), // Filtramos eventos desde inicio de 2024.
            maxResults: 1000, // Margen amplio para traer todo el año de golpe.
            singleEvents: true, // Expande los eventos recurrentes (como cumpleaños) en eventos individuales.
            orderBy: 'startTime', // Los ordenamos cronológicamente.
        });
        
        // 5. NORMALIZACIÓN Y FILTRADO DE DATOS
        // Google devuelve mucha información (creador, zona horaria, meet links, etc.).
        // Mapeamos el array para quedarnos solo con lo que necesita nuestro frontend: fecha y título.
        const events = (resEvents.data.items || []).map(event => ({
            // Normalizamos la fecha: 
            // - event.start.date: Ocurre en eventos de "todo el día" (ej. "2024-06-07").
            // - event.start.dateTime: Ocurre en eventos con hora. Hacemos .split('T')[0] para quedarnos solo con el día.
            date: event.start.date || (event.start.dateTime ? event.start.dateTime.split('T')[0] : null),
            title: event.summary || "Evento sin título"
        }))
        // Descartamos cualquier evento corrupto que no tenga fecha válida.
        .filter(e => e.date !== null);

        // 6. RESPUESTA AL FRONTEND
        // Devolvemos ambos paquetes de datos limpios y listos para ser cruzados en el cliente.
        return json({ adsData, events });

    } catch (error) {
        // GESTIÓN DE ERRORES CENTRALIZADA
        // Se imprime el error en la terminal del servidor (útil para debugear en Render).
        console.error("❌ Error en el servidor API-Calendar:", error.message);
        
        // Devolvemos un código 500 (Internal Server Error) para que el frontend pueda mostrar un mensaje de fallo amigable.
        return json({ error: "Error interno del servidor", detalle: error.message }, { status: 500 });
    }
};