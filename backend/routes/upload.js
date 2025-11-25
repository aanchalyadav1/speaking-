import express from 'express';
import cloudinary from '../utils/cloudinary.js';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { openai } from '../utils/openai.js';
import { verifyFirebaseToken } from './middlewares.js';

const router = express.Router();

async function downloadToTemp(url){
  const res = await fetch(url);
  const buffer = Buffer.from(await res.arrayBuffer());
  const tmp = path.join(process.cwd(), 'backend', 'uploads');
  if (!fs.existsSync(tmp)) fs.mkdirSync(tmp, { recursive: true });
  const fname = path.join(tmp, `dl_${Date.now()}.webm`);
  fs.writeFileSync(fname, buffer);
  return fname;
}

function buildBandPrompt(transcript, taskContext=''){
  return `You are an experienced IELTS examiner. Evaluate the following spoken response and return a JSON object exactly in this format:   {"fluency": <0-9 float>, "grammar": <0-9 float>, "vocabulary": <0-9 float>, "pronunciation": <0-9 float>, "overall_band": <0-9 float>, "advice": "brief advice"}   Transcript: "${transcript.replace(/\n/g,' ')}"   Task context: ${JSON.stringify(taskContext)}   Return only valid JSON.`;
}

router.post('/', verifyFirebaseToken, async (req, res) => {
  try {
    if (!req.files || !req.files.audio) return res.status(400).json({ error: 'No audio file' });
    const audio = req.files.audio;

    const upload = await cloudinary.uploader.upload(audio.tempFilePath, { resource_type: 'video', folder: 'speaking_test' });
    const audioUrl = upload.secure_url;

    const tmpFile = await downloadToTemp(audioUrl);

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tmpFile),
      model: 'whisper-1'
    });
    const transcript = transcription.text || transcription.data?.text || '';

    const taskContext = req.body.taskContextJson ? JSON.parse(req.body.taskContextJson) : {};
    const prompt = buildBandPrompt(transcript, taskContext);

    const gptResp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert English speaking examiner.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.0,
      max_tokens: 450
    });

    const analysisText = gptResp.data.choices[0].message.content;
    let analysisJSON;
    try {
      const idx = analysisText.indexOf('{');
      analysisJSON = JSON.parse(analysisText.slice(idx));
    } catch (e) {
      analysisJSON = { raw: analysisText };
    }

    const overall = analysisJSON.overall_band || (
      (analysisJSON.fluency||0) +
      (analysisJSON.grammar||0) +
      (analysisJSON.vocabulary||0) +
      (analysisJSON.pronunciation||0)
    ) / 4;

    try {
      const admin = await import('firebase-admin');
      const db = admin.firestore();
      await db.collection('tests').add({
        user_id: req.user.uid,
        task_index: Number(req.body.taskIndex || 0),
        audio_url: audioUrl,
        transcript,
        analysis: analysisJSON,
        overall,
        created_at: new Date()
      });
    } catch (e) {
      console.warn('Firestore save failed', e.message);
    }

    try { fs.unlinkSync(tmpFile); } catch(e){}

    res.json({ transcript, analysis: analysisJSON, overall, audioUrl });

  } catch (e) {
    console.error('Upload handler error', e.message);
    res.status(500).json({ error: e.message });
  }
});

export default router;