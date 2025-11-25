import express from 'express';
import { openai } from '../utils/openai.js';
import { verifyFirebaseToken } from './middlewares.js';
const router = express.Router();

const prompts = {
  1: 'Generate a simple sentence (8-12 words) suitable for a read-aloud test.',
  2: 'Generate a short spoken passage (25-45 words) suitable for a listening comprehension question and provide one direct question about it.',
  3: 'Generate a paragraph (50-80 words) and then ask a comprehension question that needs a one-sentence answer.',
  4: 'Provide a visual description prompt for an image that a candidate should describe (one complex scene). Also provide 2 follow-up questions.'
};

router.post('/', verifyFirebaseToken, async (req, res) => {
  try {
    const part = Number(req.body.part || 1);
    if (!prompts[part]) return res.status(400).json({ error: 'Invalid part' });

    const resp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompts[part] }],
      max_tokens: 300
    });

    const text = resp.data.choices[0].message.content.trim();
    res.json({ prompt: text });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

export default router;