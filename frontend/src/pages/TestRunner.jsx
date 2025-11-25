import React, { useState } from 'react';
import AudioRecorder from '../components/AudioRecorder.jsx';
import AnimatedCard from '../components/AnimatedCard.jsx';

export default function TestRunner({ auth }){
  const [step, setStep] = useState(1);
  const [results, setResults] = useState([]);
  const tasks = [
    { id:1, type:'read', prompt:'The quick brown fox jumps over the lazy dog.', max:25 },
    { id:2, type:'listen', promptText:'Listening passage: Reading gives many benefits. Summarize it in one sentence.', max:40 },
    { id:3, type:'readpassage', prompt:'Climate change affects many regions. Summarize in one sentence.', max:45 },
    { id:4, type:'image', promptImageUrl:'https://images.unsplash.com/photo-1501785888041-af3ef285b470', max:60 }
  ];

  async function handleSaveAudio(blob){
    const fd = new FormData();
    fd.append('audio', blob, 'resp.webm');
    fd.append('taskIndex', step);
    fd.append('testType', 'full_test');
    fd.append('taskContextJson', JSON.stringify(tasks[step-1]));

    const resp = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${auth.token}` },
      body: fd
    });
    const data = await resp.json();
    setResults(r=>[...r, data]);
    if (step < tasks.length) setStep(s=>s+1);
    else alert('Test complete — check Admin for saved results.');
  }

  const cur = tasks[step-1];

  return (
    <div>
      <AnimatedCard>
        <h2 style={{fontSize:18,fontWeight:700}}>Task {step}: {cur.type}</h2>
        <p style={{color:'#9aa4b2'}}>{cur.prompt || cur.promptText}</p>
        {cur.promptImageUrl && <img src={cur.promptImageUrl} alt="prompt" style={{maxWidth:400, marginTop:8}} />}
        <div style={{marginTop:12}}><AudioRecorder onSave={handleSaveAudio} maxDuration={cur.max} /></div>
      </AnimatedCard>

      <AnimatedCard>
        <h3>Results so far</h3>
        <pre style={{maxHeight:220, overflow:'auto'}}>{JSON.stringify(results, null, 2)}</pre>
      </AnimatedCard>
    </div>
  );
}