// src/components/AudioRecorder.jsx
import React, { useRef, useState, useEffect } from 'react';
import CircularTimer from './CircularTimer.jsx';

export default function AudioRecorder({
  onSave,                // async(blob) => {...}
  maxDuration = 60,
  disabled = false,
  allowRetake = true,
  autoStart = false
}) {
  const [recording, setRecording] = useState(false);
  const [sec, setSec] = useState(0);
  const [blobUrl, setBlobUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const mr = useRef(null);
  const chunks = useRef([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (autoStart) start();
    return () => cleanup();
    // eslint-disable-next-line
  }, []);

  function cleanup() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (mr.current && mr.current.state === 'recording') mr.current.stop();
  }

  async function start() {
    if (disabled || recording || uploading) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const media = new MediaRecorder(stream);
      mr.current = media;
      chunks.current = [];

      media.ondataavailable = (e) => chunks.current.push(e.data);
      media.onstop = async () => {
        clearInterval(intervalRef.current);
        setRecording(false);
        const blob = new Blob(chunks.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);

        // call onSave and wait
        setUploading(true);
        try {
          await onSave(blob);
        } finally {
          setUploading(false);
        }
      };

      media.start();
      setRecording(true);
      setSec(0);

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
      console.error('Microphone access error', err);
      alert('Please allow microphone access.');
    }
  }

  function stop() {
    if (mr.current && mr.current.state === 'recording') mr.current.stop();
    setRecording(false);
  }

  function retake() {
    if (blobUrl) { URL.revokeObjectURL(blobUrl); setBlobUrl(null); }
    setSec(0);
  }

  return (
    <div className="card" style={{padding:12}}>
      <div style={{display:'flex', alignItems:'center', gap:12}}>
        <button
          onClick={recording ? stop : start}
          disabled={disabled || uploading}
          style={{
            padding:'8px 12px',
            borderRadius:8,
            background: recording ? '#ef4444' : (disabled||uploading) ? '#475569' : '#10b981',
            color:'#fff',
            cursor: (disabled||uploading) ? 'not-allowed' : 'pointer'
          }}
        >
          { recording ? 'Stop' : (uploading ? 'Uploading...' : 'Record') }
        </button>

        <div style={{display:'flex', flexDirection:'column'}}>
          <div style={{fontWeight:700}}>{sec}s / {maxDuration}s</div>
          <div style={{fontSize:12, color:'#94a3b8'}}>
            { recording ? 'Recording...' : (blobUrl ? 'Recorded' : 'Idle') }
          </div>
        </div>

        <div style={{marginLeft:'auto'}}>
          <CircularTimer duration={maxDuration} isActive={recording} onExpire={stop} size={56} stroke={5} />
        </div>
      </div>

      { blobUrl && (
        <div style={{marginTop:10, display:'flex', gap:8, alignItems:'center'}}>
          <audio controls src={blobUrl} />
          { allowRetake && <button onClick={retake} style={{padding:'6px 10px'}}>Retake</button> }
        </div>
      )}
    </div>
  );
}
