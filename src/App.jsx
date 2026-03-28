import { useState, useRef } from "react";

const C = {
  cream: "#F5F0E8", dark: "#1A1512", orange: "#E8621A",
  green: "#2A7A4B", sand: "#E8DFC8", card: "#FDFAF4",
  border: "#DDD5C0", muted: "#7A6E5F",
};

const TAG_LABELS = {
  social_proof: "Dovadă socială", loss_aversion: "Aversiune pierdere",
  authority_bias: "Autoritate", urgency: "Urgență",
  curiosity_gap: "Gap curiozitate", identity: "Identitate",
  fear_of_missing_out: "FOMO", reciprocity: "Reciprocitate",
};
const TAG_CSS = {
  social_proof: { border: "#2196F3", color: "#1565C0", bg: "rgba(33,150,243,.08)" },
  loss_aversion: { border: "#E91E63", color: "#C2185B", bg: "rgba(233,30,99,.08)" },
  authority_bias: { border: "#9C27B0", color: "#6A1B9A", bg: "rgba(156,39,176,.08)" },
  urgency: { border: "#FF5722", color: "#BF360C", bg: "rgba(255,87,34,.08)" },
  curiosity_gap: { border: "#009688", color: "#00695C", bg: "rgba(0,150,136,.08)" },
  identity: { border: "#9C27B0", color: "#6A1B9A", bg: "rgba(156,39,176,.08)" },
  fear_of_missing_out: { border: "#FF5722", color: "#BF360C", bg: "rgba(255,87,34,.08)" },
  reciprocity: { border: "#009688", color: "#00695C", bg: "rgba(0,150,136,.08)" },
};

const MSGS = ["Selectăm unghiuri psihologice...", "Aplicăm principii de conversie...", "Adaptăm pentru piața română...", "Construim shot list-urile...", "Aproape gata..."];
const PLATFORMS = ["Instagram Reels", "TikTok", "YouTube Shorts", "Facebook", "LinkedIn"];
const LENGTHS = ["Scurt (20-45s)", "Mediu (45-90s)", "Lung (1-2 min)"];

function Inp({ val, set, ph, rows }) {
  const base = { width: "100%", background: "white", border: `1px solid ${C.border}`, borderRadius: 7, padding: "9px 11px", fontFamily: "inherit", fontSize: 13, color: C.dark, outline: "none", boxSizing: "border-box" };
  return rows
    ? <textarea value={val} onChange={e => set(e.target.value)} placeholder={ph} rows={rows} style={{ ...base, resize: "vertical" }} />
    : <input value={val} onChange={e => set(e.target.value)} placeholder={ph} style={base} />;
}

function Sel({ val, set, opts }) {
  return <select value={val} onChange={e => set(e.target.value)} style={{ width: "100%", background: "white", border: `1px solid ${C.border}`, borderRadius: 7, padding: "9px 11px", fontFamily: "inherit", fontSize: 13, color: C.dark, outline: "none", appearance: "none", boxSizing: "border-box" }}>
    {opts.map(o => <option key={o}>{o}</option>)}
  </select>;
}

function FG({ label, children }) {
  return <div style={{ marginBottom: 12 }}>
    <div style={{ fontSize: 12, fontWeight: 600, color: C.dark, marginBottom: 4 }}>{label}</div>
    {children}
  </div>;
}

