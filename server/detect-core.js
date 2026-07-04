// Lógica de detección de marcas de agua con Gemini, compartida entre la
// función serverless de Vercel (api/detect-watermark.js) y el middleware
// de desarrollo de Vite (vite.config.js).

const DEFAULT_MODEL = "gemini-2.5-flash";

const PROMPT = `Detecta todas las marcas de agua en esta imagen (fotograma de un vídeo): logotipos, textos superpuestos, sellos de fecha/hora, iconos de plataformas o cualquier superposición de branding.
Responde ÚNICAMENTE con un array JSON. Cada elemento: {"box_2d": [ymin, xmin, ymax, xmax], "label": "descripción corta"} con coordenadas normalizadas de 0 a 1000.
Si no hay marcas de agua, responde [].`;

/**
 * Detecta marcas de agua en un fotograma usando la API de Gemini.
 * @param {string} imageBase64 - JPEG en base64 (sin prefijo data:)
 * @param {string} apiKey - clave de la API de Gemini
 * @param {string} [model] - modelo a usar
 * @returns {Promise<{x:number,y:number,w:number,h:number,label:string}[]>} regiones normalizadas 0..1
 */
export async function detectWatermarkRegions(imageBase64, apiKey, model = DEFAULT_MODEL) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { inline_data: { mime_type: "image/jpeg", data: imageBase64 } },
              { text: PROMPT },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0,
        },
      }),
    }
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Gemini respondió ${response.status}: ${detail.slice(0, 300)}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ?? "[]";
  let boxes;
  try {
    boxes = JSON.parse(text);
  } catch {
    throw new Error("La IA devolvió una respuesta no válida. Inténtalo de nuevo.");
  }
  if (!Array.isArray(boxes)) boxes = [];

  return boxes
    .filter((b) => Array.isArray(b?.box_2d) && b.box_2d.length === 4)
    .map((b) => {
      const [ymin, xmin, ymax, xmax] = b.box_2d.map((n) => clamp01(Number(n) / 1000));
      return {
        x: Math.min(xmin, xmax),
        y: Math.min(ymin, ymax),
        w: Math.abs(xmax - xmin),
        h: Math.abs(ymax - ymin),
        label: typeof b.label === "string" ? b.label.slice(0, 80) : "marca de agua",
      };
    })
    .filter((r) => r.w > 0.005 && r.h > 0.005);
}

/**
 * Maneja la petición HTTP (compartido entre Vercel y el dev server de Vite).
 * @param {{image?: string}} body - JSON con el fotograma en base64 o data URL
 * @param {string|undefined} apiKey
 * @returns {Promise<{status:number, payload:object}>}
 */
export async function handleDetectRequest(body, apiKey) {
  if (!apiKey) {
    return {
      status: 503,
      payload: { error: "La detección automática no está configurada en este servidor.", code: "NO_API_KEY" },
    };
  }
  const image = typeof body?.image === "string" ? body.image.replace(/^data:image\/\w+;base64,/, "") : null;
  if (!image || image.length < 100) {
    return { status: 400, payload: { error: "Falta el fotograma a analizar.", code: "BAD_REQUEST" } };
  }
  if (image.length > 6_000_000) {
    return { status: 413, payload: { error: "El fotograma es demasiado grande.", code: "TOO_LARGE" } };
  }
  try {
    const regions = await detectWatermarkRegions(image, apiKey, process.env.GEMINI_MODEL || undefined);
    return { status: 200, payload: { regions } };
  } catch (err) {
    console.error("detect-watermark:", err);
    return { status: 502, payload: { error: "No se pudo completar la detección con IA.", code: "UPSTREAM" } };
  }
}

function clamp01(n) {
  return Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));
}
