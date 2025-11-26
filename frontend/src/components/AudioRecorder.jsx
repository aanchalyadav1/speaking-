// src/components/AudioRecorder.jsx
import React, { useRef, useState } from 'react';
import CircularTimer from './CircularTimer.jsx';

export default function AudioRecorder({
  onSave,                // async(blob) => { ... }
  maxDuration = 60,
  disabled = false,
  showTimer = true,
  onRecordingStart = ()=>{},
  allowRetake = true
}) {
  const [recording, setRecording] = useState(false);
  const [sec, setSec] = useState(0);
  const [blobUrl, setBlobUrl] = useState(null);
  const mr = useRef(null);
  const chunks = useRef([]);
  const intervalRef = useRef(null);

  async function start() {
    if (disabled) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const media = new MediaRecorder(stream);
      mr.current = media;
      chunks.current = [];

      media.ondataavailable = (e) => chunks.current.push(e.data);
      media.onstop = async () => {
        clearInterval(intervalRef.current);
        const blob = new Blob(chunks.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        await onSave(blob);
      };

      media.start();
      setRecording(true);
      setSec(0);
      onRecordingStart();

      intervalRef.current = setInterval(() => {
        setSec(s => {
          if (s + 1 >= maxDuration) {
            stop();
            return maxDuration;
          }
          return s + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Microphone permission error', err);
      alert('Please allow microphone access and try again.');
    }
  }

  function stop() {
    if (mr.current && mr.current.state === 'recording') mr.current.stop();
    setRecording(false);
  }

  function retake() {
    // cleanup previous blob URL
    if (blobUrl) { URL.revokeObjectURL(blobUrl); setBlobUrl(null); }
    setSec(0);
    setRecording(false);
    // user can start again
  }

  return (
    <div className="card" style={{padding:12}}>
      <div style={{display:'flex', alignItems:'center', gap:12}}>
        <button
          onClick={recording ? stop : start}
          disabled={disabled}
          style={{
            padding:'8px 12px',
            borderRadius:8,
            background: recording ? '#ef4444' : disabled ? '#475569' : '#10b981',
            color:'#fff',
            cursor: disabled ? 'not-allowed':'pointer'
          }}
        >
          {recording ? 'Stop' : 'Record'}
        </button>

        <div style={{display:'flex', flexDirection:'column'}}>
          { showTimer && <div style={{fontWeight:700}}>{sec}s / {maxDuration}s</div> }
          { showTimer && <div style={{fontSize:12, color:'#94a3b8'}}>Recording status: {recording ? 'LIVE' : blobUrl ? 'Recorded' : 'Idle'}</div> }
        </div>

        <div style={{marginLeft:'auto'}}>
          { showTimer && <CircularTimer duration={maxDuration} isActive={recording} onExpire={stop} size={56} stroke={5} /> }
        </div>
      </div>

      { blobUrl && (
        <div style={{marginTop:10}}>
          <audio controls src={blobUrl} />
          {allowRetake && <button onClick={retake} style={{marginLeft:8, padding:'6px 10px'}}>Retake</button>}
        </div>
      )}
    </div>
  );
}
