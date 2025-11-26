import admin from "firebase-admin";

let serviceAccount;

try {
  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64;

  if (!base64) {
    throw new Error("❌ FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 is NOT set.");
  }

  // Decode Base64 → original JSON string
  const jsonString = Buffer.from(base64, "base64").toString("utf8");

  // Parse JSON
  serviceAccount = JSON.parse(jsonString);

} catch (error) {
  console.error("🔥 Firebase config load error:", error);
  process.exit(1); // Stop backend immediately so no hidden errors
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // example: aanchal.appspot.com
  });
}

export const bucket = admin.storage().bucket();
export default admin;
