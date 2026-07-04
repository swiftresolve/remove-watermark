import { removeWatermarkLocal } from "./ffmpegProcessor";

// Fase 2: cuando exista un backend con detección automática por IA,
// basta con definir VITE_API_URL en .env para activarlo.
const API_URL = import.meta.env.VITE_API_URL;

/**
 * Punto único de entrada para eliminar marcas de agua.
 * Hoy procesa 100% en el navegador (privado y gratis); si se configura
 * VITE_API_URL delega en el backend remoto.
 */
export async function removeWatermark(file, regions, videoSize, callbacks = {}) {
  if (API_URL) {
    return removeWatermarkRemote(file, regions, callbacks);
  }
  return removeWatermarkLocal(file, regions, videoSize, callbacks);
}

async function removeWatermarkRemote(file, regions, { onStage, onProgress } = {}) {
  onStage?.("Subiendo vídeo al servidor...");
  const formData = new FormData();
  formData.append("video", file);
  formData.append("regions", JSON.stringify(regions));

  const response = await fetch(`${API_URL}/api/remove-watermark`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    throw new Error(`El servidor respondió con un error (${response.status}).`);
  }
  onProgress?.(90);
  const blob = await response.blob();
  onProgress?.(100);
  return blob;
}
