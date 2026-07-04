import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

// Núcleo single-thread auto-hospedado (lo copia scripts/copy-ffmpeg-core.js en
// postinstall). No requiere COOP/COEP ni CDN externo: funciona en cualquier
// hosting estático como Vercel y mantiene todo el tráfico en el propio dominio.
const CORE_BASE_URL = `${import.meta.env.BASE_URL}ffmpeg-core`;

let ffmpegInstance = null;
let loadPromise = null;

export function isFFmpegLoaded() {
  return Boolean(ffmpegInstance?.loaded);
}

export async function loadFFmpeg() {
  if (ffmpegInstance?.loaded) return ffmpegInstance;
  if (!loadPromise) {
    loadPromise = (async () => {
      const ffmpeg = new FFmpeg();
      await ffmpeg.load({
        coreURL: new URL(`${CORE_BASE_URL}/ffmpeg-core.js`, window.location.href).href,
        wasmURL: new URL(`${CORE_BASE_URL}/ffmpeg-core.wasm`, window.location.href).href,
      });
      ffmpegInstance = ffmpeg;
      return ffmpeg;
    })().catch((err) => {
      loadPromise = null;
      throw err;
    });
  }
  return loadPromise;
}

function getExtension(name) {
  const match = /\.([a-z0-9]+)$/i.exec(name);
  return match ? `.${match[1].toLowerCase()}` : ".mp4";
}

// delogo exige que el rectángulo no toque los bordes del fotograma.
function clampRegion(region, videoWidth, videoHeight) {
  let x = Math.max(1, Math.round(region.x));
  let y = Math.max(1, Math.round(region.y));
  let w = Math.max(2, Math.round(region.w));
  let h = Math.max(2, Math.round(region.h));
  if (x + w > videoWidth - 1) w = videoWidth - 1 - x;
  if (y + h > videoHeight - 1) h = videoHeight - 1 - y;
  if (w < 2 || h < 2) return null;
  return { x, y, w, h };
}

/**
 * Elimina marcas de agua localmente con el filtro delogo de FFmpeg.
 * @param {File} file - vídeo de entrada
 * @param {{x:number,y:number,w:number,h:number}[]} regions - zonas en píxeles del vídeo original
 * @param {{w:number,h:number}} videoSize - dimensiones intrínsecas del vídeo
 * @param {{onStage?: (msg:string)=>void, onProgress?: (pct:number)=>void}} callbacks
 * @returns {Promise<Blob>} vídeo MP4 procesado
 */
export async function removeWatermarkLocal(file, regions, videoSize, { onStage, onProgress } = {}) {
  onStage?.("Cargando motor de vídeo (solo la primera vez)...");
  const ffmpeg = await loadFFmpeg();

  const clamped = regions
    .map((r) => clampRegion(r, videoSize.w, videoSize.h))
    .filter(Boolean);
  if (clamped.length === 0) {
    throw new Error("La zona seleccionada es demasiado pequeña.");
  }

  const inputName = `input${getExtension(file.name)}`;
  const outputName = "output.mp4";
  const filter = clamped
    .map((r) => `delogo=x=${r.x}:y=${r.y}:w=${r.w}:h=${r.h}`)
    .join(",");

  const progressHandler = ({ progress }) => {
    const pct = Math.max(0, Math.min(100, Math.round(progress * 100)));
    onProgress?.(pct);
  };
  ffmpeg.on("progress", progressHandler);

  try {
    onStage?.("Preparando vídeo...");
    await ffmpeg.writeFile(inputName, await fetchFile(file));

    onStage?.("Eliminando marca de agua...");
    const code = await ffmpeg.exec([
      "-i", inputName,
      "-vf", filter,
      "-c:v", "libx264",
      "-preset", "ultrafast",
      "-crf", "23",
      "-c:a", "aac",
      "-b:a", "128k",
      "-movflags", "+faststart",
      outputName,
    ]);
    if (code !== 0) {
      throw new Error("FFmpeg no pudo procesar el vídeo. Prueba con otro formato (MP4 recomendado).");
    }

    onStage?.("Generando descarga...");
    const data = await ffmpeg.readFile(outputName);
    return new Blob([data.buffer], { type: "video/mp4" });
  } finally {
    ffmpeg.off("progress", progressHandler);
    await ffmpeg.deleteFile(inputName).catch(() => {});
    await ffmpeg.deleteFile(outputName).catch(() => {});
  }
}
