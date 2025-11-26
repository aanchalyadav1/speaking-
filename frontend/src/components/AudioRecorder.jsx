// src/components/AudioRecorder.jsx
import React, { useRef, useState } from "react";

export default function AudioRecorder({ onSave, maxDuration = 60, disabled }) {
  const [recording, setRecording] = useState(false);
  const [sec, setSec] = useState(0);
  const mr = useRef(null);
  const chunks = useRef([]);
  const timerRef = useRef(null);

  async function start() {
    if (disabled) return alert("Please wait... uploading previous answer.");

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const media = new MediaRecorder(stream);
    mr.current = media;
    chunks.current = [];

    media.ondataavailable = (e) => chunks.current.push(e.data);
    media.onstop = () => {
      clearInterval(timerRef.current);
      const blob = new Blob(chunks.current, { type: "audio/webm" });
      onSave(blob);
    };

    media.start();
    setRecording(true);
    setSec(0);

    timerRef.current = setInterval(() => {
      setSec((s) => {
        if (s + 1 >= maxDuration) {
          stop();
          return maxDuration;
        }
        return s + 1;
      });
    }, 1000);
  }

  function stop() {
    if (mr.current && mr.current.state === "recording") {
      mr.current.stop();
    }
    setRecording(false);
  }

  return (
    <div className="card">
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button
          onClick={recording ? stop : start}
          disabled={disabled}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            background: recording ? "#ef4444" : disabled ? "#475569" : "#10b981",
            color: "#fff",
            cursor: disabled ? "not-allowed" : "pointer"
          }}
        >
          {recording ? "Stop" : "Record"}
        </button>

        <div style={{ fontSize: 16, fontWeight: 600 }}>
          Time: {sec}s / {maxDuration}s
        </div>
      </div>

      {recording && (
        <div
          style={{
            marginTop: 10,
            width: 140,
            height: 20,
            background: "#1e293b",
            borderRadius: 8,
            overflow: "hidden",
            display: "flex"
          }}
        >
          {/* simple waveform */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              style={{
                width: 8,
                marginRight: 2,
                background: "#06b6d4",
                animation: "wave 0.7s infinite",
                animationDelay: `${i * 0.1}s`
              }}
            ></div>
          ))}
        </div>
      )}

      <style>
        {`
          @keyframes wave {
            0% { height: 10px; }
            50% { height: 20px; }
            100% { height: 10px; }
          }
        `}
      </style>
    </div>
  );
}
