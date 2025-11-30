export async function uploadFile(blob) {
  const formData = new FormData();
  formData.append("audio", blob, "response.webm"); // field name MUST be "audio"

  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/upload`, {
    method: "POST",
    body: formData
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error("Upload failed: " + errText);
  }

  return res.json(); // { url: "https://..." }
}
