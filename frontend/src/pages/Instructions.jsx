// src/pages/Instructions.jsx
import React from 'react';

export default function Instructions({ onStart }) {
  return (
    <div style={{maxWidth:800, margin:'40px auto'}}>
      <div className="card" style={{padding:20}}>
        <h2>Test Instructions</h2>
        <ul style={{lineHeight:1.6}}>
          <li>There are 4 tasks: reading, listening, reading passage, and image description.</li>
          <li>Each task will have a timer — speak clearly and completely within time.</li>
          <li>Give one audio answer per task. You can retake a task before uploading.</li>
          <li>Microphone access is required. Allow it when asked.</li>
        </ul>

        <div style={{marginTop:16, display:'flex', gap:10}}>
          <button onClick={onStart} style={{padding:'10px 14px', borderRadius:8, background:'linear-gradient(90deg,#7c3aed,#06b6d4)', color:'#fff'}}>Start Test</button>
          <button onClick={()=>window.location.reload()} style={{padding:'10px 14px', borderRadius:8}}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
