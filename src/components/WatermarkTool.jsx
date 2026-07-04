import { useRef, useState } from "react";
import RegionSelector from "./RegionSelector";
import { removeWatermark } from "../lib/processor";
import { ACCENT, ACCENT2, BG_CARD, BG_CARD2, TEXT_MAIN, TEXT_MUTED, SUCCESS, DANGER, BORDER } from "../theme";

const MAX_FILE_SIZE = Number(import.meta.env.VITE_MAX_FILE_SIZE) || 524288000; // 500 MB

export default function WatermarkTool() {
  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoSize, setVideoSize] = useState(null);
  const [regions, setRegions] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");
  const [resultUrl, setResultUrl] = useState(null);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const acceptFile = (selected) => {
    setError(null);
    if (!selected) return;
    if (!selected.type.startsWith("video/")) {
      setError("El archivo debe ser un vídeo (MP4, WebM, MOV, AVI, MKV...).");
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      setError(`El archivo supera el máximo de ${formatSize(MAX_FILE_SIZE)}.`);
      return;
    }
    cleanupUrls();
    setFile(selected);
    setVideoUrl(URL.createObjectURL(selected));
    setRegions([]);
    setResultUrl(null);
    setProgress(0);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    acceptFile(e.dataTransfer.files[0]);
  };

  const handleProcess = async () => {
    if (!file || regions.length === 0 || !videoSize) return;
    setProcessing(true);
    setProgress(0);
    setError(null);
    try {
      const blob = await removeWatermark(file, regions, videoSize, {
        onStage: setStage,
        onProgress: setProgress,
      });
      setResultUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
      setError(err.message || "Ocurrió un error al procesar el vídeo. Inténtalo de nuevo.");
    } finally {
      setProcessing(false);
    }
  };

  const cleanupUrls = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
  };

  const handleReset = () => {
    cleanupUrls();
    setFile(null);
    setVideoUrl(null);
    setVideoSize(null);
    setRegions([]);
    setResultUrl(null);
    setProgress(0);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const downloadName = file ? file.name.replace(/\.[^.]+$/, "") + "-sin-marca.mp4" : "video-sin-marca.mp4";

  return (
    <div style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 24, padding: "40px", boxShadow: `0 8px 48px ${ACCENT}22` }}>
      {/* Paso 1: subir vídeo */}
      {!file && (
        <>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? ACCENT2 : BORDER}`,
              borderRadius: 16,
              padding: "60px 24px",
              textAlign: "center",
              cursor: "pointer",
              background: dragOver ? `${ACCENT}11` : "transparent",
              transition: "all 0.2s",
            }}
          >
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎬</div>
            <p style={{ fontSize: 18, fontWeight: 700, color: TEXT_MAIN, margin: "0 0 8px" }}>
              Arrastra tu vídeo aquí
            </p>
            <p style={{ color: TEXT_MUTED, fontSize: 14, margin: "0 0 24px" }}>
              o haz clic para seleccionar un archivo
            </p>
            <div style={{ display: "inline-flex", background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, color: "#fff", padding: "12px 28px", borderRadius: 10, fontWeight: 700, fontSize: 15 }}>
              Seleccionar vídeo
            </div>
            <p style={{ color: TEXT_MUTED, fontSize: 12, marginTop: 16 }}>
              MP4, WebM, MOV, AVI, MKV · Máximo {formatSize(MAX_FILE_SIZE)} · Tu vídeo no sale de tu dispositivo
            </p>
          </div>
          <input ref={fileInputRef} type="file" accept="video/*" style={{ display: "none" }} onChange={(e) => acceptFile(e.target.files[0])} />
        </>
      )}

      {/* Paso 2: marcar zonas y procesar */}
      {file && !processing && !resultUrl && (
        <div>
          <div style={{ background: BG_CARD2, borderRadius: 12, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, background: `${ACCENT}22`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
              🎬
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: TEXT_MAIN, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {file.name}
              </p>
              <p style={{ margin: "2px 0 0", color: TEXT_MUTED, fontSize: 12 }}>
                {formatSize(file.size)}{videoSize ? ` · ${videoSize.w}×${videoSize.h}px` : ""}
              </p>
            </div>
            <button onClick={handleReset} title="Quitar vídeo" style={{ background: "none", border: "none", color: TEXT_MUTED, cursor: "pointer", fontSize: 18, padding: 4 }}
              onMouseEnter={(e) => (e.currentTarget.style.color = DANGER)}
              onMouseLeave={(e) => (e.currentTarget.style.color = TEXT_MUTED)}>
              ✕
            </button>
          </div>

          <RegionSelector videoUrl={videoUrl} regions={regions} onChange={setRegions} onVideoSize={setVideoSize} />

          {error && <ErrorBox message={error} />}

          <button
            onClick={handleProcess}
            disabled={regions.length === 0}
            style={{
              background: regions.length === 0 ? BG_CARD2 : `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`,
              color: regions.length === 0 ? TEXT_MUTED : "#fff",
              border: "none",
              padding: "16px 48px",
              borderRadius: 12,
              fontWeight: 800,
              fontSize: 17,
              cursor: regions.length === 0 ? "not-allowed" : "pointer",
              boxShadow: regions.length === 0 ? "none" : `0 4px 24px ${ACCENT}66`,
              width: "100%",
              marginTop: 20,
              transition: "all 0.2s",
            }}
          >
            {regions.length === 0 ? "Marca al menos una zona para continuar" : "🚀 Eliminar marca de agua"}
          </button>
        </div>
      )}

      {/* Paso 3: procesando */}
      {processing && (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ fontSize: 48, marginBottom: 20, animation: "spin 2s linear infinite", display: "inline-block" }}>⚙️</div>
          <p style={{ fontSize: 18, fontWeight: 700, color: TEXT_MAIN, marginBottom: 8 }}>{stage || "Procesando..."}</p>
          <p style={{ color: TEXT_MUTED, fontSize: 14, marginBottom: 24 }}>
            El procesamiento ocurre en tu navegador · No cierres esta ventana
          </p>
          <div style={{ background: BG_CARD2, borderRadius: 100, height: 12, overflow: "hidden", marginBottom: 12 }}>
            <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT2})`, borderRadius: 100, transition: "width 0.3s ease", boxShadow: `0 0 12px ${ACCENT2}` }} />
          </div>
          <p style={{ color: ACCENT2, fontWeight: 700, fontSize: 15 }}>{progress}%</p>
        </div>
      )}

      {/* Paso 4: resultado */}
      {resultUrl && !processing && (
        <div style={{ textAlign: "center", padding: "10px 0" }}>
          <div style={{ width: 72, height: 72, background: `${SUCCESS}22`, borderRadius: 50, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 16px", border: `2px solid ${SUCCESS}44` }}>
            ✅
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: TEXT_MAIN, margin: "0 0 8px" }}>
            ¡Marca de agua eliminada!
          </h3>
          <p style={{ color: TEXT_MUTED, fontSize: 15, marginBottom: 20 }}>
            Revisa el resultado y descarga tu vídeo limpio.
          </p>
          <video src={resultUrl} controls style={{ width: "100%", borderRadius: 12, border: `1px solid ${BORDER}`, marginBottom: 24, maxHeight: 420, background: "#000" }} />
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href={resultUrl}
              download={downloadName}
              style={{ background: `linear-gradient(135deg, ${SUCCESS}, #16a34a)`, color: "#fff", textDecoration: "none", padding: "14px 32px", borderRadius: 12, fontWeight: 700, fontSize: 16, boxShadow: "0 4px 20px #22c55e44", display: "inline-block" }}
            >
              ⬇️ Descargar vídeo
            </a>
            <button
              onClick={handleReset}
              style={{ background: "transparent", color: TEXT_MUTED, border: `1px solid ${BORDER}`, padding: "14px 32px", borderRadius: 12, fontWeight: 600, fontSize: 16, cursor: "pointer" }}
            >
              Procesar otro vídeo
            </button>
          </div>
        </div>
      )}

      {error && !file && <ErrorBox message={error} />}
    </div>
  );
}

function ErrorBox({ message }) {
  return (
    <div style={{ background: `${DANGER}18`, border: `1px solid ${DANGER}55`, borderRadius: 10, padding: "12px 16px", marginTop: 16, color: "#fca5a5", fontSize: 14, textAlign: "center" }}>
      ⚠️ {message}
    </div>
  );
}

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(0) + " MB";
}
