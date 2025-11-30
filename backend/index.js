import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import fs from "fs";
import path from "path";

import "./firebase.js";
import { bucket } from "./firebase.js";
import { initFirestore } from "./utils/firestore.js";

// Routes
import uploadRoute from "./routes/upload.js";
import generateRoute from "./routes/generate.js";
import ttsRoute from "./routes/tts.js";
import adminRoute from "./routes/admin.js";

const app = express();

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(fileUpload({ useTempFiles: true, tempFileDir: "/tmp/" }));

// Firestore init
await initFirestore();

// Debug Firebase bucket
console.log("🔥 Firebase Storage Bucket:", bucket?.name);

// Routes
app.use("/api/upload", uploadRoute);
app.use("/api/generate", generateRoute);
app.use("/api/tts", ttsRoute);
app.use("/api/admin", adminRoute);

// Static folder for TTS audio
const ttsFolder = path.join(process.cwd(), "backend", "uploads");
if (!fs.existsSync(ttsFolder)) fs.mkdirSync(ttsFolder, { recursive: true });
app.use("/static", express.static(ttsFolder));

// Root
app.get("/", (req, res) => res.send("🎤 Speaking Test Backend running!"));

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Backend listening on port ${PORT}`));
