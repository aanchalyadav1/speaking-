import React, { useState } from "react";
import AudioRecorder from "../components/AudioRecorder.jsx";
import AnimatedCard from "../components/AnimatedCard.jsx";
import { uploadFile } from "../api/upload.js";

export default function TestRunner() {
  const tasks = [
    { id: 1, type: "read", prompt: "Read aloud this sentence.", max: 25 },
    { id: 2, type: "listen", promptText: "Listen and answer.", max: 40 },
    { id: 3, type: "readpassage", prompt: "Read passage and answer.", max: 45 },
    { id: 4, type: "image", promptImageUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470", max: 60 },
    { id: 5, type: "scenario", prompt: "Describe how you'd handle this scenario.", max: 60 },
  ];

  const [step, setStep] = useState(1);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const cur = tasks[step - 1];

  async function handleSaveAudio(blob) {
    setLoading(true);
    try {
      const uploadResp = await uploadFile(blob);
      setResults(prev => [...prev, { audioUrl: uploadResp.url }]);
      if (step < tasks.length) setStep(s => s + 1);
      else alert("Test complete!");
    } catch (err) {
      console.error(err);
      alert(err.message || "Upload failed");
    }
    setLoading(false);
  }

  return (
    <div>
      <AnimatedCard>
        <h2>Task {step}: {cur.type}</h2>
        <p>{cur.prompt || cur.promptText}</p>
        {cur.promptImageUrl && <img src={cur.promptImageUrl} alt="prompt" style={{ maxWidth: 360, borderRadius: 10 }} />}
        <AudioRecorder onSave={handleSaveAudio} maxDuration={cur.max} disabled={loading} />
        {loading && <div>Uploading audio, please wait...</div>}
      </AnimatedCard>

      <AnimatedCard>
        <h3>Audio Results</h3>
        {results.map((r, i) => (
          <div key={i}>
            Task {i+1}: <a href={r.audioUrl} target="_blank" rel="noreferrer">Listen</a>
          </div>
        ))}
      </AnimatedCard>
    </div>
  );
}
