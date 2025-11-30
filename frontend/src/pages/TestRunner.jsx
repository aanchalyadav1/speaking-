import React, { useState } from "react";
import { uploadFile } from "../api/upload";

export default function TestRunner() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedURL, setUploadedURL] = useState("");

  async function handleUpload(file) {
    try {
      const result = await uploadFile(file);
      console.log("URL:", result.url);
      setUploadedURL(result.url);
      return result.url;
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  }

  async function handleRunTest() {
    if (!selectedFile) {
      alert("Please select a file first");
      return;
    }

    // Step 1: Upload the file
    const url = await handleUpload(selectedFile);
    if (!url) return;

    // Step 2: Call your backend speaking test API
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/test/run`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ audioUrl: url })
        }
      );

      const data = await res.json();
      console.log("Test results:", data);
      alert("Test Run Successfully!");

    } catch (err) {
      console.error(err);
      alert("Error running test");
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Test Runner</h2>

      <input
        type="file"
        accept="audio/*"
        onChange={(e) => setSelectedFile(e.target.files[0])}
      />

      <button onClick={handleRunTest}>
        Run Speaking Test
      </button>

      {uploadedURL && (
        <p>
          Uploaded File URL:  
          <a href={uploadedURL} target="_blank" rel="noreferrer">
            {uploadedURL}
          </a>
        </p>
      )}
    </div>
  );
}
