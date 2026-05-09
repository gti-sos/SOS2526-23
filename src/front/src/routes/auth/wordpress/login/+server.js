import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const GET = async () => {
    const clientId = env.WORDPRESS_CLIENT_ID; // Pon esto en tu .env
    const redirectUri = encodeURIComponent(`${env.BASE_URL}/auth/wordpress/callback`);
    
    // Al usar response_type=token, WP nos devolverá el token directamente en la URL
    const wpAuthUrl = `https://public-api.wordpress.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token`;

    throw redirect(302, wpAuthUrl);
};