// backend/routes/upload.js
import { Router } from "express";
import multer from "multer";
import { bucket } from "../firebase.js";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// Multer memory storage for audio files
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Audio file is required" });
    }

    const file = req.file;
    const filename = `${Date.now()}_${file.originalname}`;
    const blob = bucket.file(filename);

    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype || "audio/webm",
        metadata: { firebaseStorageDownloadTokens: uuidv4() },
      },
    });

    blobStream.on("error", (err) => {
      console.error("🔥 Firebase upload error:", err);
      return res.status(500).json({ error: "Firebase upload failed", details: err.message });
    });

    blobStream.on("finish", () => {
      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
        filename
      )}?alt=media`;
      return res.status(200).json({ url: publicUrl });
    });

    blobStream.end(file.buffer);
  } catch (err) {
    console.error("🔥 Unexpected server error:", err);
    return res.status(500).json({ error: "Unexpected server error", details: err.message });
  }
});

export default router;
