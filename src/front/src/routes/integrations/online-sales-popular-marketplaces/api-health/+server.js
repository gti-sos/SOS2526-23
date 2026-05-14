import { json } from '@sveltejs/kit';
import { google } from 'googleapis';
import { env } from '$env/dynamic/private';

export const GET = async ({ cookies, fetch }) => {
    const token = cookies.get('google_health_token');
    if (!token) return json({ error: 'No autenticado' }, { status: 401 });

    let salesData = [];
    try {
        // 1. Obtención de datos de ventas
        let resSales = await fetch("https://sos2526-23.onrender.com/api/v1/online-sales-popular-marketplaces");
        if (resSales.status === 200) {
            salesData = await resSales.json();
            if (salesData.length === 0) {
                const resLoad = await fetch("https://sos2526-23.onrender.com/api/v1/online-sales-popular-marketplaces/loadInitialData");
                if (resLoad.ok) {
                    await new Promise(r => setTimeout(r, 1000));
                    const resFinal = await fetch("https://sos2526-23.onrender.com/api/v1/online-sales-popular-marketplaces");
                    salesData = await resFinal.json();
                }
            }
        }

        // 2. Configuración de Google Fitness
        const oauth2Client = new google.auth.OAuth2(env.GOOGLE_CLIENT_ID_MARIA, env.GOOGLE_CLIENT_SECRET_MARIA);
        oauth2Client.setCredentials({ access_token: token });
        const fitness = google.fitness({ version: 'v1', auth: oauth2Client });
        
        const startTime = new Date('2024-01-01T00:00:00Z').getTime();
        const endTime = new Date('2024-12-31T23:59:59Z').getTime();

        const resHealth = await fitness.users.dataset.aggregate({
            userId: 'me',
            requestBody: {
                aggregateBy: [{ dataTypeName: 'com.google.step_count.delta' }],
                // Usamos 7 días para evitar el error "duration too large"
                bucketByTime: { durationMillis: 604800000 }, 
                startTimeMillis: startTime,
                endTimeMillis: endTime,
            },
        });

        // AGRUPACIÓN MANUAL POR MESES (PASOS)
        const healthByMonth = resHealth.data.bucket.reduce((acc, b) => {
            const month = new Date(parseInt(b.startTimeMillis)).toISOString().slice(0, 7);
            const steps = b.dataset[0].point[0]?.value[0]?.intVal || 0;
            acc[month] = (acc[month] || 0) + steps;
            return acc;
        }, {});

        const formattedHealth = Object.keys(healthByMonth).map(month => ({
            date: month,
            steps: healthByMonth[month]
        }));

        // AGRUPACIÓN MANUAL POR MESES (VENTAS)
        const salesByMonth = salesData.reduce((acc, item) => {
            const month = item.date.slice(0, 7); 
            acc[month] = (acc[month] || 0) + (item.total || 0);
            return acc;
        }, {});

        const formattedSales = Object.keys(salesByMonth).map(month => ({
            date: month,
            total: salesByMonth[month]
        }));

        return json({ salesData: formattedSales, healthStats: formattedHealth });

    } catch (error) {
        console.error("❌ Error en Proxy:", error.message);
        return json({ error: error.message }, { status: 500 });
    }
};