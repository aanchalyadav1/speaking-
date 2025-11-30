import admin from "firebase-admin";

let firebaseApp;

try {
  // Prevent "already exists" errors
  if (!admin.apps.length) {
    const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64;

    if (!base64) {
      throw new Error("Base64 Firebase credentials missing.");
    }

    const jsonString = Buffer.from(base64, "base64").toString("utf8");
    const serviceAccount = JSON.parse(jsonString);

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    console.log("🔥 Firebase Admin initialized successfully");
  } else {
    firebaseApp = admin.app();
    console.log("🔥 Firebase app reused");
  }
} catch (error) {
  console.error("❌ Firebase initialization FAILED:", error);
}

const db = admin.firestore();   // <--- SAFE now because initializeApp() ran
const auth = admin.auth();

export { admin, db, auth };
