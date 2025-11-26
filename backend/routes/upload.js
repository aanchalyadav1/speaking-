import express from "express";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";
import { openai } from "../utils/openai.js";
import { verifyFirebaseToken } from "./middlewares.js";
import admin from "firebase-admin";

const router = express.Router();

// ---------------- FIREBASE INIT (ONLY ONCE) ------------------
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    ),
  });
}
const db = admin.firestore();

// ---------------- PROMPT BUILDER ------------------
function buildBandPrompt(transcript, taskContext = {}) {
  return `
You are an experienced IELTS examiner. 
Return STRICT JSON only in this format:

{
  "fluency": <0-9>,
  "grammar": <0-9>,
  "vocabulary": <0-9>,
  "pronunciation": <0-9>,
  "overall_band": <0-9>,
  "advice": "short advice"
}

Transcript: "${transcript.replace(/\n/g, " ")}"
Task context: ${JSON.stringify(taskContext)}
Return ONLY JSON.
`;
}

// ---------------- MAIN UPLOAD ROUTE ------------------
router.post("/", verifyFirebaseToken, async (req, res) => {
  try {
    if (!req.files || !req.files.audio) {
      return res.status(400).json({ error: "No audio file" });
    }

    const audio = req.files.audio;

    // ---------------- CLOUDINARY UPLOAD (NO RE-DOWNLOAD) ------------------
    const upload = await cloudinary.uploader.upload(audio.tempFilePath, {
      resource_type: "video",
      folder: "speaking_test",
    });

    const audioUrl = upload.secure_url;

    // ---------------- DIRECT WHISPER TRANSCRIPTION ------------------
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audio.tempFilePath),
      model: "gpt-4o-transcribe",
    });

    const transcript = transcription.text || "";

    // ---------------- GPT EVALUATION ------------------
    const taskContext = req.body.taskContextJson
      ? JSON.parse(req.body.taskContextJson)
      : {};

    const prompt = buildBandPrompt(transcript, taskContext);

    const evalResp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an IELTS examiner." },
        { role: "user", content: prompt },
      ],
      temperature: 0,
      max_tokens: 300,
    });

    let analysisText = evalResp.choices[0].message.content;
    let analysisJSON;

    try {
      analysisJSON = JSON.parse(
        analysisText.slice(analysisText.indexOf("{"))
      );
    } catch {
      analysisJSON = { raw: analysisText };
    }

    const overall =
      analysisJSON.overall_band ||
      (analysisJSON.fluency +
        analysisJSON.grammar +
        analysisJSON.vocabulary +
        analysisJSON.pronunciation) /
        4;

    // ---------------- SAVE TO FIRESTORE ------------------
    await db.collection("tests").add({
      user_id: req.user.uid,
      task_index: Number(req.body.taskIndex || 0),
      audio_url: audioUrl,
      transcript,
      analysis: analysisJSON,
      overall,
      created_at: new Date(),
    });

    return res.json({
      transcript,
      analysis: analysisJSON,
      overall,
      audioUrl,
    });
  } catch (e) {
    console.error("Upload handler error:", e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
