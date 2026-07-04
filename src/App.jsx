import { useState } from "react";
import WatermarkTool from "./components/WatermarkTool";
import { ACCENT, ACCENT2, BG_DARK, BG_CARD, BG_CARD2, TEXT_MAIN, TEXT_MUTED, BORDER } from "./theme";

const features = [
  {
    icon: "🎯",
    title: "Selección precisa",
    desc: "Marca exactamente la zona de la marca de agua sobre el vídeo. Puedes seleccionar varias zonas a la vez.",
  },
  {
    icon: "🎬",
    title: "Alta calidad",
    desc: "El área de la marca de agua se reconstruye usando los píxeles circundantes, manteniendo la resolución original.",
  },
  {
    icon: "🔒",
    title: "100% privado",
    desc: "Todo el procesamiento ocurre en tu navegador. Tu vídeo nunca se sube a ningún servidor.",
  },
  {
    icon: "🆓",
    title: "Gratis y sin límites",
    desc: "Sin registro, sin cuentas, sin pagos. Procesa todos los vídeos que quieras.",
  },
  {
    icon: "📁",
    title: "Múltiples formatos",
    desc: "Compatible con MP4, WebM, MOV, AVI, MKV y más. El resultado se descarga siempre como MP4.",
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
    a: "Puede eliminar logotipos, textos superpuestos, sellos de fecha/hora y cualquier superposición estática: solo marca la zona donde aparece. Para marcas de agua que se mueven por el vídeo, marca una zona que cubra todo su recorrido.",
  },
  {
    q: "¿Se verá afectada la calidad del vídeo?",
    a: "La zona donde estaba la marca de agua se reconstruye usando los píxeles circundantes (filtro delogo de FFmpeg). El resto del vídeo se re-codifica en alta calidad manteniendo la resolución original.",
  },
  {
    q: "¿Es seguro subir mis vídeos?",
    a: "No subes nada: el procesamiento ocurre completamente en tu navegador gracias a WebAssembly. Tu vídeo nunca sale de tu dispositivo, por lo que es la opción más privada posible.",
  },
  {
    q: "¿Qué formatos de vídeo son compatibles?",
    a: "Soportamos MP4, WebM, MOV, AVI, MKV y otros formatos comunes. El vídeo procesado se descarga siempre en formato MP4 (H.264), compatible con cualquier dispositivo.",
  },
  {
    q: "¿Cuánto tiempo tarda el proceso?",
    a: "Depende de la potencia de tu dispositivo y de la duración del vídeo, ya que se procesa localmente. Como referencia, un clip de 1 minuto suele tardar entre 1 y 3 minutos. La primera vez tarda un poco más porque se descarga el motor de vídeo (~30 MB).",
  },
  {
    q: "¿Solo debo usarlo con vídeos propios?",
    a: "Sí. Esta herramienta está pensada para eliminar marcas de agua de vídeos sobre los que tienes derechos: tu propio contenido, material con licencia o vídeos con permiso del autor.",
  },
];

const steps = [
  { num: "01", title: "Sube tu vídeo", desc: "Arrastra y suelta tu vídeo o haz clic para seleccionarlo. No se sube a ningún servidor." },
  { num: "02", title: "Marca la zona", desc: "Dibuja un rectángulo sobre cada marca de agua directamente en la vista previa del vídeo." },
  { num: "03", title: "Procesa y descarga", desc: "El vídeo se procesa en tu navegador y descargas el resultado limpio en MP4." },
];

const stats = [
  ["100%", "Procesamiento local"],
  ["0", "Vídeos subidos a servidores"],
  ["Gratis", "Sin registro ni límites"],
  ["MP4", "Resultado universal"],
];

export default function App() {
  const [openFaq, setOpenFaq] = useState(null);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [hoveredStep, setHoveredStep] = useState(null);

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
            <span>🔒</span> 100% local: tu vídeo nunca sale de tu dispositivo
          </div>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 900, lineHeight: 1.1, margin: "0 0 20px", letterSpacing: "-0.02em" }}>
            Elimina marcas de agua de{" "}
            <span style={{ background: `linear-gradient(90deg, ${ACCENT2}, #e879f9)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              tus vídeos
            </span>
          </h1>
          <p style={{ fontSize: "clamp(1rem, 2vw, 1.2rem)", color: TEXT_MUTED, maxWidth: 580, margin: "0 auto 40px", lineHeight: 1.7 }}>
            Marca la zona de la marca de agua y elimínala al instante. Todo el procesamiento ocurre en tu navegador: privado, gratis y sin subir archivos.
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
            {[["🆓", "Gratis para usar"], ["🔒", "Privado: sin subidas"], ["🌐", "Funciona sin conexión*"]].map(([icon, text]) => (
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
          <WatermarkTool />

          {/* Trust badges */}
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
            {[["🔒", "Nada sale de tu dispositivo"], ["🗑️", "Nada que borrar: no subimos nada"], ["⭐", "Sin registro necesario"]].map(([icon, text]) => (
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
            desc="Remove Watermark combina procesamiento de vídeo profesional con una interfaz sencilla, sin comprometer tu privacidad."
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
            desc="Sube tu vídeo, marca la zona de la marca de agua y descarga el resultado limpio. Así de simple."
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
                  <div className="step-arrow" style={{ position: "absolute", right: -12, top: "50%", transform: "translateY(-50%)", color: ACCENT2, fontSize: 20 }}>→</div>
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
            {stats.map(([num, label]) => (
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
              Empieza gratis ahora mismo. Sin registro, sin instalación y sin subir tus vídeos a ningún servidor.
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
            Elimina marcas de agua de tus vídeos directamente en el navegador. Úsalo solo con contenido sobre el que tengas derechos.
          </p>
          <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
            {[["Herramienta", "#herramienta"], ["Características", "#caracteristicas"], ["Cómo funciona", "#como-funciona"], ["FAQ", "#faq"]].map(([label, href]) => (
              <a key={label} href={href} style={{ color: TEXT_MUTED, fontSize: 13, textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.color = TEXT_MAIN}
                onMouseLeave={e => e.currentTarget.style.color = TEXT_MUTED}>
                {label}
              </a>
            ))}
          </div>
          <p style={{ color: `${TEXT_MUTED}88`, fontSize: 12, margin: 0 }}>
            © {new Date().getFullYear()} Remove Watermark. Todos los derechos reservados. · *Tras la primera carga del motor de vídeo.
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .step-arrow { display: none; }
        @media (min-width: 700px) {
          .step-arrow { display: block; }
        }
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
        color: hovered ? TEXT_MAIN : TEXT_MUTED,
        textDecoration: "none",
        fontSize: 14,
        fontWeight: 500,
        padding: "6px 12px",
        borderRadius: 8,
        background: hovered ? "rgba(124,58,237,0.15)" : "transparent",
        transition: "all 0.2s",
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
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${ACCENT}22`, border: `1px solid ${ACCENT}44`, borderRadius: 100, padding: "6px 16px", fontSize: 13, color: ACCENT2, marginBottom: 16, fontWeight: 600 }}>
        {tag}
      </div>
      <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.4rem)", fontWeight: 900, color: TEXT_MAIN, margin: "0 0 16px", letterSpacing: "-0.01em" }}>
        {title}
      </h2>
      <p style={{ color: TEXT_MUTED, fontSize: 16, maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>
        {desc}
      </p>
    </div>
  );
}
