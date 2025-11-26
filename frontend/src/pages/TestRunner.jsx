// src/pages/TestRunner.jsx
import React, { useState } from 'react';
import AudioRecorder from '../components/AudioRecorder.jsx';
import AnimatedCard from '../components/AnimatedCard.jsx';

export default function TestRunner({ auth }) {
  const [step, setStep] = useState(1);
  const [results, setResults] = useState([]);

  const tasks = [
    { id: 1, type: 'read', prompt: 'The quick brown fox jumps over the lazy dog.', max: 25 },
    { id: 2, type: 'listen', promptText: 'Listening passage: Reading gives many benefits. Summarize it in one sentence.', max: 40 },
    { id: 3, type: 'readpassage', prompt: 'Climate change affects many regions. Summarize in one sentence.', max: 45 },
    { id: 4, type: 'image', promptImageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470', max: 60 }
  ];

  async function handleSaveAudio(blob) {
    try {
      const fd = new FormData();
      fd.append('audio', blob, 'resp.webm');
      fd.append('taskIndex', step);
      fd.append('testType', 'full_test');
      fd.append('taskContextJson', JSON.stringify(tasks[step - 1]));

      const resp = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/upload`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${auth.token}` },
          body: fd
        }
      );

      const data = await resp.json();

      // Save evaluation result for this task
      setResults((r) => [...r, data]);

      if (step < tasks.length) {
        setStep((s) => s + 1);
      } else {
        alert('Test complete — check Admin for saved results.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload or evaluate audio.');
    }
  }

  const cur = tasks[step - 1];

  return (
    <div>
      {/* Task Card */}
      <AnimatedCard>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>
          Task {step}: {cur.type}
        </h2>

        {/* Task Instruction */}
        <p style={{ color: '#9aa4b2' }}>
          {cur.prompt || cur.promptText}
        </p>

        {/* Image Prompt (if exists) */}
        {cur.promptImageUrl && (
          <img
            src={cur.promptImageUrl}
            alt="prompt"
            style={{ maxWidth: 400, marginTop: 8, borderRadius: 8 }}
          />
        )}

        {/* Audio Recorder */}
        <div style={{ marginTop: 12 }}>
          <AudioRecorder onSave={handleSaveAudio} maxDuration={cur.max} />
        </div>
      </AnimatedCard>

      {/* --- RESULT CARD --- */}
      <AnimatedCard>
        <h3 style={{ fontSize: 18, fontWeight: 700 }}>Evaluation Results</h3>

        {results.length === 0 ? (
          <div style={{ color: '#9aa4b2' }}>No results yet.</div>
        ) : (
          results.map((res, i) => (
            <div
              key={i}
              className="card"
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 10,
                background: 'rgba(255,255,255,0.02)'
              }}
            >
              <h4 style={{ fontWeight: 600 }}>Task {i + 1}</h4>

              <div>Overall Score: <b>{res.score}</b></div>
              <div>Fluency: {res.fluency}</div>
              <div>Grammar: {res.grammar}</div>
              <div>Pronunciation: {res.pronunciation}</div>
              <div>Coherence: {res.coherence}</div>

              <div style={{ marginTop: 6, fontSize: 13, color: '#93c5fd' }}>
                Notes: {res.notes}
              </div>
            </div>
          ))
        )}
      </AnimatedCard>
    </div>
  );
}
