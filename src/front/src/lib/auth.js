import { createAuth0Client } from '@auth0/auth0-spa-js';

let auth0Client;

export async function initAuth() {
    auth0Client = await createAuth0Client({
        // CORRECCIÓN: Quitamos el "https://" y la "/" final
        domain: 'dev-dxwqup0hqj5q6tuz.eu.auth0.com', 
        clientId: 'XX4N1x0i9z10kmc5wv7dyfDcfpX4RMHZ',       
        authorizationParams: {
            redirect_uri: window.location.origin + '/global-ads-performance',
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
    await auth0Client.logout({ logoutParams: { returnTo: window.location.origin + '/global-ads-performance' } });
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