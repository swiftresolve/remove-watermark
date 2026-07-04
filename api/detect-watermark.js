import { handleDetectRequest } from "../server/detect-core.js";

// Función serverless de Vercel: recibe un fotograma del vídeo y devuelve las
// zonas con marcas de agua detectadas por Gemini. El vídeo completo nunca se
// sube: solo un fotograma JPEG, y únicamente cuando el usuario pulsa el botón
// de detección automática.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método no permitido" });
    return;
  }
  const { status, payload } = await handleDetectRequest(req.body, process.env.GEMINI_API_KEY);
  res.status(status).json(payload);
}
