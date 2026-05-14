import { redirect } from '@sveltejs/kit';
import { google } from 'googleapis';
import { env } from '$env/dynamic/private';

export const GET = () => {
    const oauth2Client = new google.auth.OAuth2(
        env.GOOGLE_CLIENT_ID_MARIA,
        env.GOOGLE_CLIENT_SECRET_MARIA,
        `${env.BASE_URL}/auth/health/callback`
    );

    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/fitness.activity.read'],
        prompt: 'consent'
    });

    throw redirect(302, url);
};