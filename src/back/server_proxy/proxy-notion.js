import request from 'request';

export default function proxyNotion(app) {
    const paths = '/api/proxy-notion';
    const apiServerHost = 'https://api.notion.com';

    app.use(paths, function(req, res) {
        const url = apiServerHost + req.url;
        console.log('Proxy Notion -> Redireccionando a: ' + url);
        
        // 1. Copiamos las cabeceras que mande Svelte
        const customHeaders = { ...req.headers };
        
        // 2. Limpiamos el host para evitar el Error 400
        delete customHeaders['host'];
        
        // 3. INYECTAMOS LOS SECRETOS DESDE EL BACKEND
        // (Asegúrate de que tu index.js principal tiene dotenv configurado)
        customHeaders['Authorization'] = `Bearer ${process.env.NOTION_TOKEN_DAVID}`;
        customHeaders['Notion-Version'] = '2022-06-28';

        // 4. Mandamos la petición por el tubo con las cabeceras trucadas
        const options = {
            url: url,
            headers: customHeaders
        };

        req.pipe(request(options)).pipe(res);
    });
}