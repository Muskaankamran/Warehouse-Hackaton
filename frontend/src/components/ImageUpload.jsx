
import { useState } from "react";
import api from "../api/axios";

export default function ImageUpload({
  onUpload,
  currentImage,
  folder = "general",
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || null);
  const [error, setError] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

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
      const authRes = await api.get("/upload/auth");

      const { signature, expire, token } = authRes.data;

      const publicKey = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY;

      if (!publicKey) {
        throw new Error("ImageKit Public Key is missing");
      }

      const formData = new FormData();

      formData.append("file", file);
      formData.append("fileName", `${folder}_${Date.now()}_${file.name}`);
      formData.append("folder", `/${folder}`);
      formData.append("publicKey", publicKey);
      formData.append("signature", signature);
      formData.append("expire", String(expire));
      formData.append("token", token);

      // Correct ImageKit upload endpoint
      console.log("Uploading to ImageKit...");

      const uploadRes = await fetch(
        "https://upload.imagekit.io/api/v1/files/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const responseText = await uploadRes.text();

      console.log("ImageKit Status:", uploadRes.status);
      console.log("ImageKit Response:", responseText);

      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error("ImageKit returned an invalid or empty response");
      }

      if (!uploadRes.ok) {
        throw new Error(data.message || "Image upload failed");
      }

      setPreview(data.url);

      onUpload({
        url: data.url,
        fileId: data.fileId,
      });

    } catch (err) {
      console.error("Image Upload Error:", err);
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="image-upload">
      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="image-preview"
        />
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
