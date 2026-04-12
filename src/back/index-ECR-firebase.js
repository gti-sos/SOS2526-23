import dotenv from 'dotenv';
dotenv.config();

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import session from 'express-session';

// =====================================================================
// INICIO CÓDIGO EXTRA: Firebase como persistencia
// =====================================================================
const serviceAccount = process.env.FIREBASE_CREDENTIALS 
    ? JSON.parse(process.env.FIREBASE_CREDENTIALS)
    : JSON.parse(readFileSync('./firebase-credentials.json', 'utf8'));

console.log('Firebase credentials loaded:', serviceAccount ? 'OK' : 'FAILED'); // 👈 debug

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const firestore = admin.firestore();
const coleccion = firestore.collection('daily-global-stock-market-indicators');
// =====================================================================
// FIN CÓDIGO EXTRA Firebase
// =====================================================================

const SECRET_KEY = "clave_super_secreta_cueva_extra";

function verificarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(403).json({ message: "Forbidden: No se proporcionó un token de autenticación." });
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(403).json({ message: "Forbidden: Formato de token inválido." });
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ message: "Unauthorized: Token no válido o expirado." });
        req.user = decoded;
        next();
    });
}

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BASE_URL || 'http://localhost:10000'}/auth/google/callback`
}, (accessToken, refreshToken, profile, done) => done(null, profile)));

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: `${process.env.BASE_URL || 'http://localhost:10000'}/auth/github/callback`
}, (accessToken, refreshToken, profile, done) => done(null, profile)));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

const BASE_URL_API = "/api/v2";

const CAMPOS_REQUERIDOS = ['date', 'index_name', 'region', 'open', 'high', 'low', 'close', 'volume', 'daily_change_percent'];

function validarEstructura(body) {
    if (!body || typeof body !== 'object') return false;
    const tieneExactos = CAMPOS_REQUERIDOS.every(c => body.hasOwnProperty(c));
    const noTieneExtras = Object.keys(body).every(c => CAMPOS_REQUERIDOS.includes(c));
    return tieneExactos && noTieneExtras;
}

export function loadBackEndECRFirebase(app) {
    const datosIndices = [
        { date: "2024-01-01", index_name: "S&P 500", region: "North America", open: 37740.57, high: 38171.04, low: 37552.74, close: 38125.97, volume: 34594679, daily_change_percent: 1.02 },
        { date: "2024-01-01", index_name: "NASDAQ Composite", region: "North America", open: 12519.37, high: 12926.14, low: 12249.50, close: 12654.15, volume: 39548535, daily_change_percent: 1.08 },
        { date: "2024-01-01", index_name: "Dow Jones", region: "North America", open: 39555.85, high: 39966.85, low: 39531.34, close: 39740.61, volume: 8398121, daily_change_percent: 0.47 },
        { date: "2024-01-01", index_name: "FTSE 100", region: "Europe", open: 18850.59, high: 19341.92, low: 18646.31, close: 19214.54, volume: 44763368, daily_change_percent: 1.93 },
        { date: "2024-01-01", index_name: "Nikkei 225", region: "Asia", open: 15708.36, high: 15734.90, low: 15130.62, close: 15396.17, volume: 41135726, daily_change_percent: -1.99 },
        { date: "2024-01-01", index_name: "Hang Seng", region: "Asia", open: 4023.53, high: 4218.66, low: 4007.54, close: 4104.75, volume: 39061503, daily_change_percent: 2.02 },
        { date: "2024-01-01", index_name: "DAX", region: "Europe", open: 19256.09, high: 19262.37, low: 18884.10, close: 18898.03, volume: 25254324, daily_change_percent: -1.86 },
        { date: "2024-01-01", index_name: "CAC 40", region: "Europe", open: 4264.55, high: 4502.93, low: 3711.50, close: 3997.91, volume: 12578040, daily_change_percent: -6.25 },
        { date: "2024-01-01", index_name: "SSE Composite", region: "Asia", open: 15689.85, high: 16064.29, low: 15579.67, close: 15986.31, volume: 35348196, daily_change_percent: 1.89 },
        { date: "2024-01-01", index_name: "KSE 100", region: "Asia", open: 11151.06, high: 11422.02, low: 11009.70, close: 11312.65, volume: 33074534, daily_change_percent: 1.45 }
    ];

    app.get(BASE_URL_API + '/daily-global-stock-market-indicators/loadInitialData', verificarToken, async (req, res) => {
        try {
            const snapshot = await coleccion.get();
            if (!snapshot.empty) return res.status(409).json({ message: "Conflict: Ya existen datos" });
            const batch = firestore.batch();
            datosIndices.forEach(dato => {
                const id = `${dato.region}_${dato.index_name}`.replace(/\s/g, '_');
                batch.set(coleccion.doc(id), dato);
            });
            await batch.commit();
            res.status(201).json(datosIndices);
        } catch (e) {
            res.status(500).json({ message: "Internal Server Error" });
        }
    });

    app.get(BASE_URL_API + '/daily-global-stock-market-indicators', async (req, res) => {
        try {
            let query = coleccion;
            if (req.query.region) query = query.where('region', '==', req.query.region);
            if (req.query.index_name) query = query.where('index_name', '==', req.query.index_name);
            if (req.query.date) query = query.where('date', '==', req.query.date);

            const snapshot = await query.get();
            let docs = snapshot.docs.map(doc => doc.data());

            const limit = parseInt(req.query.limit) || 10;
            const offset = parseInt(req.query.offset) || 0;
            docs = docs.slice(offset, offset + limit);

            res.status(200).json(docs);
        } catch (e) {
            res.status(500).json({ message: "Internal Server Error" });
        }
    });

    app.post(BASE_URL_API + '/daily-global-stock-market-indicators', verificarToken, async (req, res) => {
        try {
            const newData = req.body;
            if (!validarEstructura(newData)) return res.status(400).json({ message: "Bad Request: La estructura del JSON no es correcta" });

            const id = `${newData.region}_${newData.index_name}`.replace(/\s/g, '_');
            const doc = await coleccion.doc(id).get();
            if (doc.exists) return res.status(409).json({ message: "Conflict: El recurso ya existe" });

            await coleccion.doc(id).set(newData);
            res.status(201).json(newData);
        } catch (e) {
            res.status(500).json({ message: "Internal Server Error" });
        }
    });

    app.put(BASE_URL_API + '/daily-global-stock-market-indicators', (req, res) => {
        res.status(405).json({ message: "Method Not Allowed" });
    });

    app.delete(BASE_URL_API + '/daily-global-stock-market-indicators', verificarToken, async (req, res) => {
        try {
            const snapshot = await coleccion.get();
            const batch = firestore.batch();
            snapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            res.sendStatus(204);
        } catch (e) {
            res.status(500).json({ message: "Internal Server Error" });
        }
    });

    app.get(BASE_URL_API + '/daily-global-stock-market-indicators/:region/:index_name', async (req, res) => {
        try {
            const { region, index_name } = req.params;
            const id = `${region}_${index_name}`.replace(/\s/g, '_');
            const doc = await coleccion.doc(id).get();
            if (!doc.exists) return res.status(404).json({ message: "Not Found" });
            res.status(200).json(doc.data());
        } catch (e) {
            res.status(500).json({ message: "Internal Server Error" });
        }
    });

    app.post(BASE_URL_API + '/daily-global-stock-market-indicators/:region/:index_name', (req, res) => {
        res.status(405).json({ message: "Method Not Allowed" });
    });

    app.put(BASE_URL_API + '/daily-global-stock-market-indicators/:region/:index_name', verificarToken, async (req, res) => {
        try {
            const { region, index_name } = req.params;
            const updatedData = req.body;
            if (!validarEstructura(updatedData)) return res.status(400).json({ message: "Bad Request: La estructura del JSON no es correcta" });
            if (updatedData.region !== region || updatedData.index_name !== index_name) return res.status(400).json({ message: "Bad Request: Los IDs del body no coinciden con la URL" });

            const id = `${region}_${index_name}`.replace(/\s/g, '_');
            const doc = await coleccion.doc(id).get();
            if (!doc.exists) return res.status(404).json({ message: "Not Found" });

            await coleccion.doc(id).set(updatedData);
            res.status(200).json(updatedData);
        } catch (e) {
            res.status(500).json({ message: "Internal Server Error" });
        }
    });

    app.delete(BASE_URL_API + '/daily-global-stock-market-indicators/:region/:index_name', verificarToken, async (req, res) => {
        try {
            const { region, index_name } = req.params;
            const id = `${region}_${index_name}`.replace(/\s/g, '_');
            const doc = await coleccion.doc(id).get();
            if (!doc.exists) return res.status(404).json({ message: "Not Found" });
            await coleccion.doc(id).delete();
            res.sendStatus(204);
        } catch (e) {
            res.status(500).json({ message: "Internal Server Error" });
        }
    });
}