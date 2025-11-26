import React, { useState } from 'react';
import AudioRecorder from '../components/AudioRecorder.jsx';
import AnimatedCard from '../components/AnimatedCard.jsx';

export default function TestRunner({ auth }) {
  const tasks = [
    { id: 1, type: 'read', prompt: 'The quick brown fox jumps over the lazy dog.', max: 25 },
    { id: 2, type: 'listen', promptText: 'Listening passage: Reading gives many benefits. Summarize in one sentence.', max: 40 },
    { id: 3, type: 'readpassage', prompt: 'Climate change affects many regions. Summarize in one sentence.', max: 45 },
    { id: 4, type: 'image', promptImageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470', max: 60 },
  ];

  const [step, setStep] = useState(1);
  const [results, setResults] = useState([]);
  const [saving, setSaving] = useState(false);
  const [startRecordingTrigger, setStartRecordingTrigger] = useState(false);

  const curTask = tasks[step - 1];

  const handleSaveAudio = async (blob) => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('audio', blob, 'resp.webm');
      fd.append('taskIndex', step);
      fd.append('testType', 'full_test');
      fd.append('taskContextJson', JSON.stringify(curTask));

      const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${auth.token}` },
        body: fd,
      });
      const data = await resp.json();
      setResults(r => [...r, data]);

      if (step < tasks.length) {
        setStep(s => s + 1);
        setStartRecordingTrigger(false);
        setTimeout(() => setStartRecordingTrigger(true), 300); // auto-start next task
      } else {
        alert('Test complete — check Admin for saved results.');
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    }
    setSaving(false);
  };

  return (
    <div>
      <AnimatedCard>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Task {step}: {curTask.type}</h2>
        <p style={{ color: '#9aa4b2' }}>{curTask.prompt || curTask.promptText}</p>
        {curTask.promptImageUrl && <img src={curTask.promptImageUrl} alt="prompt" style={{ maxWidth: 400, marginTop: 8 }} />}
        <AudioRecorder
          onSave={handleSaveAudio}
          maxDuration={curTask.max}
          startRecordingTrigger={startRecordingTrigger || !saving}
        />
      </AnimatedCard>

      <AnimatedCard>
        <h3>Results so far</h3>
        <pre style={{ maxHeight: 220, overflow: 'auto' }}>{JSON.stringify(results, null, 2)}</pre>
      </AnimatedCard>
    </div>
  );
}
