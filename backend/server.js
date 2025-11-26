import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import dotenv from "dotenv";
import path from "path";
import uploadRoute from "./routes/upload.js";
import { initFirestore } from "./utils/firestore.js";
import admin from "firebase-admin";

dotenv.config();

const app = express();

// ------------------ CORS ---------------------
app.use(
  cors({
    origin: "*",
  })
);

// ------------------ BODY PARSERS ---------------------
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// ------------------ FILE UPLOAD ---------------------
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// ------------------ FIREBASE ADMIN INIT ---------------------
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    ),
  });
}

// ------------------ OPTIONAL CHECK ---------------------
initFirestore();

// ------------------ ROUTES ---------------------
app.use("/api/upload", uploadRoute);

// ------------------ ROOT TEST ROUTE ---------------------
app.get("/", (req, res) => {
  res.json({ message: "Backend is running 🚀" });
});

// ------------------ RENDER PORT ---------------------
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
