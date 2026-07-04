// Lógica de detección de marcas de agua con Gemini, compartida entre la
// función serverless de Vercel (api/detect-watermark.js) y el middleware
// de desarrollo de Vite (vite.config.js).

const DEFAULT_MODEL = "gemini-2.5-flash";
// Si el modelo principal está saturado (503) o limitado (429), se intenta
// con estos modelos alternativos antes de rendirse.
const FALLBACK_MODELS = ["gemini-2.0-flash", "gemini-2.5-flash-lite"];

// Campos con nombre en lugar de box_2d posicional: el orden de las
// coordenadas posicionales es ambiguo y el modelo a veces lo invierte.
const PROMPT = `Detecta todas las marcas de agua en esta imagen (fotograma de un vídeo): logotipos, textos superpuestos, sellos de fecha/hora, iconos de plataformas o cualquier superposición de branding.
Para cada marca de agua devuelve su caja delimitadora con coordenadas normalizadas de 0 a 1000, donde xmin/xmax son horizontales (0=izquierda, 1000=derecha) e ymin/ymax son verticales (0=arriba, 1000=abajo).
IMPORTANTE: la caja debe cubrir la marca de agua COMPLETA, desde el primer carácter o borde del logo hasta el último, incluyendo símbolos como ©. Es preferible una caja algo más grande a una que corte parte de la marca.
Si no hay marcas de agua, devuelve un array vacío.`;

const PROMPT_SUFFIX = `\nFormato de respuesta (solo JSON, sin markdown): [{"xmin":0,"ymin":0,"xmax":0,"ymax":0,"label":"..."}]`;

/**
 * Detecta marcas de agua en un fotograma usando la API de Gemini.
 * @param {string} imageBase64 - JPEG en base64 (sin prefijo data:)
 * @param {string} apiKey - clave de la API de Gemini
 * @param {string} [model] - modelo a usar
 * @returns {Promise<{x:number,y:number,w:number,h:number,label:string}[]>} regiones normalizadas 0..1
 */
export async function detectWatermarkRegions(imageBase64, apiKey, model = DEFAULT_MODEL) {
  const request = (m) =>
    fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`, {
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
              { text: PROMPT + PROMPT_SUFFIX },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0,
        },
      }),
    });

  // Reintento con espera y cadena de modelos de respaldo ante saturación (503/429)
  const models = [model, ...FALLBACK_MODELS.filter((m) => m !== model)];
  let response;
  let usedModel = models[0];
  for (const m of models) {
    usedModel = m;
    response = await request(m);
    if (response.ok || ![429, 500, 503].includes(response.status)) break;
    await new Promise((r) => setTimeout(r, 1200));
    response = await request(m);
    if (response.ok || ![429, 500, 503].includes(response.status)) break;
  }

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

  const regions = boxes
    .filter((b) => [b?.xmin, b?.ymin, b?.xmax, b?.ymax].every((n) => Number.isFinite(Number(n))))
    .map((b) => {
      // Margen extra proporcional: los modelos suelen devolver cajas más
      // pequeñas que la marca real y delogo necesita cubrirla completa.
      // Cubrir píxeles limpios de más apenas se nota; cubrir de menos deja
      // la marca asomando.
      const rawXmin = Number(b.xmin) / 1000;
      const rawYmin = Number(b.ymin) / 1000;
      const rawXmax = Number(b.xmax) / 1000;
      const rawYmax = Number(b.ymax) / 1000;
      const w = Math.abs(rawXmax - rawXmin);
      const h = Math.abs(rawYmax - rawYmin);
      // Las marcas de texto (cajas anchas y delgadas) necesitan más margen
      // horizontal: los modelos suelen recortar el inicio del texto (p. ej. "©").
      const wideText = h > 0 && w / h > 2.5;
      const padX = Math.min(wideText ? 0.07 : 0.04, Math.max(0.012, w * (wideText ? 0.2 : 0.12)));
      const padY = Math.min(0.04, Math.max(0.012, h * 0.12));
      const xmin = clamp01(rawXmin - padX);
      const ymin = clamp01(rawYmin - padY);
      const xmax = clamp01(rawXmax + padX);
      const ymax = clamp01(rawYmax + padY);
      return {
        x: Math.min(xmin, xmax),
        y: Math.min(ymin, ymax),
        w: Math.abs(xmax - xmin),
        h: Math.abs(ymax - ymin),
        label: typeof b.label === "string" ? b.label.slice(0, 80) : "marca de agua",
      };
    })
    .filter((r) => r.w > 0.005 && r.h > 0.005);

  return { regions, model: usedModel };
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
    const primary = process.env.GEMINI_MODEL || undefined;
    const { regions, model } = await detectWatermarkRegions(image, apiKey, primary);
    // degraded: el modelo principal estaba saturado o sin cuota y respondió un respaldo
    const degraded = model !== (primary || "gemini-2.5-flash");
    return { status: 200, payload: { regions, model, degraded } };
  } catch (err) {
    console.error("detect-watermark:", err);
    const busy = /429|503/.test(err?.message || "");
    return {
      status: 502,
      payload: {
        error: busy
          ? "El servicio de IA está saturado en este momento. Espera unos segundos y vuelve a intentarlo."
          : "No se pudo completar la detección con IA. Puedes marcar la zona manualmente.",
        code: "UPSTREAM",
      },
    };
  }
}

function clamp01(n) {
  return Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));
}
