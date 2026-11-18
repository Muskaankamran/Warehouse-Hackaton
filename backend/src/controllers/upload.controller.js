import ImageKit from "@imagekit/nodejs";
import { createHmac, randomUUID } from "node:crypto";

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// GET /api/upload/auth — Generate ImageKit upload auth params
export async function getUploadAuth(req, res) {
  try {
    const token = randomUUID();
    const expire = Math.floor(Date.now() / 1000) + 30 * 60;
    const signature = createHmac("sha1", process.env.IMAGEKIT_PRIVATE_KEY)
      .update(token + expire)
      .digest("hex");

    const authParams = { token, expire, signature };
    return res.status(200).json(authParams);
  } catch (error) {
    console.error("Failed to generate ImageKit upload auth:", error);
    return res.status(500).json({ message: "Failed to get upload auth" });
  }
}

// POST /api/upload/delete — Delete file from ImageKit
export async function deleteFile(req, res) {
  try {
    const { fileId } = req.body;
    if (!fileId) return res.status(400).json({ message: "fileId is required" });
    await imagekit.deleteFile(fileId);
    return res.status(200).json({ message: "File deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete file", error: error.message });
  }
}