function buildPrompt(mode, f) {
  const jsonFormat = `{"variants":[{"hook_name":"str","hook":"str","voiceover":"str","on_screen_text":"str","shot_list":["s1","s2","s3"],"cta":"str","psychology_tags":["social_proof"],"conversion_score":85,"score_breakdown":{"attention":90,"value":85,"proof":80,"friction":75,"cta":88,"platform_fit":82},"why_it_works":"str"}]}`;
  if (mode === "manual") {
    return `Esti expert copywriter pentru conversie pe piata romaneasca. Genereaza 3 variante de script video pentru reclame social media bazate pe psihologia comportamentala.

Oferta: ${f.offer} | Categorie: ${f.category} | Valoare: ${f.value} | Audienta: ${f.audience} | Stadiu: ${f.stage} | Obiectiv: ${f.objective} | Platforma: ${f.platform} | Durata: ${f.length}${f.voice ? " | Ton: " + f.voice.slice(0, 150) : ""}

Returneaza EXCLUSIV JSON valid, fara text inainte sau dupa, fara backticks, fara markdown. Exact acest format cu 3 variante:
${jsonFormat}`;
  } else if (mode === "analyzer") {
    return `Analizeaza aceasta pagina de vanzari si genereaza 3 scripturi video pentru ${f.platform}, durata ${f.length}, in romana autentica.

PAGINA: ${f.page.slice(0, 1500)}

Returneaza EXCLUSIV JSON valid fara text inainte sau dupa:
${jsonFormat}`;
  } else {
    return `Analizeaza structura si psihologia acestui script si genereaza 3 variante originale mai bune pentru piata romana. Platforma: ${f.platform}. Durata: ${f.length}.

SCRIPTUL: ${f.script.slice(0, 1000)}

Returneaza EXCLUSIV JSON valid fara text inainte sau dupa:
${jsonFormat}`;
  }
}

async function callAPI(prompt) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000);
  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (e) {
    clearTimeout(timeout);
    if (e.name === "AbortError") throw new Error("Timeout — încearcă din nou");
    throw e;
  }
}

