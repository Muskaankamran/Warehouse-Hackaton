import { useState } from "react";
import api from "../api/axios";

export default function ImageUpload({ onUpload, currentImage, folder = "general" }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || null);
  const [error, setError] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type and size
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      setError("Only JPEG, PNG, WebP, GIF allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File must be under 5MB");
      return;
    }

    setError("");
    setUploading(true);

    try {
      // 1. Get auth params from backend
      const authRes = await api.get("/upload/auth");
      const { signature, expire, token } = authRes.data;

      const publicKey = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY;
      const urlEndpoint = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT;

      // 2. Upload to ImageKit directly
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", `${folder}_${Date.now()}_${file.name}`);
      formData.append("folder", `/${folder}`);
      formData.append("publicKey", publicKey);
      formData.append("signature", signature);
      formData.append("expire", expire);
      formData.append("token", token);

      const uploadRes = await fetch(`${urlEndpoint}/api/v1/files/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(data.message || "Upload failed");

      setPreview(data.url);
      onUpload({ url: data.url, fileId: data.fileId });
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="image-upload">
      {preview && (
        <img src={preview} alt="Preview" className="image-preview" />
      )}
      <label className="upload-label">
        {uploading ? "Uploading..." : "📷 Choose Image"}
        <input
          type="file"
          accept="image/*"
          onChange={handleFile}
          disabled={uploading}
          style={{ display: "none" }}
        />
      </label>
      {error && <div className="error-text">{error}</div>}
    </div>
  );
}
