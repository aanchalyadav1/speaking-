export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/upload`,
    {
      method: "POST",
      body: formData
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error("Upload failed: " + err);
  }

  return res.json();
}
