import { Router } from "express";
import { bucket } from "../firebase.js";
import { v4 as uuidv4 } from "uuid";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const file = req.body.file; // base64 string
    const originalname = req.body.filename;

    if (!file || !originalname) return res.status(400).json({ error: "File and filename required" });

    const buffer = Buffer.from(file, "base64");
    const filename = `${Date.now()}_${originalname}`;
    const blob = bucket.file(filename);

    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: req.body.mimetype || "application/octet-stream",
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

    blobStream.end(buffer);
  } catch (err) {
    console.error("🔥 Unexpected error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
