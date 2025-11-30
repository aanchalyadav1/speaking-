// TestRunner.jsx
import React, { useEffect, useState } from "react";
import AudioRecorder from "../components/AudioRecorder.jsx";

/**
 * Props:
 *  - auth: { token }  // optional, used for Authorization header when uploading
 *
 * This TestRunner implements the 5 phases described:
 * 1. Read passage aloud
 * 2. Listen + answer
 * 3. Read passage + question + conclusion
 * 4. Image observation (show image for 10s then record)
 * 5. Real-life scenario speaking
 *
 * It uploads the recorded audio as multipart/form-data with field name "file"
 * to `${import.meta.env.VITE_API_URL}/api/upload` and passes Authorization if available.
 *
 * The backend is expected to return JSON with evaluation fields (analysis, transcript, audioUrl, overall_band).
 */

export default function TestRunner({ auth }) {
  const phases = [
    { id: 1, key: "read", title: "Reading Passage Aloud", type: "read", prompt: "The quick brown fox jumps over the lazy dog." },
    { id: 2, key: "listen", title: "Audio Listening + Response", type: "listen", promptText: "Listening passage: Reading gives many benefits. Summarize it in one sentence." },
    { id: 3, key: "readpassage", title: "Passage + Question + Conclusion", type: "readpassage", prompt: "Climate change affects many regions. Summarize in one sentence and conclude in your own words." },
    { id: 4, key: "image", title: "Image Observation Memory Test", type: "image", promptImageUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470" },
    { id: 5, key: "scenario", title: "Real-Life Scenario Speaking", type: "scenario", prompt: "You lost your passport at the airport. Explain what you would do." }
  ];

  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const cur = phases[index];

  // For image phase: show image for 10s then enable recording
  const [imageVisible, setImageVisible] = useState(true);
  useEffect(() => {
    if (cur?.type === "image") {
      setImageVisible(true);
      const t = setTimeout(() => setImageVisible(false), 10000); // show 10 seconds
      return () => clearTimeout(t);
    } else {
      setImageVisible(false);
    }
  }, [index]);

  async function uploadBlob(blob) {
    const fd = new FormData();
    // field name must be "file" per backend multer
    fd.append("file", blob, "resp.webm");
    fd.append("taskIndex", index + 1);
    fd.append("testType", "full_test");
    fd.append("taskContextJson", JSON.stringify(cur));

    const headers = {};
    if (auth?.token) headers["Authorization"] = `Bearer ${auth.token}`;

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
      method: "POST",
      headers,
      body: fd
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Upload failed: ${res.status} ${txt}`);
    }
    return res.json();
  }

  async function handleSaveAudio(blob) {
    setLoading(true);
    try {
      // Upload to backend
      const data = await uploadBlob(blob);

      // Normalize response (backend expected structure)
      const resultObj = {
        transcript: data.transcript || "",
        audioUrl: data.audioUrl || data.url || "",
        fluency: data.analysis?.fluency ?? null,
        grammar: data.analysis?.grammar ?? null,
        vocabulary: data.analysis?.vocabulary ?? null,
        pronunciation: data.analysis?.pronunciation ?? null,
        overallBand: data.overall_band ?? null,
        advice: data.analysis?.advice ?? data.analysis?.notes ?? ""
      };

      setResults((p) => [...p, resultObj]);

      // advance
      if (index < phases.length - 1) setIndex((i) => i + 1);
      else alert("Test complete — check Admin panel for results.");

    } catch (err) {
      console.error("Upload / evaluation error:", err);
      alert(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 18, maxWidth: 820 }}>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: 0 }}>{cur.title}</h2>
        <div style={{ color: "#6b7280", marginTop: 6 }}>
          {cur.prompt || cur.promptText}
        </div>
        {cur.promptImageUrl && imageVisible && (
          <div style={{ marginTop: 12 }}>
            <img src={cur.promptImageUrl} alt="prompt" style={{ width: "100%", maxWidth: 480, borderRadius: 8 }} />
            <div style={{ fontSize: 13, color: "#9aa4b2", marginTop: 6 }}>Image will disappear after 10 seconds — memorize it now.</div>
          </div>
        )}
      </div>

      <div style={{ padding: 12, borderRadius: 8, background: "#0f172a", color: "#fff", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <AudioRecorder onSave={handleSaveAudio} disabled={loading || (cur.type === "image" && imageVisible)} maxDuration={cur.type === "readpassage" ? 90 : 60} />
          <div style={{ color: "#9aa4b2", fontSize: 13 }}>
            {loading ? "Processing..." : "Press Start → Speak → Stop to submit"}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 8 }}>
        <h3>Results</h3>
        {results.length === 0 ? (
          <div style={{ color: "#9aa4b2" }}>No results yet.</div>
        ) : (
          results.map((r, i) => (
            <div key={i} style={{ padding: 12, borderRadius: 8, marginTop: 10, background: "#fff" }}>
              <strong>Task {i + 1} — {phases[i].title}</strong>
              <div style={{ marginTop: 6 }}>Overall Band: <b>{r.overallBand ?? "N/A"}</b></div>
              <div>Fluency: {r.fluency ?? "N/A"}</div>
              <div>Grammar: {r.grammar ?? "N/A"}</div>
              <div>Pronunciation: {r.pronunciation ?? "N/A"}</div>
              <div>Vocabulary: {r.vocabulary ?? "N/A"}</div>
              {r.advice && <div style={{ marginTop: 8, color: "#2563eb" }}>Advice: {r.advice}</div>}
              {r.transcript && <div style={{ marginTop: 8, color: "#6b7280" }}>Transcript: {r.transcript}</div>}
              {r.audioUrl && <div style={{ marginTop: 8 }}><a href={r.audioUrl} target="_blank" rel="noreferrer">Open audio</a></div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
