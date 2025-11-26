import React, { useRef, useState, useEffect } from 'react';

export default function AudioRecorder({ onSave, maxDuration = 60, startRecordingTrigger }) {
  const [recording, setRecording] = useState(false);
  const [sec, setSec] = useState(0);
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);
  const intervalId = useRef(null);

  // Start recording when trigger changes
  useEffect(() => {
    if (startRecordingTrigger) startRecording();
    // eslint-disable-next-line
  }, [startRecordingTrigger]);

  const startRecording = async () => {
    if (recording) return;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream);
    mediaRecorder.current = mr;
    chunks.current = [];

    mr.ondataavailable = e => chunks.current.push(e.data);
    mr.onstop = async () => {
      clearInterval(intervalId.current);
      setRecording(false);
      const blob = new Blob(chunks.current, { type: 'audio/webm' });
      await onSave(blob);
      setSec(0);
    };

    mr.start();
    setRecording(true);
    setSec(0);

    intervalId.current = setInterval(() => {
      setSec(prev => {
        if (prev + 1 >= maxDuration) {
          stopRecording();
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
    }
  };

  // Cleanup interval on unmount
  useEffect(() => () => clearInterval(intervalId.current), []);

  return (
    <div className="card">
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button
          onClick={recording ? stopRecording : startRecording}
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            background: recording ? '#ef4444' : '#10b981',
            color: '#fff',
          }}
        >
          {recording ? 'Stop' : 'Record'}
        </button>
        <div>Time: {sec}s / {maxDuration}s</div>
      </div>
    </div>
  );
}
