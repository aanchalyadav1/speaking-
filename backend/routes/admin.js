import express from 'express';
import admin from 'firebase-admin';
const router = express.Router();

async function verifyAdmin(req, res, next){
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });
  const idToken = auth.split(' ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(s=>s.trim()).filter(Boolean);
    if (!adminEmails.includes(decoded.email)) return res.status(403).json({ error: 'Forbidden' });
    req.user = decoded;
    next();
  } catch (e) {
    console.error('Admin verify failed', e.message);
    res.status(401).json({ error: 'Invalid token' });
  }
}

router.get('/tests', verifyAdmin, async (req, res) => {
  try {
    const db = admin.firestore();
    const snap = await db.collection('tests').orderBy('created_at','desc').limit(200).get();
    const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(rows);
  } catch (e) {
    console.error('Admin tests fetch error', e.message);
    res.status(500).json({ error: e.message });
  }
});

export default router;