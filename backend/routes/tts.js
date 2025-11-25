import express from 'express';
import fs from 'fs';
import path from 'path';
import { openai } from '../utils/openai.js';
import { verifyFirebaseToken } from './middlewares.js';

const router = express.Router();

router.post('/', verifyFirebaseToken, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'text required' });

    const speech = await openai.audio.speech.create({
      model: 'gpt-4o-mini-tts',
      voice: 'alloy',
      input: text
    });

    const buffer = Buffer.from(await speech.arrayBuffer());
    const fname = `tts_${Date.now()}.mp3`;
    const folder = path.join(process.cwd(), 'backend', 'uploads');
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
    fs.writeFileSync(path.join(folder, fname), buffer);

    const url = `${process.env.FRONTEND_URL.replace(/\/$/,'')}/static/${fname}`;
    res.json({ url });

  } catch (e) {
    console.error('TTS error', e.message);
    res.status(500).json({ error: e.message });
  }
});

export default router;