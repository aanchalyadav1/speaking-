// backend/routes/upload.js
import express from 'express';
import cloudinary from '../utils/cloudinary.js';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { openai } from '../utils/openai.js';
import { verifyFirebaseToken } from './middlewares.js';

const router = express.Router();

/**
 * Download remote file to backend/uploads and return local path.
 */
async function downloadToTemp(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download audio (${res.status})`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const tmp = path.join(process.cwd(), 'backend', 'uploads');
  if (!fs.existsSync(tmp)) fs.mkdirSync(tmp, { recursive: true });
  const fname = path.join(tmp, `dl_${Date.now()}.webm`);
  fs.writeFileSync(fname, buffer);
  return fname;
}

/**
 * Prompt builder: strict instruction to return only valid JSON.
 */
function buildBandPrompt(transcript, taskContext = '') {
  return `You are an experienced IELTS examiner. Evaluate the following spoken response and return a JSON object exactly in this format:

{
  "fluency": <0-9 float>,
  "grammar": <0-9 float>,
  "vocabulary": <0-9 float>,
  "pronunciation": <0-9 float>,
  "overall_band": <0-9 float>,
  "advice": "brief advice"
}

Transcript: "${transcript.replace(/\n/g, ' ')}"
Task context: ${JSON.stringify(taskContext)}

Return ONLY valid JSON (no explanation).`;
}

router.post('/', verifyFirebaseToken, async (req, res) => {
  let tmpFile = null;
  try {
    if (!req.files || !req.files.audio) return res.status(400).json({ error: 'No audio file' });
    const audio = req.files.audio;

    // Upload to Cloudinary (video resource type to accept webm)
    const upload = await cloudinary.uploader.upload(audio.tempFilePath, {
      resource_type: 'video',
      folder: 'speaking_test',
    });
    const audioUrl = upload.secure_url;

    // Download to local temp for whisper
    tmpFile = await downloadToTemp(audioUrl);

    // Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tmpFile),
      model: 'whisper-1',
    });
    const transcript = transcription.text || transcription.data?.text || '';

    // Build prompt and call LLM for scoring
    const taskContext = req.body.taskContextJson ? JSON.parse(req.body.taskContextJson) : {};
    const prompt = buildBandPrompt(transcript, taskContext);

    const gptResp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert English speaking examiner.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0,
      max_tokens: 450,
    });

    // NEW SDK: read choices from root .choices
    const analysisText = gptResp.choices?.[0]?.message?.content || '';
    let analysisJSON;
    try {
      // try to slice at first { to be resilient to small prefixes
      const idx = analysisText.indexOf('{');
      analysisJSON = idx >= 0 ? JSON.parse(analysisText.slice(idx)) : JSON.parse(analysisText);
    } catch (e) {
      // If parsing fails, return raw text so frontend can show it
      analysisJSON = { raw: analysisText };
    }

    // Compute overall_band if not present
    const overall_band =
      analysisJSON.overall_band ??
      (((analysisJSON.fluency || 0) + (analysisJSON.grammar || 0) + (analysisJSON.vocabulary || 0) + (analysisJSON.pronunciation || 0)) / 4) ||
      null;

    // Save to Firestore (best-effort; do not fail the request if Firestore errors)
    try {
      const admin = await import('firebase-admin');
      const db = admin.firestore();
      await db.collection('tests').add({
        user_id: req.user?.uid || null,
        task_index: Number(req.body.taskIndex || 0),
        audio_url: audioUrl,
        transcript,
        analysis: analysisJSON,
        overall_band,
        created_at: new Date(),
      });
    } catch (e) {
      console.warn('Firestore save failed:', e?.message || e);
    }

    // Cleanup tmp
    try { if (tmpFile && fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile); } catch (e) {}

    // Respond with normalized payload the frontend expects
    res.json({
      transcript,
      analysis: analysisJSON,
      overall_band,
      audioUrl,
    });
  } catch (e) {
    console.error('Upload handler error:', e?.message || e);
    // attempt cleanup
    try { if (tmpFile && fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile); } catch (ee) {}
    res.status(500).json({ error: e?.message || String(e) });
  }
});

export default router;
