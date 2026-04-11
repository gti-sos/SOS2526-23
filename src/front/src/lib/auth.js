import { createAuth0Client } from '@auth0/auth0-spa-js';

let auth0Client;

export async function initAuth() {
    auth0Client = await createAuth0Client({
        // CORRECCIÓN: Quitamos el "https://" y la "/" final
        domain: 'dev-dxwqup0hqj5q6tuz.eu.auth0.com', 
        clientId: '8PwsroYENDJ18pQnpcW98eW10w8kd9tO',       
        authorizationParams: {
            redirect_uri: window.location.origin,
            audience: 'https://api.sos2526-23.com'
        }
    });
    return auth0Client;
}

// Función para manejar el login
export async function login() {
    await auth0Client.loginWithRedirect();
}

// Función para manejar el logout
export async function logout() {
    await auth0Client.logout({ logoutParams: { returnTo: window.location.origin } });
}

// Función para obtener el token de acceso
export async function getToken() {
    try {
        return await auth0Client.getTokenSilently();
    } catch (e) {
        console.error("Error obteniendo el token", e);
        return null;
    }
}