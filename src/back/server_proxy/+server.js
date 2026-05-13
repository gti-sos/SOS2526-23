require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const { google } = require('googleapis');

const paths = '/api/proxy-data'; 
const app = express();

app.use(cookieParser());

app.use(paths, async function(req, res) {
    console.log('piped: ' + req.url);

    const token = req.cookies.google_calendar_token;

    if (!token) {
        return res.status(401).json({ error: 'No autenticado en Google' });
    }

    try {
        const resAds = await fetch('https://sos2526-23.onrender.com/api/v2/global-ads-performance');
        if (!resAds.ok) throw new Error("Fallo al conectar con la API de Ads");
        const adsData = await resAds.json();

        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID_DAVID,
            process.env.GOOGLE_CLIENT_SECRET_DAVID
        );
        
        oauth2Client.setCredentials({ access_token: token });
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        const resEvents = await calendar.events.list({
            calendarId: 'primary',
            timeMin: (new Date('2024-01-01')).toISOString(),
            maxResults: 1000,
            singleEvents: true,
            orderBy: 'startTime',
        });
        
        const events = (resEvents.data.items || []).map(event => ({
            date: event.start.date || (event.start.dateTime ? event.start.dateTime.split('T')[0] : null),
            title: event.summary || "Evento sin título"
        })).filter(e => e.date !== null);

        res.json({ adsData, events });

    } catch (error) {
        console.error("❌ Error en el servidor API-Calendar:", error.message);
        res.status(500).json({ error: "Error interno del servidor", detalle: error.message });
    }
});

app.use(express.static('.'));
app.listen(process.env.PORT || 8080, () => {
    console.log('Proxy escuchando en el puerto ' + (process.env.PORT || 8080));
});