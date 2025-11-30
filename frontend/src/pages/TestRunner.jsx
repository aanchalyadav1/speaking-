// src/pages/TestRunner.jsx
import React, { useState } from 'react';
import AudioRecorder from '../components/AudioRecorder.jsx';
import AnimatedCard from '../components/AnimatedCard.jsx';
import { uploadFile } from '../api/upload.js';

export default function TestRunner({ auth }) {
  const tasks = [
    { id: 1, type: 'read', prompt: 'Read aloud: The quick brown fox jumps over the lazy dog.', max: 25 },
    { id: 2, type: 'listen', promptText: 'Listen to audio and summarize in one sentence.', max: 40 },
    { id: 3, type: 'readpassage', prompt: 'Read passage and summarize in one sentence.', max: 45 },
    { id: 4, type: 'image', promptImageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470', max: 60 },
    { id: 5, type: 'scenario', prompt: 'Describe how you would handle this real-life situation.', max: 60 },
  ];

  const [step, setStep] = useState(1);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const cur = tasks[step - 1];

  async function handleSaveAudio(blob) {
    setLoading(true);

    try {
      const uploadResp = await uploadFile(blob);
      const resultObj = {
        audioUrl: uploadResp.url,
        transcript: '',
        fluency: null,
        grammar: null,
        vocabulary: null,
        pronunciation: null,
        overallBand: null,
        advice: '',
      };

      setResults(prev => [...prev, resultObj]);

      if (step < tasks.length) setStep(s => s + 1);
      else alert('Test complete — check Admin panel for results.');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Upload failed');
    }

    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      <AnimatedCard>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Task {step}: {cur.type}</h2>
        <p style={{ color: '#9aa4b2' }}>{cur.prompt || cur.promptText}</p>
        {cur.promptImageUrl && <img src={cur.promptImageUrl} alt="prompt" style={{ maxWidth: 360, marginTop: 10, borderRadius: 10 }} />}
        <div style={{ marginTop: 12 }}>
          <AudioRecorder onSave={handleSaveAudio} maxDuration={cur.max} disabled={loading} />
        </div>
        {loading && <div style={{ marginTop: 10, color: '#38bdf8' }}>Processing & uploading — please wait...</div>}
      </AnimatedCard>

      <AnimatedCard style={{ marginTop: 20 }}>
        <h3>Evaluation Results</h3>
        {results.length === 0 ? (
          <div style={{ color: '#9aa4b2' }}>No results yet.</div>
        ) : results.map((r, i) => (
          <div key={i} className="card" style={{ marginTop: 12, padding: 12 }}>
            <h4 style={{ fontWeight: 600 }}>Task {i + 1}</h4>
            {r.audioUrl && <div><a href={r.audioUrl} target="_blank" rel="noreferrer">Open audio</a></div>}
          </div>
        ))}
      </AnimatedCard>
    </div>
  );
}
