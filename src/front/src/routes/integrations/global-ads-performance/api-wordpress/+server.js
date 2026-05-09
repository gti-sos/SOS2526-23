import { json } from '@sveltejs/kit';

export const GET = async ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || authHeader === 'Bearer null') {
        console.log("❌ PROXY: No hay token válido en la cabecera.");
        return json({ error: 'No hay token' }, { status: 401 });
    }

    const SITE_DOMAIN = 'davidsos2526.wordpress.com';
    const wpUrl = `https://public-api.wordpress.com/rest/v1.1/sites/${SITE_DOMAIN}/stats/visits?unit=day&quantity=30`;

    try {
        console.log("⏳ PROXY: Llamando a WordPress...");
        
        const res = await fetch(wpUrl, {
            headers: { 'Authorization': authHeader }
        });

        // Leemos la respuesta cruda de WordPress
        const rawText = await res.text();
        
        console.log(`📡 PROXY: WordPress respondió con status ${res.status}`);
        console.log(`📝 PROXY: Cuerpo de la respuesta:`, rawText);

        // Si WordPress nos da un error, se lo pasamos tal cual al frontend
        if (!res.ok) {
             return json({ error: 'Error de WP', details: rawText }, { status: res.status });
        }

        // Si todo va bien, lo convertimos a JSON y lo enviamos
        return json(JSON.parse(rawText));

    } catch (error) {
        console.error("🔥 PROXY: Error interno del servidor Node:", error);
        return json({ error: error.message }, { status: 500 });
    }
};