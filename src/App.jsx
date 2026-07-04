import { useState, useRef, useEffect } from "react";

const ACCENT = "#7c3aed";
const ACCENT2 = "#a855f7";
const ACCENT_LIGHT = "#ede9fe";
const BG_DARK = "#0f0a1e";
const BG_CARD = "#1a1033";
const BG_CARD2 = "#221644";
const TEXT_MAIN = "#f5f3ff";
const TEXT_MUTED = "#a89ec5";
const SUCCESS = "#22c55e";
const BORDER = "#2d1f5e";

const features = [
  {
    icon: "🤖",
    title: "Detección con IA",
    desc: "Detecta automáticamente logotipos, superposiciones y marcas de branding en cualquier parte del vídeo.",
  },
  {
    icon: "🎬",
    title: "Alta calidad",
    desc: "Mantiene la resolución y calidad original del vídeo tras eliminar la marca de agua.",
  },
  {
    icon: "⚡",
    title: "Procesamiento rápido",
    desc: "Elimina marcas de agua en segundos gracias a nuestra infraestructura de IA en la nube.",
  },
  {
    icon: "🔒",
    title: "100% seguro",
    desc: "Tus vídeos se procesan de forma privada y se eliminan automáticamente después del proceso.",
  },
  {
    icon: "📁",
    title: "Múltiples formatos",
    desc: "Compatible con MP4, AVI, MOV, MKV, WebM y muchos más formatos de vídeo.",
  },
  {
    icon: "🌐",
    title: "Sin instalación",
    desc: "Funciona directamente en el navegador. No necesitas descargar ni instalar nada.",
  },
];

const faqs = [
  {
    q: "¿Qué tipos de marcas de agua puede eliminar?",
    a: "Remove Watermark puede eliminar logotipos de plataformas, textos superpuestos, marcas de branding, sellos de fecha/hora y cualquier tipo de superposición estática o semi-estática en vídeos.",
  },
  {
    q: "¿Se verá afectada la calidad del vídeo?",
    a: "No. Nuestra IA está diseñada para mantener la máxima calidad visual posible. El área donde estaba la marca de agua se reconstruye inteligentemente usando los píxeles circundantes.",
  },
  {
    q: "¿Qué formatos de vídeo son compatibles?",
    a: "Soportamos MP4, AVI, MOV, MKV, WebM, FLV y WMV. El tamaño máximo de archivo es de 500 MB por vídeo.",
  },
  {
    q: "¿Es seguro subir mis vídeos?",
    a: "Sí, absolutamente. Todos los archivos se transfieren mediante conexión cifrada HTTPS y se eliminan automáticamente de nuestros servidores tras 1 hora del procesamiento.",
  },
  {
    q: "¿Cuánto tiempo tarda el proceso?",
    a: "La mayoría de los vídeos de menos de 5 minutos se procesan en menos de 30 segundos. Vídeos más largos pueden tardar entre 1 y 5 minutos dependiendo de la resolución.",
  },
];

const steps = [
  { num: "01", title: "Sube tu vídeo", desc: "Arrastra y suelta tu vídeo o haz clic para seleccionarlo desde tu dispositivo." },
  { num: "02", title: "IA detecta la marca", desc: "Nuestra IA analiza el vídeo y detecta automáticamente todas las marcas de agua." },
  { num: "03", title: "Descarga el resultado", desc: "Descarga tu vídeo limpio y sin marcas de agua en segundos." },
];

