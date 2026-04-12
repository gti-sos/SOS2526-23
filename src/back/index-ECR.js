import dotenv from 'dotenv';
dotenv.config();

import util from 'util';
util.isDate = function(d) { return d instanceof Date; };
util.isRegExp = function(re) { return re instanceof RegExp; };

import Datastore from 'nedb';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import session from 'express-session';

// =====================================================================
// INICIO CÓDIGO EXTRA: Integración de JWT (JSON Web Tokens)
// =====================================================================
import jwt from 'jsonwebtoken';

const SECRET_KEY = "clave_super_secreta_cueva_extra";

function verificarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(403).json({ message: "Forbidden: No se proporcionó un token de autenticación." });
    }

    const token = authHeader.split(' ')[1]; 
    if (!token) {
        return res.status(403).json({ message: "Forbidden: Formato de token inválido." });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Unauthorized: Token no válido o expirado." });
        }
        req.user = decoded;
        next();
    });
}
// =====================================================================
// FIN CÓDIGO EXTRA JWT
// =====================================================================

// =====================================================================
// INICIO CÓDIGO EXTRA: OAuth con Google y GitHub
// =====================================================================
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BASE_URL || 'http://localhost:10000'}/auth/google/callback`
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: `${process.env.BASE_URL || 'http://localhost:10000'}/auth/github/callback`
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
// =====================================================================
// FIN CÓDIGO EXTRA OAuth
// =====================================================================

const BASE_URL_API = "/api/v1";

const CAMPOS_REQUERIDOS = ['date', 'index_name', 'region', 'open', 'high', 'low', 'close', 'volume', 'daily_change_percent'];

function validarEstructura(body) {
    if (!body || typeof body !== 'object') return false;
    const tieneExactos = CAMPOS_REQUERIDOS.every(c => body.hasOwnProperty(c));
    const noTieneExtras = Object.keys(body).every(c => CAMPOS_REQUERIDOS.includes(c));
    return tieneExactos && noTieneExtras;
}

function limpiarId(doc) {
    const copy = { ...doc };
    delete copy._id;
    return copy;
}

export function loadBackEndECR(app) {
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

    const db = new Datastore({ filename: './dailyIndicators.db', autoload: true });

    app.use(session({
        secret: 'session_secret_cueva',
        resave: false,
        saveUninitialized: false
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    app.get('/auth/google',
        passport.authenticate('google', { scope: ['profile', 'email'] })
    );

    app.get('/auth/google/callback',
        passport.authenticate('google', { failureRedirect: '/auth/failure' }),
        (req, res) => {
            const token = jwt.sign(
                { user: req.user.displayName, email: req.user.emails[0].value },
                SECRET_KEY,
                { expiresIn: '1h' }
            );
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            res.redirect(`${frontendUrl}/auth/success?token=${token}`);
        }
    );

    app.get('/auth/github',
        passport.authenticate('github', { scope: ['user:email'], prompt: 'login' })
    );

    app.get('/auth/github/callback',
        passport.authenticate('github', { failureRedirect: '/auth/failure' }),
        (req, res) => {
            const token = jwt.sign(
                { user: req.user.displayName || req.user.username },
                SECRET_KEY,
                { expiresIn: '1h' }
            );
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            res.redirect(`${frontendUrl}/auth/success?token=${token}`);
        }
    );

    app.get('/auth/failure', (req, res) => {
        res.status(401).json({ message: 'Error de autenticación OAuth' });
    });

    app.post(BASE_URL_API + '/login', (req, res) => {
        const { username, password } = req.body;

        if (username === "admin" && password === "password123") {
            const token = jwt.sign({ user: username }, SECRET_KEY, { expiresIn: '1h' });
            res.status(200).json({ token: token });
        } else {
            res.status(401).json({ message: "Unauthorized: Usuario o contraseña incorrectos" });
        }
    });

    app.get(BASE_URL_API + '/daily-global-stock-market-indicators/docs', (req, res) => {
        res.redirect('https://documenter.getpostman.com/view/52708852/2sBXigLYL8');
    });

    app.get(BASE_URL_API + '/daily-global-stock-market-indicators/loadInitialData', verificarToken, (req, res) => {
        db.find({}, (err, docs) => {
            if (err) return res.status(500).json({ message: "Internal Server Error" });

            if (docs.length === 0) {
                db.insert(datosIndices, (err, newDocs) => {
                    if (err) return res.status(500).json({ message: "Internal Server Error" });
                    res.status(201).json(newDocs.map(limpiarId));
                });
            } else {
                res.status(409).json({ message: "Conflict: Ya existen datos" });
            }
        });
    });

    app.get(BASE_URL_API + '/daily-global-stock-market-indicators', (req, res) => {
        const searchQuery = {};

        if (req.query.date)       searchQuery.date       = new RegExp(req.query.date, 'i');
        if (req.query.index_name) searchQuery.index_name = new RegExp(req.query.index_name, 'i');
        if (req.query.region)     searchQuery.region     = new RegExp(req.query.region, 'i');

        if (req.query.open)                 searchQuery.open                 = parseFloat(req.query.open);
        if (req.query.high)                 searchQuery.high                 = parseFloat(req.query.high);
        if (req.query.low)                  searchQuery.low                  = parseFloat(req.query.low);
        if (req.query.close)                searchQuery.close                = parseFloat(req.query.close);
        if (req.query.volume)               searchQuery.volume               = parseInt(req.query.volume);
        if (req.query.daily_change_percent) searchQuery.daily_change_percent = parseFloat(req.query.daily_change_percent);

        let dbQuery = db.find(searchQuery);

        if (req.query.limit) {
            const limit = parseInt(req.query.limit);
            if (!isNaN(limit) && limit >= 0) dbQuery = dbQuery.limit(limit);
        }
        if (req.query.offset) {
            const offset = parseInt(req.query.offset);
            if (!isNaN(offset) && offset >= 0) dbQuery = dbQuery.skip(offset);
        }

        dbQuery.exec((err, docs) => {
            if (err) return res.status(500).json({ message: "Internal Server Error" });
            res.status(200).json(docs.map(limpiarId));
        });
    });

    app.post(BASE_URL_API + '/daily-global-stock-market-indicators', verificarToken, (req, res) => {
        const newData = req.body;

        if (!validarEstructura(newData)) {
            return res.status(400).json({ message: "Bad Request: La estructura del JSON no es correcta" });
        }

        db.find({ region: newData.region, index_name: newData.index_name }, (err, docs) => {
            if (err) return res.status(500).json({ message: "Internal Server Error" });

            if (docs.length > 0) {
                return res.status(409).json({ message: "Conflict: El recurso ya existe" });
            }

            db.insert(newData, (err, newDoc) => {
                if (err) return res.status(500).json({ message: "Internal Server Error" });
                res.status(201).json(limpiarId(newDoc));
            });
        });
    });

    app.put(BASE_URL_API + '/daily-global-stock-market-indicators', (req, res) => {
        res.status(405).json({ message: "Method Not Allowed" });
    });

    app.delete(BASE_URL_API + '/daily-global-stock-market-indicators', verificarToken, (req, res) => {
        db.remove({}, { multi: true }, (err) => {
            if (err) return res.status(500).json({ message: "Internal Server Error" });
            res.sendStatus(204);
        });
    });

    app.get(BASE_URL_API + '/daily-global-stock-market-indicators/:region/:index_name', (req, res) => {
        const { region, index_name } = req.params;

        db.find({ region, index_name }, (err, docs) => {
            if (err) return res.status(500).json({ message: "Internal Server Error" });

            if (docs.length > 0) {
                res.status(200).json(limpiarId(docs[0]));
            } else {
                res.status(404).json({ message: "Not Found" });
            }
        });
    });

    app.post(BASE_URL_API + '/daily-global-stock-market-indicators/:region/:index_name', (req, res) => {
        res.status(405).json({ message: "Method Not Allowed" });
    });

    app.put(BASE_URL_API + '/daily-global-stock-market-indicators/:region/:index_name', verificarToken, (req, res) => {
        const { region, index_name } = req.params;
        const updatedData = req.body;

        if (!validarEstructura(updatedData)) {
            return res.status(400).json({ message: "Bad Request: La estructura del JSON no es correcta" });
        }

        if (updatedData.region !== region || updatedData.index_name !== index_name) {
            return res.status(400).json({ message: "Bad Request: Los IDs del body no coinciden con la URL" });
        }

        db.update({ region, index_name }, { $set: updatedData }, {}, (err, numReplaced) => {
            if (err) return res.status(500).json({ message: "Internal Server Error" });

            if (numReplaced === 0) {
                return res.status(404).json({ message: "Not Found" });
            }

            db.find({ region, index_name }, (err, docs) => {
                if (err) return res.status(500).json({ message: "Internal Server Error" });
                res.status(200).json(limpiarId(docs[0]));
            });
        });
    });

    app.delete(BASE_URL_API + '/daily-global-stock-market-indicators/:region/:index_name', verificarToken, (req, res) => {
        const { region, index_name } = req.params;

        db.remove({ region, index_name }, {}, (err, numRemoved) => {
            if (err) return res.status(500).json({ message: "Internal Server Error" });

            if (numRemoved === 0) {
                return res.status(404).json({ message: "Not Found" });
            }

            res.sendStatus(204);
        });
    });
}