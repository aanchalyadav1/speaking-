import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import dotenv from "dotenv";

import "./firebase.js"; // <-- auto initializes Firebase ONE TIME

import uploadRoute from "./routes/upload.js";
import generateRoute from "./routes/generate.js";
import ttsRoute from "./routes/tts.js";
import adminRoute from "./routes/admin.js";
import { initFirestore } from "./utils/firestore.js";

dotenv.config();

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(fileUpload({ useTempFiles: true, tempFileDir: "/tmp/" }));

await initFirestore();

app.use("/api/upload", uploadRoute);
app.use("/api/generate", generateRoute);
app.use("/api/tts", ttsRoute);
app.use("/api/admin", adminRoute);

app.get("/", (req, res) => {
  res.send("🎤 Speaking Test Backend running!");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Backend listening on ${PORT}`));