export default function App() {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [hoveredStep, setHoveredStep] = useState(null);
  const fileInputRef = useRef(null);
  const progressRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type.startsWith("video/")) {
      setFile(dropped);
      setDone(false);
      setProgress(0);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setDone(false);
      setProgress(0);
    }
  };

  const handleProcess = () => {
    if (!file) return;
    setProcessing(true);
    setProgress(0);
    setDone(false);
    // TODO: Integrar con API real de eliminación de marcas de agua
    // Ejemplo: const formData = new FormData(); formData.append('video', file);
    // const response = await fetch('/api/remove-watermark', { method: 'POST', body: formData });
    let prog = 0;
    const stages = [
      { target: 15, speed: 80, label: "Analizando vídeo..." },
      { target: 40, speed: 60, label: "Detectando marcas de agua..." },
      { target: 70, speed: 50, label: "Eliminando marcas con IA..." },
      { target: 90, speed: 70, label: "Reconstruyendo imagen..." },
      { target: 100, speed: 100, label: "Finalizando..." },
    ];
    let stageIdx = 0;
    const interval = setInterval(() => {
      if (prog < stages[stageIdx].target) {
        prog += 1;
        setProgress(prog);
      } else if (stageIdx < stages.length - 1) {
        stageIdx++;
      } else {
        clearInterval(interval);
        setProcessing(false);
        setDone(true);
      }
    }, stages[stageIdx]?.speed || 60);
  };

  const handleReset = () => {
    setFile(null);
    setProgress(0);
    setDone(false);
    setProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getProgressLabel = () => {
    if (progress < 15) return "Analizando vídeo...";
    if (progress < 40) return "Detectando marcas de agua...";
    if (progress < 70) return "Eliminando marcas con IA...";
    if (progress < 90) return "Reconstruyendo imagen...";
    return "Finalizando...";
  };

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif", background: BG_DARK, minHeight: "100vh", color: TEXT_MAIN }}>
      {/* Navbar */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(15,10,30,0.92)", backdropFilter: "blur(16px)", borderBottom: `1px solid ${BORDER}`, padding: "0 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
              ✂️
            </div>
            <span style={{ fontWeight: 800, fontSize: 20, background: `linear-gradient(90deg, ${ACCENT2}, #c084fc)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Remove Watermark
            </span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <NavLink href="#herramienta">Herramienta</NavLink>
            <NavLink href="#caracteristicas">Características</NavLink>
            <NavLink href="#como-funciona">Cómo funciona</NavLink>
            <NavLink href="#faq">FAQ</NavLink>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: "80px 24px 60px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)", width: 600, height: 400, background: `radial-gradient(ellipse, ${ACCENT}33 0%, transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ maxWidth: 760, margin: "0 auto", position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${ACCENT}22`, border: `1px solid ${ACCENT}44`, borderRadius: 100, padding: "6px 16px", fontSize: 13, color: ACCENT2, marginBottom: 24, fontWeight: 600 }}>
            <span>✨</span> Impulsado por Gemini AI
          </div>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 900, lineHeight: 1.1, margin: "0 0 20px", letterSpacing: "-0.02em" }}>
            Elimina marcas de agua de{" "}
            <span style={{ background: `linear-gradient(90deg, ${ACCENT2}, #e879f9)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              vídeos en segundos
            </span>
          </h1>
          <p style={{ fontSize: "clamp(1rem, 2vw, 1.2rem)", color: TEXT_MUTED, maxWidth: 580, margin: "0 auto 40px", lineHeight: 1.7 }}>
            Detecta logotipos, superposiciones y marcas de branding automáticamente con IA, manteniendo una alta calidad de vídeo.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#herramienta" style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, color: "#fff", padding: "14px 32px", borderRadius: 12, fontWeight: 700, fontSize: 16, textDecoration: "none", boxShadow: `0 4px 24px ${ACCENT}66`, transition: "transform 0.2s, box-shadow 0.2s", display: "inline-block" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 32px ${ACCENT}88`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 4px 24px ${ACCENT}66`; }}>
              Eliminar marca de agua gratis
            </a>
            <a href="#como-funciona" style={{ background: "transparent", color: TEXT_MAIN, padding: "14px 32px", borderRadius: 12, fontWeight: 600, fontSize: 16, textDecoration: "none", border: `1px solid ${BORDER}`, transition: "border-color 0.2s, background 0.2s", display: "inline-block" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT2; e.currentTarget.style.background = `${ACCENT}11`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.background = "transparent"; }}>
              Cómo funciona
            </a>
          </div>
          <div style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: 40, flexWrap: "wrap" }}>
            {[["🆓", "Gratis para usar"], ["⚡", "Resultados en segundos"], ["🔒", "Privado y seguro"]].map(([icon, text]) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 8, color: TEXT_MUTED, fontSize: 14 }}>
                <span>{icon}</span> {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upload Tool */}
      <section id="herramienta" style={{ padding: "0 24px 80px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 24, padding: "40px", boxShadow: `0 8px 48px ${ACCENT}22` }}>
            {!file && !done && (
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
                    MP4, AVI, MOV, MKV, WebM · Máximo 500 MB
                  </p>
                </div>
                <input ref={fileInputRef} type="file" accept="video/*" style={{ display: "none" }} onChange={handleFileChange} />
              </>
            )}

            {file && !processing && !done && (
              <div style={{ textAlign: "center" }}>
                <div style={{ background: BG_CARD2, borderRadius: 12, padding: "20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 16, textAlign: "left" }}>
                  <div style={{ width: 52, height: 52, background: `${ACCENT}22`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
                    🎬
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: TEXT_MAIN, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {file.name}
                    </p>
                    <p style={{ margin: "4px 0 0", color: TEXT_MUTED, fontSize: 13 }}>
                      {formatSize(file.size)}
                    </p>
                  </div>
                  <button onClick={handleReset} style={{ background: "none", border: "none", color: TEXT_MUTED, cursor: "pointer", fontSize: 20, padding: 4, borderRadius: 6, transition: "color 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
                    onMouseLeave={e => e.currentTarget.style.color = TEXT_MUTED}>
                    ✕
                  </button>
                </div>
                <button onClick={handleProcess}
                  style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, color: "#fff", border: "none", padding: "16px 48px", borderRadius: 12, fontWeight: 800, fontSize: 17, cursor: "pointer", boxShadow: `0 4px 24px ${ACCENT}66`, transition: "transform 0.2s, box-shadow 0.2s", width: "100%" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 32px ${ACCENT}88`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 4px 24px ${ACCENT}66`; }}>
                  🚀 Eliminar marca de agua
                </button>
              </div>
            )}

            {processing && (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 20, animation: "spin 2s linear infinite", display: "inline-block" }}>⚙️</div>
                <p style={{ fontSize: 18, fontWeight: 700, color: TEXT_MAIN, marginBottom: 8 }}>{getProgressLabel()}</p>
                <p style={{ color: TEXT_MUTED, fontSize: 14, marginBottom: 24 }}>No cierres esta ventana durante el proceso</p>
                <div style={{ background: BG_CARD2, borderRadius: 100, height: 12, overflow: "hidden", marginBottom: 12 }}>
                  <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT2})`, borderRadius: 100, transition: "width 0.3s ease", boxShadow: `0 0 12px ${ACCENT2}` }} />
                </div>
                <p style={{ color: ACCENT2, fontWeight: 700, fontSize: 15 }}>{progress}%</p>
              </div>
            )}

            {done && (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ width: 80, height: 80, background: `${SUCCESS}22`, borderRadius: 50, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, margin: "0 auto 20px", border: `2px solid ${SUCCESS}44` }}>
                  ✅
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: TEXT_MAIN, margin: "0 0 8px" }}>
                  ¡Marca de agua eliminada!
                </h3>
                <p style={{ color: TEXT_MUTED, fontSize: 15, marginBottom: 28 }}>
                  Tu vídeo está listo para descargar sin marcas de agua.
                </p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                  {/* TODO: Reemplazar href con URL real del archivo procesado desde la API */}
                  <button style={{ background: `linear-gradient(135deg, ${SUCCESS}, #16a34a)`, color: "#fff", border: "none", padding: "14px 32px", borderRadius: 12, fontWeight: 700, fontSize: 16, cursor: "pointer", boxShadow: "0 4px 20px #22c55e44", transition: "transform 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                    ⬇️ Descargar vídeo
                  </button>
                  <button onClick={handleReset}
                    style={{ background: "transparent", color: TEXT_MUTED, border: `1px solid ${BORDER}`, padding: "14px 32px", borderRadius: 12, fontWeight: 600, fontSize: 16, cursor: "pointer", transition: "border-color 0.2s, color 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT2; e.currentTarget.style.color = TEXT_MAIN; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = TEXT_MUTED; }}>
                    Procesar otro vídeo
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Trust badges */}
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
            {[["🛡️", "SSL Cifrado"], ["🗑️", "Auto-borrado en 1h"], ["⭐", "Sin registro necesario"]].map(([icon, text]) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 6, background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 100, padding: "8px 16px", fontSize: 13, color: TEXT_MUTED }}>
                <span>{icon}</span> {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="caracteristicas" style={{ padding: "60px 24px 80px", background: `${BG_CARD}66` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <SectionHeader
            tag="Características"
            title="Todo lo que necesitas para eliminar marcas de agua"
            desc="Remove Watermark combina IA de última generación con una interfaz sencilla para que obtengas resultados profesionales sin esfuerzo."
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {features.map((f, i) => (
              <div key={i}
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
                style={{
                  background: hoveredFeature === i ? BG_CARD2 : BG_CARD,
                  border: `1px solid ${hoveredFeature === i ? ACCENT + "66" : BORDER}`,
                  borderRadius: 16,
                  padding: "28px",
                  transition: "all 0.25s",
                  transform: hoveredFeature === i ? "translateY(-4px)" : "translateY(0)",
                  boxShadow: hoveredFeature === i ? `0 8px 32px ${ACCENT}22` : "none",
                  cursor: "default",
                }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: TEXT_MAIN, margin: "0 0 10px" }}>{f.title}</h3>
                <p style={{ color: TEXT_MUTED, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <SectionHeader
            tag="Cómo funciona"
            title="3 pasos para eliminar marcas de agua"
            desc="El proceso es tan sencillo como subir tu vídeo, esperar unos segundos y descargar el resultado limpio."
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
            {steps.map((s, i) => (
              <div key={i}
                onMouseEnter={() => setHoveredStep(i)}
                onMouseLeave={() => setHoveredStep(null)}
                style={{
                  position: "relative",
                  background: hoveredStep === i ? BG_CARD2 : BG_CARD,
                  border: `1px solid ${hoveredStep === i ? ACCENT + "66" : BORDER}`,
                  borderRadius: 20,
                  padding: "32px 28px",
                  transition: "all 0.25s",
                  transform: hoveredStep === i ? "translateY(-4px)" : "translateY(0)",
                  boxShadow: hoveredStep === i ? `0 8px 32px ${ACCENT}22` : "none",
                }}>
                <div style={{ fontSize: 48, fontWeight: 900, color: `${ACCENT}44`, lineHeight: 1, marginBottom: 16, fontVariantNumeric: "tabular-nums" }}>
                  {s.num}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: TEXT_MAIN, margin: "0 0 10px" }}>{s.title}</h3>
                <p style={{ color: TEXT_MUTED, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
                {i < steps.length - 1 && (
                  <div style={{ position: "absolute", right: -12, top: "50%", transform: "translateY(-50%)", color: ACCENT2, fontSize: 20, display: window.innerWidth > 700 ? "block" : "none" }}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: "0 24px 80px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ background: `linear-gradient(135deg, ${ACCENT}33, ${ACCENT2}22)`, border: `1px solid ${ACCENT}44`, borderRadius: 24, padding: "48px 40px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 32, textAlign: "center" }}>
            {[["5M+", "Vídeos procesados"], ["99.8%", "Tasa de éxito"], ["< 30s", "Tiempo promedio"], ["4.9★", "Puntuación media"]].map(([num, label]) => (
              <div key={label}>
                <div style={{ fontSize: 36, fontWeight: 900, background: `linear-gradient(90deg, ${ACCENT2}, #e879f9)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1, marginBottom: 8 }}>{num}</div>
                <div style={{ color: TEXT_MUTED, fontSize: 14 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ padding: "0 24px 80px", background: `${BG_CARD}66` }}>
        <div style={{ maxWidth: 760, margin: "0 auto", paddingTop: 60 }}>
          <SectionHeader
            tag="FAQ"
            title="Preguntas frecuentes"
            desc="Encuentra respuestas a las preguntas más comunes sobre Remove Watermark."
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {faqs.map((faq, i) => (
              <div key={i}
                style={{ background: BG_CARD, border: `1px solid ${openFaq === i ? ACCENT + "66" : BORDER}`, borderRadius: 14, overflow: "hidden", transition: "border-color 0.2s" }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: "100%", background: "none", border: "none", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", textAlign: "left", gap: 16 }}>
                  <span style={{ color: TEXT_MAIN, fontWeight: 600, fontSize: 15 }}>{faq.q}</span>
                  <span style={{ color: ACCENT2, fontSize: 18, flexShrink: 0, transition: "transform 0.2s", transform: openFaq === i ? "rotate(45deg)" : "rotate(0)" }}>+</span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: "0 24px 20px", color: TEXT_MUTED, fontSize: 14, lineHeight: 1.7, borderTop: `1px solid ${BORDER}`, paddingTop: 16 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ background: `linear-gradient(135deg, ${BG_CARD}, ${BG_CARD2})`, border: `1px solid ${BORDER}`, borderRadius: 28, padding: "60px 40px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, background: `radial-gradient(circle, ${ACCENT}33, transparent 70%)`, pointerEvents: "none" }} />
            <div style={{ fontSize: 48, marginBottom: 20 }}>🎯</div>
            <h2 style={{ fontSize: "clamp(1.5rem, 4vw, 2.2rem)", fontWeight: 900, color: TEXT_MAIN, margin: "0 0 16px" }}>
              ¿Listo para eliminar marcas de agua?
            </h2>
            <p style={{ color: TEXT_MUTED, fontSize: 16, marginBottom: 32, lineHeight: 1.7 }}>
              Empieza gratis ahora mismo. Sin registro, sin instalación. Solo sube tu vídeo y obtén resultados en segundos.
            </p>
            <a href="#herramienta"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, color: "#fff", padding: "16px 40px", borderRadius: 12, fontWeight: 800, fontSize: 17, textDecoration: "none", boxShadow: `0 4px 24px ${ACCENT}66`, display: "inline-block", transition: "transform 0.2s, box-shadow 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 32px ${ACCENT}88`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 4px 24px ${ACCENT}66`; }}>
              Empezar gratis →
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${BORDER}`, padding: "32px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
              ✂️
            </div>
            <span style={{ fontWeight: 800, fontSize: 16, background: `linear-gradient(90deg, ${ACCENT2}, #c084fc)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Remove Watermark
            </span>
          </div>
          <p style={{ color: TEXT_MUTED, fontSize: 13, margin: "0 0 16px" }}>
            Elimina marcas de agua de vídeos en línea con tecnología de IA avanzada.
          </p>
          <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
            {["Inicio", "Herramienta", "Características", "FAQ"].map(link => (
              <a key={link} href={`#${link.toLowerCase()}`} style={{ color: TEXT_MUTED, fontSize: 13, textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.color = TEXT_MAIN}
                onMouseLeave={e => e.currentTarget.style.color = TEXT_MUTED}>
                {link}
              </a>
            ))}
          </div>
          <p style={{ color: `${TEXT_MUTED}88`, fontSize: 12, margin: 0 }}>
            © {new Date().getFullYear()} Remove Watermark. Todos los derechos reservados.
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${BG_DARK}; }
        ::-webkit-scrollbar-thumb { background: ${BORDER}; border-radius: 3px; }
      `}</style>
    </div>
  );
}

function NavLink({ href, children }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        color: hovered ? "#f5f3ff" : "#a89ec5",
        textDecoration: "none",
        fontSize: 14,
        fontWeight: 500,
        padding: "6px 12px",
        borderRadius: 8,
        background: hovered ? "rgba(124,58,237,0.15)" : "transparent",
        transition: "all 0.2s",
        display: "none",
      }}
      className="nav-link"
    >
      {children}
    </a>
  );
}

function SectionHeader({ tag, title, desc }) {
  return (
    <div style={{ textAlign: "center", marginBottom: 48 }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#7c3aed22", border: "1px solid #7c3aed44", borderRadius: 100, padding: "6px 16px", fontSize: 13, color: "#a855f7", marginBottom: 16, fontWeight: 600 }}>
        {tag}
      </div>
      <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.4rem)", fontWeight: 900, color: "#f5f3ff", margin: "0 0 16px", letterSpacing: "-0.01em" }}>
        {title}
      </h2>
      <p style={{ color: "#a89ec5", fontSize: 16, maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>
        {desc}
      </p>
    </div>
  );
}