// ARGUMENTO DE DEFENSA: Control de Flujo desde el Servidor.
// Este código reside en un endpoint de servidor (un archivo +server.js en SvelteKit).
// Es crucial iniciar el flujo OAuth2 desde el backend para mantener en secreto 
// nuestras credenciales (Client Secret) y no exponer la configuración al navegador del usuario.
import { redirect } from '@sveltejs/kit';

// SDK Oficial de Google para Node.js
import { google } from 'googleapis';

// CAMBIO AQUÍ
// ARGUMENTO DE DEFENSA: Variables de Entorno Dinámicas.
// Al igual que en el callback, usamos '$env/dynamic/private' para asegurar que 
// los secretos de Google se lean en tiempo de ejecución (runtime) y no se queden 
// quemados en el código durante la compilación.
import { env } from '$env/dynamic/private';
import { env as envPublic } from '$env/dynamic/private';

export const GET = async () => {
    // 1. Configuración del Cliente OAuth2
    // Instanciamos el cliente indicando "quiénes somos" (Client ID y Secret) y 
    // "a dónde queremos que Google nos devuelva al usuario" (Callback URL).
    const oauth2Client = new google.auth.OAuth2(
        env.GOOGLE_CLIENT_ID_DAVID,
        env.GOOGLE_CLIENT_SECRET_DAVID,
        `${envPublic.BASE_URL}/auth/calendar/callback`
    );

    // 2. Le decimos a Google qué queremos leer (el calendario)
    // ARGUMENTO DE DEFENSA: Generación segura de URL y Principio de Mínimo Privilegio.
    const url = oauth2Client.generateAuthUrl({
        // access_type: 'offline' le pide a Google que, además del token de acceso, 
        // nos envíe un "Refresh Token". Esto es una buena práctica por si en el futuro 
        // necesitamos mantener la sesión de la API abierta sin que el usuario tenga 
        // que volver a hacer login constantemente.
        access_type: 'offline', 
        
        // SCOPE: Aquí aplicamos el Principio de Mínimo Privilegio (Principle of Least Privilege).
        // No pedimos control total ('/auth/calendar'). Solo pedimos permisos de LECTURA 
        // ('/auth/calendar.readonly') porque nuestro objetivo es únicamente extraer los eventos 
        // para visualizarlos en una gráfica. Esto aumenta la confianza del usuario al aceptar.
        scope: ['https://www.googleapis.com/auth/calendar.readonly']
    });

    // 3. Empujamos al navegador a esa URL de Google
    // ARGUMENTO DE DEFENSA: Delegación de la Autenticación.
    // Usamos un 'throw redirect(302)' para enviar al usuario a los servidores de Google.
    // Nosotros NO manejamos contraseñas ni correos; delegamos toda la responsabilidad de 
    // autenticación e interfaz de login a Google, cumpliendo con el estándar OAuth2.
    throw redirect(302, url);
};