import admin from 'firebase-admin';
import 'dotenv/config';

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.SERVICE_ACCOUNT)),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
}

const bucket = admin.storage().bucket();

export default bucket;