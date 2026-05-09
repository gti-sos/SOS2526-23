import { json } from '@sveltejs/kit';
// Importamos las variables de forma segura desde el servidor
import { NOTION_TOKEN_DAVID, DATABASE_ID_DAVID } from '$env/static/private';

export const POST = async ({ request }) => {
    try {
        // 1. Llamamos a Notion usando las variables cargadas del .env
        const response = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID_DAVID}/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_TOKEN_DAVID}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        
        if (!response.ok) {
            return json({ error: 'Error en Notion', details: data }, { status: response.status });
        }

        // 2. Devolvemos los resultados limpios
        return json(data.results);

    } catch (error) {
        return json({ error: error.message }, { status: 500 });
    }
};