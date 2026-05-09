import { json } from '@sveltejs/kit';

export const POST = async ({ request }) => {
    // 1. Configuración (Usa variables de entorno en producción)
    const NOTION_TOKEN_DAVID = "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";
    const DATABASE_ID_DAVID = "33afbb08930a4cf28fd79bc60e71183d";

    try {
        // 2. Llamamos a Notion (Usamos POST porque así funciona su búsqueda)
        const response = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID_DAVID}/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_TOKEN_DAVID}`,
                'Notion-Version': '2022-06-28', // Versión obligatoria de la API
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        
        if (!response.ok) {
            return json({ error: 'Error en Notion', details: data }, { status: response.status });
        }

        // 3. Devolvemos los resultados limpios
        return json(data.results);

    } catch (error) {
        return json({ error: error.message }, { status: 500 });
    }
};