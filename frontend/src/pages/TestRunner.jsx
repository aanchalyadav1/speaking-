// src/pages/TestRunner.jsx
import React, { useState } from 'react';
import AudioRecorder from '../components/AudioRecorder.jsx';
import AnimatedCard from '../components/AnimatedCard.jsx';

export default function TestRunner({ auth }) {
  const tasks = [
    { id:1, type:'read', prompt:'The quick brown fox jumps over the lazy dog.', max:25 },
    { id:2, type:'listen', promptText:'Listening passage: Reading gives many benefits. Summarize it in one sentence.', max:40 },
    { id:3, type:'readpassage', prompt:'Climate change affects many regions. Summarize in one sentence.', max:45 },
    { id:4, type:'image', promptImageUrl:'https://images.unsplash.com/photo-1501785888041-af3ef285b470', max:60 },
    { id:5, type:'scenario', promptText:'Imagine a real-life scenario and speak your answer.', max:50 }
  ];

  const [step, setStep] = useState(1);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const cur = tasks[step-1];

  async function handleSaveAudio(url) {
    const resultObj = { audioUrl: url };
    setResults(prev => [...prev, resultObj]);

    if (step < tasks.length) setStep(s => s + 1);
    else alert('Test complete — check Admin panel for results.');
  }

  return (
    <div>
      <AnimatedCard>
        <h2 style={{fontSize:18,fontWeight:700}}>Task {step}: {cur.type}</h2>
        <p style={{color:'#9aa4b2'}}>{cur.prompt || cur.promptText}</p>
        {cur.promptImageUrl && <img src={cur.promptImageUrl} alt="prompt" style={{maxWidth:360, marginTop:10, borderRadius:10}} />}
        <div style={{marginTop:12}}>
          <AudioRecorder onUploaded={handleSaveAudio} maxDuration={cur.max} disabled={loading} />
        </div>
        {loading && <div style={{marginTop:10,color:'#38bdf8'}}>Processing & evaluating — please wait...</div>}
      </AnimatedCard>

      <AnimatedCard>
        <h3>Recorded Results</h3>
        {results.length === 0 ? <div style={{color:'#9aa4b2'}}>No results yet.</div> : (
          results.map((r, i) => (
            <div key={i} className="card" style={{marginTop:12, padding:12}}>
              <h4 style={{fontWeight:600}}>Task {i+1}</h4>
              {r.audioUrl && <div style={{marginTop:8}}><a href={r.audioUrl} target="_blank" rel="noreferrer">Open audio</a></div>}
            </div>
          ))
        )}
      </AnimatedCard>
    </div>
  );
}
