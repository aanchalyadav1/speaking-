import admin from "firebase-admin";

let app = null;

try {
  if (!admin.apps.length) {
    const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64;

    if (!base64) {
      throw new Error("❌ FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 is missing");
    }

    // Decode Base64 → JSON object
    const jsonString = Buffer.from(base64, "base64").toString("utf8");
    const serviceAccount = JSON.parse(jsonString);

    // Initialize Firebase Admin
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: "speech-app-243b6.appspot.com", // <-- IMPORTANT
    });

    console.log("🔥 Firebase Admin initialized successfully");
  } else {
    app = admin.app();
    console.log("🔥 Firebase Admin reused");
  }
} catch (error) {
  console.error("❌ Firebase Admin initialization FAILED:", error);
}

// ----------------------------------------
// Initialize Firestore, Auth, Storage
// ----------------------------------------
let db = null;
let auth = null;
let bucket = null;

try {
  db = admin.firestore();
  auth = admin.auth();
  bucket = admin.storage().bucket(); // <-- REQUIRED
} catch (err) {
  console.error("⚠️ Firestore/Auth/Storage init failed:", err);
}

export { admin, db, auth, bucket };
