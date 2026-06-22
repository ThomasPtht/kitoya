// lib/upload.ts
export const uploadImageToR2 = async (uri: string, token: string) => {
  const formData = new FormData();
  
  formData.append("file", {
    uri: uri,
    name: `jersey_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`,
    type: "image/jpeg",
  } as any);

  const response = await fetch("http://localhost:3000/jerseys/upload", {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Image upload failed");
  }

  const result = await response.json();
  return result.url; 
};