function VariantCard({ v, onRefine }) {
  const [refText, setRefText] = useState("");
  const [refining, setRefining] = useState(false);
  const sb = v.score_breakdown || {};

  const doRefine = async () => {
    if (!refText.trim()) return;
    setRefining(true);
    try {
      const prompt = `Ai generat acest script:\nHook: ${v.hook}\nVoiceover: ${v.voiceover}\nCTA: ${v.cta}\n\nModifica-l astfel: "${refText}"\n\nReturneaza EXCLUSIV JSON valid, un singur obiect:\n{"hook_name":"s","hook":"s","voiceover":"s","on_screen_text":"s","shot_list":["s","s","s"],"cta":"s","psychology_tags":["social_proof"],"conversion_score":85,"score_breakdown":{"attention":90,"value":85,"proof":80,"friction":75,"cta":88,"platform_fit":82},"why_it_works":"s"}`;
      const result = await callAPI(prompt);
      onRefine(result.variants ? result.variants[0] : result);
      setRefText("");
    } catch (e) { alert("Eroare: " + e.message); }
    setRefining(false);
  };

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
      <div style={{ padding: "18px 22px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: C.orange, fontWeight: 700, marginBottom: 5 }}>🎯 {v.hook_name}</div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, lineHeight: 1.35 }}>{v.hook}</div>
        </div>
        <div style={{ minWidth: 52, height: 52, borderRadius: "50%", border: `3px solid ${C.orange}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: C.orange, lineHeight: 1 }}>{v.conversion_score}</div>
          <div style={{ fontSize: 8, color: C.muted, textTransform: "uppercase" }}>scor</div>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, padding: "12px 22px", borderBottom: `1px solid ${C.border}`, background: "rgba(232,98,26,.03)" }}>
        {(v.psychology_tags || []).map(t => {
          const s = TAG_CSS[t] || TAG_CSS.social_proof;
          return <span key={t} style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", padding: "3px 9px", borderRadius: 20, border: `1px solid ${s.border}`, color: s.color, background: s.bg }}>{TAG_LABELS[t] || t}</span>;
        })}
      </div>

      <div style={{ padding: "18px 22px", display: "grid", gap: 12 }}>
        {[
          { label: "🎙 Voiceover — ce spui", color: "#1565C0", bg: "rgba(33,150,243,.05)", content: <div style={{ fontSize: 13, lineHeight: 1.7 }}>{v.voiceover}</div> },
          { label: "📱 Text on-screen", color: "#6A1B9A", bg: "rgba(156,39,176,.05)", content: <div style={{ fontSize: 16, fontWeight: 700 }}>{v.on_screen_text}</div> },
          { label: "🎬 Shot list — ce filmezi", color: C.green, bg: "rgba(42,122,75,.05)", content: <div>{(v.shot_list || []).map((s, i) => <div key={i} style={{ display: "flex", gap: 9, marginBottom: 7, alignItems: "flex-start" }}><div style={{ minWidth: 20, height: 20, background: C.green, color: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>{i + 1}</div><div style={{ fontSize: 13, lineHeight: 1.5 }}>{s}</div></div>)}</div> },
          { label: "📣 CTA", color: "#BF360C", bg: "rgba(255,87,34,.05)", content: <div style={{ fontSize: 13, fontWeight: 600 }}>{v.cta}</div> },
        ].map(({ label, color, bg, content }) => (
          <div key={label} style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: 9, overflow: "hidden" }}>
            <div style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 700, padding: "7px 12px", borderBottom: `1px solid ${C.border}`, color, background: bg }}>{label}</div>
            <div style={{ padding: "10px 12px" }}>{content}</div>
          </div>
        ))}
      </div>

      <div style={{ background: C.dark, margin: "0 22px 18px", borderRadius: 11, padding: "16px 20px" }}>
        <div style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(245,240,232,.4)", marginBottom: 12 }}>📊 Breakdown conversie</div>
        {[["attention", "Atenție"], ["value", "Valoare"], ["proof", "Dovadă"], ["friction", "Fricțiune"], ["cta", "CTA"], ["platform_fit", "Platformă"]].map(([k, l]) => (
          <div key={k} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <span style={{ fontSize: 11, color: "rgba(245,240,232,.6)" }}>{l}</span>
              <span style={{ fontSize: 11, color: C.orange, fontWeight: 700 }}>{sb[k] || 0}</span>
            </div>
            <div style={{ height: 4, background: "rgba(245,240,232,.08)", borderRadius: 2 }}>
              <div style={{ height: "100%", width: `${sb[k] || 0}%`, background: C.orange, borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ margin: "0 22px 18px", background: "rgba(42,122,75,.06)", border: "1px solid rgba(42,122,75,.2)", borderRadius: 9, padding: "12px 14px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: C.green, marginBottom: 5 }}>🧠 De ce convertește</div>
        <div style={{ fontSize: 13, lineHeight: 1.6 }}>{v.why_it_works}</div>
      </div>

      <div style={{ margin: "0 22px 22px", display: "flex", gap: 7 }}>
        <input value={refText} onChange={e => setRefText(e.target.value)} onKeyDown={e => e.key === "Enter" && doRefine()} placeholder="ex: fă hook-ul mai agresiv, adaugă urgență..." style={{ flex: 1, background: "white", border: `1px solid ${C.border}`, borderRadius: 7, padding: "9px 12px", fontFamily: "inherit", fontSize: 12, outline: "none" }} />
        <button onClick={doRefine} disabled={refining} style={{ background: C.orange, color: "white", border: "none", borderRadius: 7, padding: "9px 14px", fontFamily: "inherit", fontSize: 12, fontWeight: 600, cursor: "pointer", opacity: refining ? 0.6 : 1 }}>
          {refining ? "..." : "✨ Rafinează"}
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState("manual");
  const [loading, setLoading] = useState(false);
  const [loadMsg, setLoadMsg] = useState(MSGS[0]);
  const [variants, setVariants] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [error, setError] = useState("");
  const [offerLabel, setOfferLabel] = useState("");
  const intervalRef = useRef(null);

  const [offer, setOffer] = useState("");
  const [category, setCategory] = useState("Curs online");
  const [value, setValue] = useState("");
  const [audience, setAudience] = useState("");
  const [stage, setStage] = useState("Rece");
  const [objective, setObjective] = useState("Vânzare");
  const [platform, setPlatform] = useState("Instagram Reels");
  const [length, setLength] = useState("Scurt (20-45s)");
  const [voice, setVoice] = useState("");
  const [page, setPage] = useState("");
  const [aPlatform, setAPlatform] = useState("Instagram Reels");
  const [aLength, setALength] = useState("Scurt (20-45s)");
  const [script, setScript] = useState("");
  const [rPlatform, setRPlatform] = useState("Instagram Reels");
  const [rLength, setRLength] = useState("Scurt (20-45s)");

  const generate = async () => {
    setError("");
    let prompt = "", label = "";
    if (mode === "manual") {
      if (!offer || !value || !audience) { setError("Completează: ofertă, valoare și audiență."); return; }
      prompt = buildPrompt("manual", { offer, category, value, audience, stage, objective, platform, length, voice });
      label = offer;
    } else if (mode === "analyzer") {
      if (!page) { setError("Lipește textul paginii de vânzări."); return; }
      prompt = buildPrompt("analyzer", { page, platform: aPlatform, length: aLength });
      label = "Pagină analizată";
    } else {
      if (!script) { setError("Lipește scriptul de recreat."); return; }
      prompt = buildPrompt("recreate", { script, platform: rPlatform, length: rLength });
      label = "Recreare script";
    }
    setOfferLabel(label);
    setLoading(true);
    setVariants([]);
    let mi = 0;
    intervalRef.current = setInterval(() => setLoadMsg(MSGS[mi++ % MSGS.length]), 1400);
    try {
      const result = await callAPI(prompt);
      setVariants(result.variants || []);
      setActiveIdx(0);
    } catch (e) {
      setError("Eroare: " + e.message);
    }
    clearInterval(intervalRef.current);
    setLoading(false);
  };

  const sidebarLabel = { fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: C.muted, marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${C.border}` };

  return (
    <div style={{ fontFamily: "-apple-system, sans-serif", background: C.cream, minHeight: "100vh", color: C.dark }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ background: C.dark, padding: "0 24px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <span style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700, color: C.cream }}>Script</span>
          <span style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700, color: C.orange }}>Studio</span>
          <span style={{ fontSize: 10, background: C.orange, color: "white", padding: "3px 8px", borderRadius: 20, marginLeft: 8 }}>RO</span>
        </div>
        <span style={{ fontSize: 11, color: "rgba(245,240,232,.35)" }}>by steph.ai.studio</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "310px 1fr", minHeight: "calc(100vh - 52px)" }}>
        <div style={{ background: C.card, borderRight: `1px solid ${C.border}`, padding: "20px 18px", overflowY: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5, marginBottom: 20 }}>
            {[["manual", "Manual"], ["analyzer", "Analizor"], ["recreate", "Recreare"]].map(([id, lbl]) => (
              <div key={id} style={{ position: "relative" }}>
                <button onClick={() => setMode(id)} style={{ width: "100%", background: mode === id ? C.orange : C.sand, border: `1px solid ${mode === id ? C.orange : C.border}`, borderRadius: 7, padding: "9px 4px", fontSize: 11, fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase", cursor: "pointer", color: mode === id ? "white" : C.muted, fontFamily: "inherit" }}>{lbl}</button>
                {id === "recreate" && <span style={{ position: "absolute", top: -6, right: -4, background: C.green, color: "white", fontSize: 8, padding: "2px 5px", borderRadius: 4 }}>NOU</span>}
              </div>
            ))}
          </div>

          {mode === "manual" && <>
            <div style={sidebarLabel}>Detalii ofertă</div>
            <FG label="Ofertă / produs"><Inp val={offer} set={setOffer} ph="ex: Cursul meu de fotografie AI" /></FG>
            <FG label="Categorie"><Sel val={category} set={setCategory} opts={["Curs online", "Produs fizic", "Serviciu / Mentorat", "E-commerce", "Tool digital", "Eveniment", "Brand personal", "Altul"]} /></FG>
            <FG label="Propunere de valoare"><Inp val={value} set={setValue} ph="ex: Ajut antreprenorii să creeze conținut AI în 30 min/zi" rows={3} /></FG>
            <FG label="Audiență țintă"><Inp val={audience} set={setAudience} ph="ex: antreprenori români 25-40 ani" /></FG>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <FG label="Stadiu"><Sel val={stage} set={setStage} opts={["Rece", "Caldă", "Fierbinte"]} /></FG>
              <FG label="Obiectiv"><Sel val={objective} set={setObjective} opts={["Vânzare", "Lead", "Awareness", "Engagement"]} /></FG>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <FG label="Platformă"><Sel val={platform} set={setPlatform} opts={PLATFORMS} /></FG>
              <FG label="Durată"><Sel val={length} set={setLength} opts={LENGTHS} /></FG>
            </div>
            <FG label="Brand voice (opțional)"><Inp val={voice} set={setVoice} ph="Lipește un text scris de tine..." rows={2} /></FG>
          </>}

          {mode === "analyzer" && <>
            <div style={sidebarLabel}>Analizor pagină de vânzări</div>
            <FG label="Textul paginii de vânzări"><Inp val={page} set={setPage} ph="Lipește tot textul de pe landing page..." rows={10} /></FG>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <FG label="Platformă"><Sel val={aPlatform} set={setAPlatform} opts={PLATFORMS} /></FG>
              <FG label="Durată"><Sel val={aLength} set={setALength} opts={LENGTHS} /></FG>
            </div>
          </>}

          {mode === "recreate" && <>
            <div style={sidebarLabel}>Recreează orice script</div>
            <FG label="Script original (al tău sau competitor)"><Inp val={script} set={setScript} ph="Lipește orice script de reclamă video..." rows={10} /></FG>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <FG label="Platformă"><Sel val={rPlatform} set={setRPlatform} opts={PLATFORMS} /></FG>
              <FG label="Durată"><Sel val={rLength} set={setRLength} opts={LENGTHS} /></FG>
            </div>
          </>}

          {error && <div style={{ background: "rgba(192,57,43,.08)", border: "1px solid rgba(192,57,43,.25)", borderRadius: 7, padding: "9px 12px", fontSize: 12, color: "#c0392b", marginBottom: 10 }}>{error}</div>}

          <button onClick={generate} disabled={loading} style={{ width: "100%", background: loading ? C.muted : C.orange, color: "white", border: "none", borderRadius: 9, padding: 13, fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", marginTop: 6 }}>
            {loading ? "⏳ Generăm..." : { manual: "⚡ Generează 3 scripturi", analyzer: "🔍 Analizează și generează", recreate: "🔄 Recreează mai bine" }[mode]}
          </button>
        </div>

        <div style={{ padding: 24, overflowY: "auto" }}>
          {!loading && variants.length === 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center", color: C.muted }}>
              <div style={{ fontSize: 52, opacity: .3, marginBottom: 18 }}>✍️</div>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 24, color: C.dark, marginBottom: 8 }}>Scriptul tău perfect te așteaptă</div>
              <div style={{ fontSize: 14, maxWidth: 360, lineHeight: 1.6 }}>Completează detaliile din stânga și generează 3 variante psihologic optimizate, gata de filmat.</div>
            </div>
          )}

          {loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center" }}>
              <div style={{ width: 52, height: 52, border: `3px solid ${C.border}`, borderTopColor: C.orange, borderRadius: "50%", animation: "spin .75s linear infinite", marginBottom: 22 }} />
              <div style={{ fontSize: 15, fontWeight: 500, color: C.dark }}>{loadMsg}</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 5 }}>Poate dura 20-40 secunde</div>
            </div>
          )}

          {!loading && variants.length > 0 && (
            <>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700, marginBottom: 18 }}>
                Scripturi — <span style={{ color: C.orange }}>{offerLabel}</span>
              </div>
              <div style={{ display: "flex", gap: 7, marginBottom: 20, flexWrap: "wrap" }}>
                {variants.map((v, i) => (
                  <button key={i} onClick={() => setActiveIdx(i)} style={{ background: activeIdx === i ? C.orange : "white", border: `1px solid ${activeIdx === i ? C.orange : C.border}`, borderRadius: 7, padding: "7px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer", color: activeIdx === i ? "white" : C.dark, fontFamily: "inherit" }}>
                    Variantă {String.fromCharCode(65 + i)} · {v.conversion_score}
                  </button>
                ))}
              </div>
              <VariantCard key={activeIdx} v={variants[activeIdx]} onRefine={r => { const u = [...variants]; u[activeIdx] = r; setVariants(u); }} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
