import express from "express";
import cloudinary from "../utils/cloudinary.js";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { openai } from "../utils/openai.js";
import { verifyFirebaseToken } from "./middlewares.js";
import admin from "firebase-admin";

const router = express.Router();

// ------------------------- TEMP DOWNLOAD -----------------------------------
async function downloadToTemp(url) {
  const res = await fetch(url);
  const buffer = Buffer.from(await res.arrayBuffer());

  const tmp = path.join(process.cwd(), "backend", "uploads");
  if (!fs.existsSync(tmp)) fs.mkdirSync(tmp, { recursive: true });

  const fname = path.join(tmp, `dl_${Date.now()}.webm`);
  fs.writeFileSync(fname, buffer);
  return fname;
}

// -------------------------- PROMPT BUILDER -----------------------------------
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

// ---------------------------- MAIN ROUTE -------------------------------------
router.post("/", verifyFirebaseToken, async (req, res) => {
  try {
    // ------------------- FILE CHECK -------------------------
    if (!req.files || !req.files.audio) {
      return res.status(400).json({ error: "No audio file" });
    }

    const audio = req.files.audio;

    // ------------------- UPLOAD TO CLOUDINARY -------------------------
    const upload = await cloudinary.uploader.upload(audio.tempFilePath, {
      resource_type: "video",
      folder: "speaking_test",
    });

    const audioUrl = upload.secure_url;

    // ------------------- DOWNLOAD BACK FOR WHISPER -------------------------
    const tmpFile = await downloadToTemp(audioUrl);

    // ------------------- TRANSCRIPTION -------------------------
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tmpFile),
      model: "whisper-1",
    });

    const transcript = transcription.text || "";

    // ------------------- GPT EVALUATION -------------------------
    const taskContext = req.body.taskContextJson
      ? JSON.parse(req.body.taskContextJson)
      : {};

    const prompt = buildBandPrompt(transcript, taskContext);

    const gptResp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert IELTS examiner." },
        { role: "user", content: prompt },
      ],
      temperature: 0,
      max_tokens: 400,
    });

    const analysisText = gptResp.choices[0].message.content;

    let analysisJSON;
    try {
      const idx = analysisText.indexOf("{");
      analysisJSON = JSON.parse(analysisText.slice(idx));
    } catch (e) {
      analysisJSON = { raw: analysisText };
    }

    const overall =
      analysisJSON.overall_band ||
      (analysisJSON.fluency +
        analysisJSON.grammar +
        analysisJSON.vocabulary +
        analysisJSON.pronunciation) /
        4;

    // ------------------- SAVE TO FIRESTORE -------------------------
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(
          JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        ),
      });
    }

    const db = admin.firestore();

    await db.collection("tests").add({
      user_id: req.user.uid,
      task_index: Number(req.body.taskIndex || 0),
      audio_url: audioUrl,
      transcript,
      analysis: analysisJSON,
      overall,
      created_at: new Date(),
    });

    // ------------------- CLEANUP -------------------------
    try {
      fs.unlinkSync(tmpFile);
    } catch (e) {}

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
