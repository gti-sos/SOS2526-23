import request from 'request';

export default function proxyGoogleCalendar(app) {
    // 1. La ruta "falsa" a la que llamará tu Svelte
    const paths = '/api/proxy-calendar';
    
    // 2. La API real a la que le vas a pedir los datos (El destino)
    const apiServerHost = 'https://www.googleapis.com'; 

    app.use(paths, function(req, res) {
        // 3. Juntamos el destino con lo que pida Svelte
        // Ejemplo: Si Svelte pide '/api/proxy-calendar/calendar/v3/calendars/primary/events'
        // req.url será '/calendar/v3/calendars/primary/events'
        const url = apiServerHost + req.url;
        console.log('Proxy redireccionando mediante pipe a: ' + url);
        
        // 4. El Pipe mágico (El Tubo)
        req.pipe(request(url)).pipe(res);
    });
}