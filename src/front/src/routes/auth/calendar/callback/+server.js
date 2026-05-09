// ARGUMENTO DE DEFENSA: Manejo nativo de SvelteKit.
// isRedirect es crucial en SvelteKit porque la función redirect() funciona lanzando
// un error (throw) por debajo. Necesitamos esta utilidad para no capturarlo accidentalmente en el bloque catch.
import { redirect, isRedirect } from '@sveltejs/kit';

// Utilizamos la librería oficial de Google (SDK) que nos facilita la firma de peticiones
// y la gestión del protocolo OAuth2 sin tener que construir las peticiones HTTP a mano.
import { google } from 'googleapis';

// CAMBIO AQUÍ: Usamos dynamic en lugar de static
// ARGUMENTO DE DEFENSA: Variables de Entorno Dinámicas.
// Hemos migrado de variables estáticas a dinámicas ($env/dynamic/private). 
// Esto es vital para entornos de despliegue modernos (como Vercel o Render).
// Si fueran estáticas, los secretos se inyectarían en tiempo de compilación (build time).
// Al ser dinámicas, se leen en tiempo de ejecución (runtime), lo que es mucho más seguro
// y evita problemas si las variables cambian en el servidor sin recompilar la app.
import { env } from '$env/dynamic/private';
import { env as envPublic } from '$env/dynamic/private';

// Este endpoint GET actúa como el "Callback URL" en el flujo de Authorization Code de OAuth2.
export const GET = async ({ url, cookies }) => {
    // 1. Recepción del "Authorization Code"
    // Cuando el usuario acepta los permisos en la pantalla de Google, Google lo redirige aquí
    // adjuntando un código temporal en la URL.
    const code = url.searchParams.get('code');
    
    // Si llegamos a esta ruta sin código, cortamos la ejecución y devolvemos al usuario al inicio.
    if (!code) throw redirect(302, '/?error=No_Code');

    // CAMBIO AQUÍ: Llamamos a las variables desde el objeto env
    // 2. Configuración del Cliente OAuth2
    // Instanciamos el cliente pasándole nuestras credenciales de Google Cloud Console.
    const oauth2Client = new google.auth.OAuth2(
        env.GOOGLE_CLIENT_ID_DAVID,
        env.GOOGLE_CLIENT_SECRET_DAVID,
        // Usamos una variable dinámica para la URL base. Esto permite que la autenticación
        // funcione tanto en 'localhost' como en producción dinámicamente sin tocar el código.
        `${envPublic.BASE_URL}/auth/calendar/callback`
    );

    try {
        // 3. Intercambio del Código por el Token (Token Exchange)
        // El código temporal de la URL no sirve para llamar a la API. Tenemos que contactar 
        // a los servidores de Google para intercambiarlo por un 'access_token' real.
        const { tokens } = await oauth2Client.getToken(code);

        // 4. ALMACENAMIENTO SEGURO DEL TOKEN (Crucial para la defensa)
        // ARGUMENTO DE DEFENSA: Seguridad de la aplicación.
        // No enviamos el token al frontend ni lo guardamos en el LocalStorage (que es vulnerable a XSS).
        // Lo guardamos en una cookie de servidor con configuraciones de alta seguridad:
        cookies.set('google_calendar_token', tokens.access_token, {
            path: '/', // Disponible en toda la aplicación
            httpOnly: true, // Bloquea el acceso a la cookie desde JavaScript en el cliente (Previene XSS)
            sameSite: 'lax', // Protege contra ataques CSRF (Cross-Site Request Forgery)
            secure: process.env.NODE_ENV === 'production', // Solo se envía por HTTPS en producción
            maxAge: 60 * 60 * 24 // Caduca en 24 horas para limitar la ventana de exposición si es robada
        });

        // 5. Redirección final
        // Una vez autenticado de forma segura, mandamos al usuario (302 Found) a la página
        // de la integración para que vea la gráfica que consume los datos.
        // 302 a la ruta de tu integración para que veas la gráfica directamente
        throw redirect(302, '/integrations/global-ads-performance/api-calendar');
        
    } catch (error) {
        // ARGUMENTO DE DEFENSA: Control de Flujo de SvelteKit.
        // SI ES UN REDIRECT, LO LANZAMOS DE NUEVO (esto evita el fallo)
        // Como 'redirect(302, ...)' de arriba lanza una excepción intencionadamente para cambiar de página,
        // caerá en este 'catch'. Comprobamos con 'isRedirect' si el error es en realidad la redirección.
        // Si lo es, lo dejamos pasar (throw error) para que SvelteKit haga su magia. Si no hacemos esto,
        // capturaríamos la redirección, la trataríamos como un error real, y la app se rompería.
        if (isRedirect(error)) throw error;

        // Si es un error genuino de Google (credenciales inválidas, código caducado...), lo pintamos en log
        // y devolvemos al usuario al inicio con un mensaje de error limpio.
        console.error("Error real al verificar el código:", error);
        throw redirect(302, '/?error=Fallo_Autenticacion_Real');
    }
};