import React, { useRef, useState } from 'react';

export default function AudioRecorder({ onSave, maxDuration=60 }){
  const [recording,setRecording]=useState(false);
  const [sec,setSec]=useState(0);
  const mr = useRef(null);
  const chunks = useRef([]);

  async function start(){
    const stream = await navigator.mediaDevices.getUserMedia({ audio:true });
    const media = new MediaRecorder(stream);
    mr.current = media;
    chunks.current = [];
    media.ondataavailable = e => chunks.current.push(e.data);
    media.onstop = () => {
      const blob = new Blob(chunks.current, { type: 'audio/webm' });
      onSave(blob);
    };
    media.start();
    setRecording(true);
    setSec(0);
    const id = setInterval(()=>{ setSec(s=>{ if(s+1>=maxDuration){ if(mr.current && mr.current.state==='recording') mr.current.stop(); clearInterval(id); setRecording(false); } return s+1; }) },1000);
  }

  function stop(){ if(mr.current && mr.current.state==='recording') mr.current.stop(); setRecording(false); }

  return (
    <div className="card">
      <div style={{display:'flex',gap:12,alignItems:'center'}}>
        <button onClick={recording?stop:start} style={{padding:'8px 12px', borderRadius:8, background: recording ? '#ef4444' : '#10b981', color:'#fff'}}>{recording ? 'Stop' : 'Record'}</button>
        <div>Time: {sec}s</div>
      </div>
      <div style={{marginTop:8,fontSize:12,color:'#cbd5e1'}}>Max {maxDuration}s</div>
    </div>
  );
}