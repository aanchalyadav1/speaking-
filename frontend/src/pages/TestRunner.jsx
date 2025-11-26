// src/pages/TestRunner.jsx
import React, { useState } from "react";
import AudioRecorder from "../components/AudioRecorder.jsx";
import AnimatedCard from "../components/AnimatedCard.jsx";

export default function TestRunner({ auth }) {
  const [step, setStep] = useState(1);
  const [results, setResults] = useState([]);
  const [uploading, setUploading] = useState(false);

  const tasks = [
    { id: 1, type: "read", prompt: "The quick brown fox jumps over the lazy dog.", max: 25 },
    { id: 2, type: "listen", promptText: "Listening passage: Reading gives many benefits. Summarize it in one sentence.", max: 40 },
    { id: 3, type: "readpassage", prompt: "Climate change affects many regions. Summarize in one sentence.", max: 45 },
    { id: 4, type: "image", promptImageUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470", max: 60 }
  ];

  const cur = tasks[step - 1];
  const progress = Math.round(((step - 1) / tasks.length) * 100);

  async function handleSaveAudio(blob) {
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append("audio", blob, "recording.webm");
      fd.append("taskIndex", step);
      fd.append("testType", "full_test");
      fd.append("taskContextJson", JSON.stringify(tasks[step - 1]));

      const resp = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/upload`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${auth.token}` },
          body: fd
        }
      );

      const data = await resp.json();
      setResults((prev) => [...prev, data]);

      if (step < tasks.length) {
        setStep(step + 1);
      } else {
        alert("Test complete — check Admin panel for full results.");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload audio. Check console.");
    }

    setUploading(false);
  }

  return (
    <div>
      {/* Progress bar */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            background: "#1e293b",
            height: 8,
            borderRadius: 6,
            overflow: "hidden"
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "linear-gradient(90deg,#10b981,#06b6d4)",
              transition: "0.3s"
            }}
          />
        </div>
        <div
          style={{
            marginTop: 6,
            fontSize: 12,
            color: "#94a3b8",
            textAlign: "right"
          }}
        >
          {progress}% Completed
        </div>
      </div>

      <AnimatedCard>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>
          Task {step}: {cur.type}
        </h2>

        <p style={{ color: "#9aa4b2", marginTop: 6 }}>
          {cur.prompt || cur.promptText}
        </p>

        {cur.promptImageUrl && (
          <img
            src={cur.promptImageUrl}
            alt="prompt"
            style={{
              maxWidth: 360,
              marginTop: 10,
              borderRadius: 10,
              border: "1px solid #283548"
            }}
          />
        )}

        <div style={{ marginTop: 12 }}>
          <AudioRecorder
            onSave={handleSaveAudio}
            maxDuration={cur.max}
            disabled={uploading}
          />
        </div>

        {uploading && (
          <div
            style={{
              marginTop: 10,
              color: "#38bdf8",
              fontSize: 14,
              fontStyle: "italic"
            }}
          >
            ⏳ Uploading your answer... please wait
          </div>
        )}
      </AnimatedCard>

      <AnimatedCard>
        <h3>Results so far</h3>
        <pre
          style={{
            maxHeight: 220,
            overflow: "auto",
            background: "#0f172a",
            padding: 10,
            borderRadius: 8
          }}
        >
          {JSON.stringify(results, null, 2)}
        </pre>
      </AnimatedCard>
    </div>
  );
}
