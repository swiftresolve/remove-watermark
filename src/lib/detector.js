// Detección automática de marcas de agua (Fase 2).
// Captura UN fotograma del vídeo y lo envía al endpoint /api/detect-watermark
// (Gemini). El vídeo completo nunca sale del dispositivo; la eliminación
// sigue siendo 100% local con ffmpeg.wasm.

const MAX_FRAME_WIDTH = 1280;

export class DetectionUnavailableError extends Error {
  constructor(message) {
    super(message);
    this.name = "DetectionUnavailableError";
  }
}

/**
 * Detecta marcas de agua en el fotograma actual del vídeo.
 * @param {HTMLVideoElement} videoEl - vídeo con el fotograma a analizar
 * @param {{w:number,h:number}} videoSize - dimensiones intrínsecas
 * @returns {Promise<{x:number,y:number,w:number,h:number}[]>} regiones en píxeles del vídeo
 */
export async function detectWatermarks(videoEl, videoSize) {
  const scale = Math.min(1, MAX_FRAME_WIDTH / videoSize.w);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(videoSize.w * scale);
  canvas.height = Math.round(videoSize.h * scale);
  canvas.getContext("2d").drawImage(videoEl, 0, 0, canvas.width, canvas.height);
  const image = canvas.toDataURL("image/jpeg", 0.85);

  let response;
  try {
    response = await fetch("/api/detect-watermark", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image }),
    });
  } catch {
    throw new DetectionUnavailableError("No se pudo contactar el servicio de detección.");
  }

  const data = await response.json().catch(() => ({}));
  if (response.status === 503 || response.status === 404 || response.status === 405) {
    throw new DetectionUnavailableError(
      "La detección automática no está disponible en este servidor. Puedes marcar la zona manualmente."
    );
  }
  if (!response.ok) {
    throw new Error(data.error || "La detección con IA falló. Marca la zona manualmente.");
  }

  // El backend devuelve regiones normalizadas 0..1 → convertir a píxeles del vídeo
  const regions = (data.regions || []).map((r) => ({
    x: Math.round(r.x * videoSize.w),
    y: Math.round(r.y * videoSize.h),
    w: Math.round(r.w * videoSize.w),
    h: Math.round(r.h * videoSize.h),
  }));
  return { regions, degraded: Boolean(data.degraded) };
}
