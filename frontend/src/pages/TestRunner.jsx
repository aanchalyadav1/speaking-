// src/pages/TestRunner.jsx
import React, { useState } from 'react';
import AudioRecorder from '../components/AudioRecorder.jsx';
import AnimatedCard from '../components/AnimatedCard.jsx';

export default function TestRunner({ auth }) {
  const tasks = [
    { id:1, type:'read', prompt:'The quick brown fox jumps over the lazy dog.', max:25 },
    { id:2, type:'listen', promptText:'Listening passage: Reading gives many benefits. Summarize it in one sentence.', max:40 },
    { id:3, type:'readpassage', prompt:'Climate change affects many regions. Summarize in one sentence.', max:45 },
    { id:4, type:'image', promptImageUrl:'https://images.unsplash.com/photo-1501785888041-af3ef285b470', max:60 }
  ];

  const [step, setStep] = useState(1);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const cur = tasks[step-1];

  async function handleSaveAudio(blob) {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('audio', blob, 'resp.webm');
      fd.append('taskIndex', step);
      fd.append('testType', 'full_test');
      fd.append('taskContextJson', JSON.stringify(cur));

      const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${auth.token}` },
        body: fd
      });

      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`Upload failed: ${resp.status} ${txt}`);
      }

      const data = await resp.json();

      // normalize backend response to frontend result object
      const resultObj = {
        transcript: data.transcript || '',
        audioUrl: data.audioUrl || '',
        fluency: data.analysis?.fluency ?? null,
        grammar: data.analysis?.grammar ?? null,
        vocabulary: data.analysis?.vocabulary ?? null,
        pronunciation: data.analysis?.pronunciation ?? null,
        overallBand: data.overall_band ?? null,
        advice: data.analysis?.advice ?? data.analysis?.notes ?? ''
      };

      setResults(prev => [...prev, resultObj]);

      if (step < tasks.length) {
        setStep(s => s + 1);
      } else {
        alert('Test complete — check Admin panel for results.');
      }
    } catch (err) {
      console.error(err);
      alert(err.message || 'Upload failed');
    }
    setLoading(false);
  }

  return (
    <div>
      <AnimatedCard>
        <h2 style={{fontSize:18,fontWeight:700}}>Task {step}: {cur.type}</h2>
        <p style={{color:'#9aa4b2'}}>{cur.prompt || cur.promptText}</p>
        {cur.promptImageUrl && <img src={cur.promptImageUrl} alt="prompt" style={{maxWidth:360, marginTop:10, borderRadius:10}} />}
        <div style={{marginTop:12}}>
          <AudioRecorder onSave={handleSaveAudio} maxDuration={cur.max} disabled={loading} />
        </div>
        {loading && <div style={{marginTop:10,color:'#38bdf8'}}>Processing & evaluating — please wait...</div>}
      </AnimatedCard>

      <AnimatedCard>
        <h3>Evaluation Results</h3>
        {results.length === 0 ? (
          <div style={{color:'#9aa4b2'}}>No results yet.</div>
        ) : (
          results.map((r, i) => (
            <div key={i} className="card" style={{marginTop:12, padding:12}}>
              <h4 style={{fontWeight:600}}>Task {i+1}</h4>
              <div>Overall Band: <b>{r.overallBand ?? 'N/A'}</b></div>
              <div>Fluency: {r.fluency ?? 'N/A'}</div>
              <div>Grammar: {r.grammar ?? 'N/A'}</div>
              <div>Pronunciation: {r.pronunciation ?? 'N/A'}</div>
              <div>Vocabulary: {r.vocabulary ?? 'N/A'}</div>
              {r.advice && <div style={{marginTop:6,color:'#93c5fd'}}>Advice: {r.advice}</div>}
              {r.transcript && <div style={{marginTop:6,fontSize:13,color:'#9aa4b2'}}>Transcript: {r.transcript}</div>}
              {r.audioUrl && <div style={{marginTop:8}}><a href={r.audioUrl} target="_blank" rel="noreferrer">Open audio</a></div>}
            </div>
          ))
        )}
      </AnimatedCard>
    </div>
  );
}
