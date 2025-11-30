import admin from "firebase-admin";

let app = null;

try {
  if (!admin.apps.length) {
    const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64;

    if (!base64) {
      throw new Error("❌ FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 is missing");
    }

    const jsonString = Buffer.from(base64, "base64").toString("utf8");
    const serviceAccount = JSON.parse(jsonString);

    // Load bucket from environment variable
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET;

    if (!bucketName) {
      throw new Error("❌ FIREBASE_STORAGE_BUCKET env variable missing");
    }

    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: bucketName,   // ⬅️ IMPORTANT
    });

    console.log("🔥 Firebase Admin initialized successfully");
  } else {
    app = admin.app();
    console.log("🔥 Firebase Admin already initialized");
  }
} catch (error) {
  console.error("❌ Firebase Admin initialization FAILED:", error);
}

// Now initialize Firestore, Auth, Storage
let db = null;
let auth = null;
let bucket = null;

try {
  db = admin.firestore();
  auth = admin.auth();
  bucket = admin.storage().bucket();  // ⬅️ REQUIRED EXPORT
} catch (err) {
  console.error("⚠️ Firebase service initialization error:", err);
}

export { admin, db, auth, bucket };
