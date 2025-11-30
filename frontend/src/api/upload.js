// src/api/upload.js
export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file, "response.webm"); // must match multer field

  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error("Upload failed: " + text);
  }

  return res.json(); // { url: "https://..." }
}
