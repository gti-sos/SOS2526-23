
import request from 'request';

/**
 * PROXY HUBSPOT (Patrón Tubo)
 * Redirecciona peticiones del frontend directamente a la API de HubSpot.
 */
export default function proxyHubspot(app) {
    const paths = '/api/proxy-hubspot';
    const apiServerHost = 'https://api.hubapi.com';

    app.use(paths, function(req, res) {
        // Combinamos la base de HubSpot con la ruta que viene del frontend
        const url = apiServerHost + req.url;
        
        console.log('Proxy HubSpot -> Redireccionando a: ' + url);

        // Limpieza de cabecera para evitar errores 400 en APIs de terceros
        delete req.headers['host'];

        // El "Tubo": recibe la petición del Svelte y la escupe a HubSpot
        req.pipe(request(url)).pipe(res);
    });
}