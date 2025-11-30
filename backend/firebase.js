import admin from "firebase-admin";

let app = null;

try {
  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64;

  if (!base64) {
    throw new Error("❌ FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 is NOT SET in Render!");
  }

  const jsonString = Buffer.from(base64, "base64").toString("utf8");
  const serviceAccount = JSON.parse(jsonString);

  // -------- Initialize only if no apps exist --------
  if (!admin.apps.length) {
    app = admin.initializeApp(
      {
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      },
      "main-backend" // unique name to avoid duplicates
    );

    console.log("🔥 Firebase Admin initialized successfully");
  } else {
    app = admin.app("main-backend");
  }

} catch (err) {
  console.error("❌ Firebase init FAILED:", err.message);
  process.exit(1); // stop server to avoid hidden issues
}

// -------- SAFE EXPORTS --------
export const bucket = admin.storage().bucket();
export const firestore = admin.firestore();
export default admin;
