import request from 'request'; //Librería para peticiones HTTP

export default function proxyGoogleCalendar(app) {
    //La ruta a la que llamará tu Svelte
    const paths = '/api/proxy-calendar';
    
    //La API a la que le vas a pedir los datos
    const apiServerHost = 'https://www.googleapis.com'; 

    app.use(paths, function(req, res) {
        //Combinamos la base de Google Calendar con la ruta que viene del frontend
        const url = apiServerHost + req.url;
        console.log('Proxy redireccionando mediante pipe a: ' + url);
        
        //Recibe la petición del Svelte y la pasa a Google Calendar, luego devuelve la respuesta al frontend
        req.pipe(request(url)).pipe(res);
    });
}