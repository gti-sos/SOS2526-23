import { json } from '@sveltejs/kit';
// 1. IMPORTANTE: Usar 'dynamic' en lugar de 'static'
import { env } from '$env/dynamic/private';

export const POST = async ({ request }) => {
    try {
        // 2. Leer las variables del objeto env
        const NOTION_TOKEN_DAVID = env.NOTION_TOKEN_DAVID;
        const DATABASE_ID_DAVID = env.DATABASE_ID_DAVID;

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

        return json(data.results);

    } catch (error) {
        return json({ error: error.message }, { status: 500 });
    }
};