// src/api/upload.js
export async function uploadFile(audioBlob) {
  const formData = new FormData();
  formData.append("audio", audioBlob, "response.webm");

  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/upload`, {
    method: "POST",
    body: formData,
  });

  let data;
  try {
    data = await res.json();
  } catch (e) {
    const text = await res.text();
    throw new Error("Upload failed: " + text);
  }

  if (!res.ok) throw new Error("Upload failed: " + JSON.stringify(data));

  return data; // { url: "https://..." }
}
