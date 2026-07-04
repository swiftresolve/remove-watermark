import { useRef, useState } from "react";
import { ACCENT2, BG_CARD2, TEXT_MUTED, DANGER, BORDER } from "../theme";

const MIN_REGION_DISPLAY_PX = 8;

/**
 * Muestra el vídeo y permite dibujar rectángulos sobre las marcas de agua.
 * Las regiones se guardan en píxeles del vídeo original (coordenadas intrínsecas).
 */
export default function RegionSelector({ videoUrl, regions, onChange, onVideoSize, videoElRef }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [drawing, setDrawing] = useState(null);
  const [videoSize, setVideoSize] = useState(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const scale = () => {
    const video = videoRef.current;
    if (!video || !videoSize || !video.clientWidth) return 1;
    return videoSize.w / video.clientWidth;
  };

  const toLocal = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(rect.width, e.clientX - rect.left)),
      y: Math.max(0, Math.min(rect.height, e.clientY - rect.top)),
    };
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    const size = { w: video.videoWidth, h: video.videoHeight };
    setVideoSize(size);
    setDuration(video.duration || 0);
    onVideoSize?.(size);
  };

  const handlePointerDown = (e) => {
    if (!videoSize) return;
    e.preventDefault();
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* opcional: mejora el drag fuera del área */ }
    const p = toLocal(e);
    setDrawing({ startX: p.x, startY: p.y, curX: p.x, curY: p.y });
  };

  const handlePointerMove = (e) => {
    if (!drawing) return;
    const p = toLocal(e);
    setDrawing((d) => ({ ...d, curX: p.x, curY: p.y }));
  };

  const handlePointerUp = () => {
    if (!drawing) return;
    const rect = normalizeRect(drawing);
    setDrawing(null);
    if (rect.w < MIN_REGION_DISPLAY_PX || rect.h < MIN_REGION_DISPLAY_PX) return;
    const s = scale();
    onChange([
      ...regions,
      {
        x: Math.round(rect.x * s),
        y: Math.round(rect.y * s),
        w: Math.round(rect.w * s),
        h: Math.round(rect.h * s),
      },
    ]);
  };

  const removeRegion = (index) => {
    onChange(regions.filter((_, i) => i !== index));
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const t = Number(e.target.value);
    video.currentTime = t;
    setCurrentTime(t);
  };

  const displayScale = 1 / scale();

  return (
    <div>
      <p style={{ color: TEXT_MUTED, fontSize: 14, margin: "0 0 12px", textAlign: "center" }}>
        🖱️ Dibuja un rectángulo sobre cada marca de agua que quieras eliminar
      </p>
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          position: "relative",
          borderRadius: 12,
          overflow: "hidden",
          border: `1px solid ${BORDER}`,
          cursor: "crosshair",
          touchAction: "none",
          lineHeight: 0,
          userSelect: "none",
        }}
      >
        <video
          ref={(el) => {
            videoRef.current = el;
            if (videoElRef) videoElRef.current = el;
          }}
          src={videoUrl}
          onLoadedMetadata={handleLoadedMetadata}
          muted
          playsInline
          preload="metadata"
          style={{ width: "100%", display: "block", pointerEvents: "none" }}
        />
        {regions.map((r, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: r.x * displayScale,
              top: r.y * displayScale,
              width: r.w * displayScale,
              height: r.h * displayScale,
              border: `2px solid ${ACCENT2}`,
              background: "rgba(168,85,247,0.18)",
              borderRadius: 4,
            }}
          >
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => removeRegion(i)}
              title="Quitar esta zona"
              style={{
                position: "absolute",
                top: -10,
                right: -10,
                width: 22,
                height: 22,
                borderRadius: "50%",
                border: "none",
                background: DANGER,
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                lineHeight: "22px",
                padding: 0,
              }}
            >
              ✕
            </button>
          </div>
        ))}
        {drawing && (
          <div
            style={{
              position: "absolute",
              ...normalizeRectStyle(drawing),
              border: `2px dashed ${ACCENT2}`,
              background: "rgba(168,85,247,0.12)",
              borderRadius: 4,
              pointerEvents: "none",
            }}
          />
        )}
      </div>
      {duration > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, background: BG_CARD2, borderRadius: 10, padding: "10px 14px" }}>
          <span style={{ fontSize: 13, color: TEXT_MUTED, flexShrink: 0 }}>🎞️ Explorar vídeo</span>
          <input
            type="range"
            min={0}
            max={duration}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            style={{ flex: 1, accentColor: ACCENT2 }}
          />
          <span style={{ fontSize: 12, color: TEXT_MUTED, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      )}
      {regions.length > 0 && (
        <p style={{ color: TEXT_MUTED, fontSize: 13, margin: "12px 0 0", textAlign: "center" }}>
          {regions.length} zona{regions.length > 1 ? "s" : ""} seleccionada{regions.length > 1 ? "s" : ""} · haz clic en ✕ para quitar una zona
        </p>
      )}
    </div>
  );
}

function normalizeRect({ startX, startY, curX, curY }) {
  return {
    x: Math.min(startX, curX),
    y: Math.min(startY, curY),
    w: Math.abs(curX - startX),
    h: Math.abs(curY - startY),
  };
}

function normalizeRectStyle(drawing) {
  const r = normalizeRect(drawing);
  return { left: r.x, top: r.y, width: r.w, height: r.h };
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
