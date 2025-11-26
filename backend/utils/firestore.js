// backend/utils/firestore.js
import admin from 'firebase-admin';

export async function initFirestore() {
  try {
    const db = admin.firestore();
    // simple call to ensure Firestore is reachable
    await db.listCollections();
    console.log('Firestore initialized');
  } catch (e) {
    console.warn('Firestore init warning:', e?.message || e);
  }
}
