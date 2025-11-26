import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import dotenv from "dotenv";
import admin from "firebase-admin";

import uploadRoute from "./routes/upload.js";
import generateRoute from "./routes/generate.js";
import ttsRoute from "./routes/tts.js";
import adminRoute from "./routes/admin.js";
import { initFirestore } from "./utils/firestore.js";

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
    `.replace(/\s+/g, " ")
  );
  next();
});

/* ------------------- CORS ------------------- */
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());
app.use(fileUpload({ useTempFiles: true, tempFileDir: "/tmp/" }));

/* ------------------- FIREBASE ADMIN INITIALIZATION ------------------- */

let firebaseInitialized = false;

try {
  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64;

  if (!base64) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 is missing");
  }

  const jsonString = Buffer.from(base64, "base64").toString("utf8");
  const serviceAccount = JSON.parse(jsonString);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // example: myapp.appspot.com
  });

  firebaseInitialized = true;
  console.log("🔥 Firebase Admin initialized successfully");

} catch (err) {
  console.error("❌ Firebase Admin initialization FAILED:", err.message);
}

/* -------------------- INIT FIRESTORE -------------------- */
if (firebaseInitialized) {
  await initFirestore();
} else {
  console.log("⚠️ Firestore NOT initialized because Firebase failed");
}

/* -------------------- ROUTES -------------------- */
app.use("/api/upload", uploadRoute);
app.use("/api/generate", generateRoute);
app.use("/api/tts", ttsRoute);
app.use("/api/admin", adminRoute);

/* -------------------- STATIC FILES -------------------- */
app.use("/static", express.static("uploads"));

/* -------------------- HEALTH CHECK -------------------- */
app.get("/", (req, res) => {
  res.send("🎤 Speaking Test Backend is running. Use /api routes.");
});

/* -------------------- START SERVER -------------------- */
const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () =>
  console.log(`🚀 Backend API listening on port ${PORT}`)
);
