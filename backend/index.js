import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import uploadRoute from './routes/upload.js';
import generateRoute from './routes/generate.js';
import ttsRoute from './routes/tts.js';
import adminRoute from './routes/admin.js';
import { initFirestore } from './utils/firestore.js';

dotenv.config();
const app = express();

/* ------------------- CSP HEADERS ------------------- */
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    `
      default-src * 'unsafe-inline' 'unsafe-eval' blob: data:;
      font-src https://fonts.gstatic.com data:;
      style-src https://fonts.googleapis.com 'unsafe-inline' data:;
      img-src https://res.cloudinary.com data: blob: *;
      media-src blob: data: https://res.cloudinary.com;
      script-src * 'unsafe-inline' 'unsafe-eval';
      connect-src *;
    `.replace(/\s+/g, ' ')
  );
  next();
});
/* -------------------------------------------------- */

/* ------------------- CORS ------------------- */
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());
app.use(fileUpload({ useTempFiles: true, tempFileDir: '/tmp/' }));

/* -------------------- FIREBASE ADMIN -------------------- */
if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64) {
  try {
    const sa = Buffer.from(
      process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64,
      'base64'
    ).toString('utf8');

    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(sa)),
    });

    console.log('Firebase admin initialized.');
  } catch (e) {
    console.error('Firebase admin init failed:', e.message);
  }
} else {
  console.warn(
    'FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 not set; protected routes will fail.'
  );
}
/* ------------------------------------------------------------- */

/* -------------------- INIT FIRESTORE -------------------- */
await initFirestore();

/* -------------------- API ROUTES -------------------- */
app.use('/api/upload', uploadRoute);
app.use('/api/generate', generateRoute);
app.use('/api/tts', ttsRoute);
app.use('/api/admin', adminRoute);

/* -------------------- STATIC UPLOADS -------------------- */
app.use('/static', express.static('uploads'));

/* -------------------- HEALTH CHECK -------------------- */
app.get('/', (req, res) => {
  res.send('🎤 Speaking Test Backend is running. Use /api routes.');
});

/* -------------------- START SERVER -------------------- */
const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => console.log(`Backend API listening on ${PORT}`));
