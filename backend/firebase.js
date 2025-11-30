import admin from "firebase-admin";

let serviceAccount;

try {
  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64;

  if (!base64) {
    throw new Error("❌ FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 is NOT set.");
  }

  const jsonString = Buffer.from(base64, "base64").toString("utf8");
  serviceAccount = JSON.parse(jsonString);

} catch (error) {
  console.error("🔥 Firebase config load error:", error);
  process.exit(1);
}

// -------- SINGLE INITIALIZATION ONLY --------
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  }, "backend_app"); // UNIQUE NAME – prevents ANY duplication
}

export const bucket = admin.storage().bucket();
export const firestore = admin.firestore();
export default admin;
