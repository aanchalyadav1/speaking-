// backend/routes/upload.js
import { Router } from "express";
import multer from "multer";
import { bucket } from "../firebase.js";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// Multer memory storage (keeps file in memory)
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/upload
// Expects FormData with field "audio" (Blob)
router.post("/", upload.single("audio"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "File is required" });
    }

    const filename = `${Date.now()}_${file.originalname}`;
    const blob = bucket.file(filename);

    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype,
        metadata: { firebaseStorageDownloadTokens: uuidv4() },
      },
    });

    blobStream.on("error", (err) => {
      console.error("🔥 Upload error:", err);
      res.status(500).json({ error: "Upload failed" });
    });

    blobStream.on("finish", () => {
      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
        filename
      )}?alt=media`;
      res.status(200).json({ url: publicUrl });
    });

    // End stream by sending file buffer
    blobStream.end(file.buffer);

  } catch (err) {
    console.error("🔥 Unexpected error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
