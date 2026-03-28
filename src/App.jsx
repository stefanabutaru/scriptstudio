import { useState, useRef, useEffect } from "react";
import { DEJAVU_REGULAR, DEJAVU_BOLD } from "./fonts.js";

/* ─── THEME ─── */
const LIGHT = {
  bg: "#F5F0E8", dark: "#1A1512", accent: "#E8621A", green: "#2A7A4B",
  sand: "#E8DFC8", card: "#FDFAF4", border: "#DDD5C0", muted: "#7A6E5F",
  inputBg: "#FFFFFF", barBg: "rgba(0,0,0,.06)", scoreBg: "#1A1512",
  scoreText: "rgba(245,240,232,.6)", tagBg: "rgba(232,98,26,.03)",
};
const DARK = {
  bg: "#0F0F0F", dark: "#E8E0D0", accent: "#E8621A", green: "#34D399",
  sand: "#1E1E1E", card: "#181818", border: "#2A2A2A", muted: "#888",
  inputBg: "#1E1E1E", barBg: "rgba(255,255,255,.06)", scoreBg: "#111",
  scoreText: "rgba(255,255,255,.5)", tagBg: "rgba(232,98,26,.06)",
};

const TAG_LABELS = {
  social_proof: "Dovadă socială", loss_aversion: "Aversiune pierdere",
  authority_bias: "Autoritate", urgency: "Urgență",
  curiosity_gap: "Gap curiozitate", identity: "Identitate",
  fear_of_missing_out: "FOMO", reciprocity: "Reciprocitate",
  scarcity: "Raritate", anchoring: "Ancorare preț",
  cost_of_inaction: "Cost inacțiune",
};
const TAG_CSS = {
  social_proof: { b: "#2196F3", c: "#1565C0" }, loss_aversion: { b: "#E91E63", c: "#C2185B" },
  authority_bias: { b: "#9C27B0", c: "#7B1FA2" }, urgency: { b: "#FF5722", c: "#D84315" },
  curiosity_gap: { b: "#009688", c: "#00796B" }, identity: { b: "#3F51B5", c: "#283593" },
  fear_of_missing_out: { b: "#FF9800", c: "#E65100" }, reciprocity: { b: "#4CAF50", c: "#2E7D32" },
  scarcity: { b: "#F44336", c: "#C62828" }, anchoring: { b: "#795548", c: "#4E342E" },
  cost_of_inaction: { b: "#607D8B", c: "#37474F" },
};

const PLATFORMS = ["Instagram Reels", "TikTok", "YouTube Shorts", "Facebook", "LinkedIn"];
const LENGTHS = ["Scurt (20-45s)", "Mediu (45-90s)", "Lung (1-2 min)"];
const CATEGORIES = ["Curs online", "Produs fizic", "Serviciu / Mentorat", "E-commerce", "Tool digital", "Eveniment", "Brand personal", "Altul"];
const STAGES = ["Rece", "Caldă", "Fierbinte"];
const OBJECTIVES = ["Vânzare", "Lead", "Awareness", "Engagement"];
const STYLES = ["talking_head", "screen_recording", "b_roll", "mixed"];
const CAPTIONS = ["burned_in", "auto_generated", "none"];
const MSGS = ["Selectăm unghiuri psihologice...", "Aplicăm principii de conversie...", "Adaptăm pentru piața română...", "Construim shot list-urile...", "Generăm ad copy...", "Calculăm scorurile...", "Aproape gata..."];

/* ─── HELPERS ─── */
function Inp({ val, set, ph, rows, t }) {
  const base = { width: "100%", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 7, padding: "9px 11px", fontFamily: "inherit", fontSize: 13, color: t.dark, outline: "none", boxSizing: "border-box" };
  return rows
    ? <textarea value={val} onChange={e => set(e.target.value)} placeholder={ph} rows={rows} style={{ ...base, resize: "vertical" }} />
    : <input value={val} onChange={e => set(e.target.value)} placeholder={ph} style={base} />;
}

function Sel({ val, set, opts, t }) {
  return <select value={val} onChange={e => set(e.target.value)} style={{ width: "100%", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 7, padding: "9px 11px", fontFamily: "inherit", fontSize: 13, color: t.dark, outline: "none", appearance: "none", boxSizing: "border-box" }}>
    {opts.map(o => <option key={o} value={o}>{o}</option>)}
  </select>;
}

function FG({ label, t, children }) {
  return <div style={{ marginBottom: 12 }}>
    <div style={{ fontSize: 11, fontWeight: 700, color: t.muted, marginBottom: 4, textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</div>
    {children}
  </div>;
}

function CopyBtn({ text, label, t }) {
  const [copied, setCopied] = useState(false);
  const doCopy = async () => {
    try { await navigator.clipboard.writeText(text); } catch(_) {}
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };
  return <button onClick={doCopy} style={{ background: "transparent", border: `1px solid ${t.border}`, borderRadius: 5, padding: "4px 10px", fontSize: 10, color: t.muted, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}>
    {copied ? "✓" : "📋"} {label}
  </button>;
}

function Bar({ value, color, t }) {
  return <div style={{ height: 5, background: t.barBg, borderRadius: 3, overflow: "hidden" }}>
    <div style={{ height: "100%", width: `${value || 0}%`, background: color || t.accent, borderRadius: 3, transition: "width .6s ease" }} />
  </div>;
}

/* ─── PROMPT BUILDER ─── */
function buildPrompt(mode, f) {
  const schema = `{"variants":[{"hook_name":"str","hook":"str","voiceover_lines":[{"line":"str","seconds":5}],"on_screen_texts":[{"text":"str","seconds":3}],"shot_list":[{"shot":"str","type":"talking_head"}],"cta":{"primary":"str","backup":"str"},"ad_copy":{"headline":"str","description":"str","caption":"str"},"psychology_tags":{"primary":"loss_aversion","secondary":"urgency"},"conversion_score":88,"score_breakdown":{"attention":92,"value":85,"proof":80,"friction":78,"cta":90,"platform_fit":85},"why_it_converts":["r1","r2"],"psychology_in_action":["i1"],"what_to_test":["t1"],"posting_tip":"str","style":"talking_head","captions":"burned_in","ratio":"9:16"}]}`;

  const avatarNote = f.avatarMode ? `
IMPORTANT — AVATAR MODE ACTIV:
Scripturile sunt pentru un AVATAR DIGITAL (nu persoană reală). Respectă aceste specificații:
- Platformă avatar: ${f.avatarPlatform || "HeyGen"}
- Tip avatar: ${f.avatarType || "Talking head static"}
- Tonul vocii: ${f.avatarTone || "Conversațional"}
- Lungime maximă per scenă: ${f.avatarMaxScene || "60"} secunde${f.avatarDesc ? "\n- Descriere avatar: " + f.avatarDesc.slice(0, 200) : ""}

REGULI AVATAR:
- Shot list-ul trebuie adaptat pentru avatar digital: talking head static/semi-static, screen recordings, text overlay, b-roll extern. NICIUN gest fizic complex.
- Voiceover-ul trebuie să sune natural dar concis — fără pauze lungi, fără expresii care necesită mimică complexă.
- Fiecare scenă din shot list nu trebuie să depășească ${f.avatarMaxScene || "60"}s.
- Adaptează pentru platforma ${f.avatarPlatform || "HeyGen"}: ${f.avatarPlatform === "HeyGen" ? "suportă talking head cu gesturi limitate, screen share, templates" : f.avatarPlatform === "Synthesia" ? "suportă talking head frontal, slide-uri, screen recordings" : f.avatarPlatform === "D-ID" ? "suportă doar talking head frontal static, fără gesturi" : f.avatarPlatform === "Hedra" ? "suportă talking head cu lip sync, expresii faciale de bază" : "adaptează pentru platforma specificată"}.` : "";
  const brandVoice = f.brandVoice ? `\nBrand voice salvat: ${f.brandVoice.slice(0, 200)}` : "";

  if (mode === "manual") {
    return `RĂSPUNDE DOAR CU JSON VALID. Niciun text înainte sau după. Niciun markdown. Începe cu { și termină cu }.

Ești expert copywriter pentru conversie pe piața românească. Generează 3 variante de script video pentru reclame social media, bazate pe psihologia comportamentală.

Ofertă: ${f.offer}
Categorie: ${f.category}
Propunere valoare: ${f.value}
Audiență: ${f.audience}
Stadiu: ${f.stage}
Obiectiv: ${f.objective}
Platformă: ${f.platform}
Durată: ${f.length}
Dovezi sociale: ${f.proof || "N/A"}
Obiecția principală: ${f.objection || "N/A"}
Obiectiv CTA: ${f.ctaGoal || "N/A"}${avatarNote}${brandVoice}

IMPORTANT: Fiecare voiceover_line trebuie să aibă timing-ul în secunde. Fiecare on_screen_text la fel. Shot list-ul să specifice tipul (talking_head, screen_recording, b_roll). psychology_tags are primary și secondary (secondary poate fi null). Returnează EXCLUSIV JSON valid, fără text/markdown/backticks. 3 variante complete:
${schema}`;
  } else if (mode === "analyzer") {
    return `RĂSPUNDE DOAR CU JSON VALID. Niciun text înainte sau după. Niciun markdown. Începe cu { și termină cu }.

Analizează pagina de vânzări și generează 3 scripturi video pentru ${f.platform}, durata ${f.length}, în română autentică.${avatarNote}${brandVoice}

PAGINA: ${f.page.slice(0, 2000)}

Returnează EXCLUSIV JSON valid, 3 variante:
${schema}`;
  } else {
    return `RĂSPUNDE DOAR CU JSON VALID. Niciun text înainte sau după. Niciun markdown. Începe cu { și termină cu }.

Analizează structura și psihologia scriptului și generează 3 variante originale mai bune pentru piața română. ${f.platform}, ${f.length}.${avatarNote}${brandVoice}

SCRIPT: ${f.script.slice(0, 1500)}

Returnează EXCLUSIV JSON valid, 3 variante:
${schema}`;
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
      throw new Error(err.error || `Eroare: HTTP ${res.status}`);
    }
    return await res.json();
  } catch (e) {
    clearTimeout(timeout);
    if (e.name === "AbortError") throw new Error("Timeout — încearcă din nou (request-ul a durat prea mult)");
    throw e;
  }
}

/* ─── VARIANT CARD ─── */
function VariantCard({ v, idx, t, onRefine }) {
  const [refText, setRefText] = useState("");
  const [refining, setRefining] = useState(false);
  const [showWhy, setShowWhy] = useState(false);
  const sb = v.score_breakdown || {};
  const pt = v.psychology_tags || {};
  const cta = v.cta || {};
  const ad = v.ad_copy || {};

  const doRefine = async () => {
    if (!refText.trim()) return;
    setRefining(true);
    try {
      const lines = (v.voiceover_lines || []).map(l => l.line).join(" ");
      const prompt = `Ai generat acest script:\nHook: ${v.hook}\nVoiceover: ${lines}\nCTA: ${cta.primary || v.cta}\n\nModifică-l astfel: "${refText}"\n\nReturnează EXCLUSIV JSON valid, un singur obiect variant complet (fără array variants, direct obiectul):\n{"hook_name":"s","hook":"s","voiceover_lines":[{"line":"s","seconds":5}],"on_screen_texts":[{"text":"s","seconds":3}],"shot_list":[{"shot":"s","type":"talking_head"}],"cta":{"primary":"s","backup":"s"},"ad_copy":{"headline":"s","description":"s","caption":"s"},"psychology_tags":{"primary":"loss_aversion","secondary":"urgency"},"conversion_score":88,"score_breakdown":{"attention":92,"value":85,"proof":80,"friction":78,"cta":90,"platform_fit":85},"why_it_converts":["r1","r2"],"psychology_in_action":["i1"],"what_to_test":["t1"],"posting_tip":"s","style":"talking_head","captions":"burned_in","ratio":"9:16"}`;
      const result = await callAPI(prompt);
      onRefine(result.variants ? result.variants[0] : result);
      setRefText("");
    } catch (e) { alert("Eroare: " + e.message); }
    setRefining(false);
  };

  const allText = `HOOK: ${v.hook}\n\nVOICEOVER:\n${(v.voiceover_lines||[]).map((l,i)=>`${i+1}. ${l.line}`).join("\n")}\n\nON-SCREEN TEXT:\n${(v.on_screen_texts||[]).map(t=>t.text).join("\n")}\n\nSHOT LIST:\n${(v.shot_list||[]).map(s=>typeof s==="string"?s:s.shot).join("\n")}\n\nCTA: ${cta.primary||v.cta}\n\nAD COPY:\nHeadline: ${ad.headline||""}\nDescription: ${ad.description||""}\nCaption: ${ad.caption||""}`;

  const scoreItems = [
    ["attention", "Atenție & Claritate", t.accent],
    ["value", "Propunere valoare", t.green],
    ["proof", "Dovadă / Credibilitate", "#FF9800"],
    ["friction", "Fricțiune / Anxietate", "#E91E63"],
    ["cta", "CTA", "#2196F3"],
    ["platform_fit", "Platformă", "#9C27B0"],
  ];

  return (
    <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, overflow: "hidden" }}>
      {/* Header: meta info */}
      <div style={{ padding: "10px 22px", borderBottom: `1px solid ${t.border}`, display: "flex", gap: 12, fontSize: 11, color: t.muted, flexWrap: "wrap", alignItems: "center" }}>
        <span>Style: <strong>{v.style || "mixed"}</strong></span>
        <span>Captions: <strong>{v.captions || "burned_in"}</strong></span>
        <span>Ratio: <strong>{v.ratio || "9:16"}</strong></span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".08em" }}>Primary:</span>
          <span style={{ background: (TAG_CSS[pt.primary]||{}).b || t.accent, color: "white", fontSize: 9, padding: "2px 8px", borderRadius: 4, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", fontFamily: "monospace" }}>{TAG_LABELS[pt.primary] || pt.primary || "—"}</span>
          {pt.secondary && <>
            <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".08em" }}>Secondary:</span>
            <span style={{ background: (TAG_CSS[pt.secondary]||{}).b || t.muted, color: "white", fontSize: 9, padding: "2px 8px", borderRadius: 4, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", fontFamily: "monospace" }}>{TAG_LABELS[pt.secondary] || pt.secondary}</span>
          </>}
        </div>
      </div>

      {/* Hook + Score */}
      <div style={{ padding: "18px 22px 14px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: t.muted, marginBottom: 6 }}>HOOK</div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, lineHeight: 1.35, color: t.dark }}>{v.hook}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <CopyBtn text={v.hook} label="Hook" t={t} />
          <div style={{ width: 56, height: 56, borderRadius: "50%", border: `3px solid ${t.accent}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: t.accent, lineHeight: 1 }}>{v.conversion_score}</div>
            <div style={{ fontSize: 7, color: t.muted, textTransform: "uppercase" }}>scor</div>
          </div>
        </div>
      </div>

      {/* Voiceover Script */}
      <div style={{ padding: "16px 22px", borderBottom: `1px solid ${t.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "#1565C0", fontWeight: 700 }}>VOICEOVER SCRIPT</div>
          <CopyBtn text={(v.voiceover_lines||[]).map(l=>l.line).join("\n")} label="Script" t={t} />
        </div>
        {(v.voiceover_lines || []).map((l, i) => (
          <div key={i} style={{ display: "flex", gap: 10, marginBottom: 6, alignItems: "flex-start" }}>
            <div style={{ minWidth: 20, height: 20, background: t.accent, color: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>{i+1}</div>
            <div style={{ fontSize: 13, lineHeight: 1.6, color: t.dark, flex: 1 }}>{l.line}</div>
            <div style={{ fontSize: 10, color: t.muted, flexShrink: 0, marginTop: 3 }}>{l.seconds}s</div>
          </div>
        ))}
      </div>

      {/* On-Screen Text */}
      <div style={{ padding: "16px 22px", borderBottom: `1px solid ${t.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "#6A1B9A", fontWeight: 700 }}>ON-SCREEN TEXT</div>
          <CopyBtn text={(v.on_screen_texts||[]).map(t=>t.text).join("\n")} label="Text" t={t} />
        </div>
        {(v.on_screen_texts || []).map((item, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, alignItems: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: t.dark }}>• {item.text}</div>
            <div style={{ fontSize: 10, color: t.muted, flexShrink: 0 }}>{item.seconds}s</div>
          </div>
        ))}
      </div>

      {/* Shot List */}
      <div style={{ padding: "16px 22px", borderBottom: `1px solid ${t.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: t.green, fontWeight: 700 }}>SHOT LIST</div>
          <CopyBtn text={(v.shot_list||[]).map(s=>typeof s==="string"?s:`${s.type}: ${s.shot}`).join("\n")} label="Shots" t={t} />
        </div>
        {(v.shot_list || []).map((s, i) => {
          const shot = typeof s === "string" ? s : s.shot;
          const type = typeof s === "string" ? "" : s.type;
          return (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
              <div style={{ fontSize: 13, lineHeight: 1.5, color: t.dark, flex: 1 }}>
                {type && <span style={{ fontSize: 9, background: t.barBg, padding: "2px 6px", borderRadius: 3, marginRight: 6, textTransform: "uppercase", letterSpacing: ".04em", color: t.muted }}>{type.replace("_"," ")}</span>}
                {shot}
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div style={{ padding: "16px 22px", borderBottom: `1px solid ${t.border}` }}>
        <div style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "#BF360C", fontWeight: 700, marginBottom: 8 }}>CTA</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: t.dark, marginBottom: 4 }}>{cta.primary || (typeof v.cta === "string" ? v.cta : "")}</div>
        {cta.backup && <div style={{ fontSize: 12, color: t.muted }}>Backup: {cta.backup}</div>}
      </div>

      {/* Ad Copy */}
      <div style={{ padding: "16px 22px", borderBottom: `1px solid ${t.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: t.dark, fontWeight: 700 }}>AD COPY</div>
          <CopyBtn text={`${ad.headline||""}\n\n${ad.description||""}\n\n${ad.caption||""}`} label="All Ad Copy" t={t} />
        </div>
        {[["HEADLINE", ad.headline], ["DESCRIPTION", ad.description], ["CAPTION", ad.caption]].map(([lbl, val]) => val ? (
          <div key={lbl} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 9, color: t.muted, letterSpacing: ".08em", textTransform: "uppercase" }}>{lbl}</span>
              <CopyBtn text={val} label={lbl.slice(0,4)} t={t} />
            </div>
            <div style={{ fontSize: lbl === "HEADLINE" ? 15 : 13, fontWeight: lbl === "HEADLINE" ? 700 : 400, color: t.dark, lineHeight: 1.5 }}>{val}</div>
          </div>
        ) : null)}
      </div>

      {/* Score Breakdown */}
      <div style={{ background: t.scoreBg, margin: "0 22px 16px", borderRadius: 11, padding: "16px 20px", marginTop: 16 }}>
        <div style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: t.scoreText, marginBottom: 14 }}>SCORE BREAKDOWN</div>
        {scoreItems.map(([k, l, color]) => (
          <div key={k} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: t.scoreText }}>{l}</span>
              <span style={{ fontSize: 11, color, fontWeight: 700 }}>{sb[k] || 0}</span>
            </div>
            <Bar value={sb[k]} color={color} t={t} />
          </div>
        ))}
      </div>

      {/* Why This Converts (expandable) */}
      <div style={{ margin: "0 22px 16px" }}>
        <button onClick={() => setShowWhy(!showWhy)} style={{ width: "100%", background: "transparent", border: `1px solid ${t.border}`, borderRadius: 9, padding: "10px 14px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "inherit" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: t.dark }}>🧠 De ce convertește</span>
          <span style={{ fontSize: 11, color: t.muted }}>{showWhy ? "▲ Ascunde" : "▼ Arată"}</span>
        </button>
        {showWhy && (
          <div style={{ marginTop: 10, display: "grid", gap: 12 }}>
            {/* Why */}
            {(v.why_it_converts || []).length > 0 && (
              <div style={{ background: `${t.green}11`, border: `1px solid ${t.green}33`, borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: t.green, marginBottom: 6 }}>WHY THIS CONVERTS</div>
                {v.why_it_converts.map((r, i) => <div key={i} style={{ fontSize: 12, lineHeight: 1.6, color: t.dark, marginBottom: 3 }}>• {r}</div>)}
              </div>
            )}
            {/* Psychology in Action */}
            {(v.psychology_in_action || []).length > 0 && (
              <div style={{ background: `${t.accent}11`, border: `1px solid ${t.accent}33`, borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: t.accent, marginBottom: 6 }}>PSYCHOLOGY IN ACTION</div>
                {v.psychology_in_action.map((r, i) => <div key={i} style={{ fontSize: 12, lineHeight: 1.6, color: t.dark, marginBottom: 3 }}>• {r}</div>)}
              </div>
            )}
            {/* What to Test */}
            {(v.what_to_test || []).length > 0 && (
              <div style={{ background: t.barBg, borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: t.muted, marginBottom: 6 }}>⚠️ WHAT TO TEST NEXT</div>
                {v.what_to_test.map((r, i) => <div key={i} style={{ fontSize: 12, lineHeight: 1.6, color: t.dark, marginBottom: 3 }}>• {r}</div>)}
              </div>
            )}
            {/* Posting Tip */}
            {v.posting_tip && (
              <div style={{ background: t.barBg, borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: t.muted, marginBottom: 6 }}>💡 POSTING TIP</div>
                <div style={{ fontSize: 12, lineHeight: 1.6, color: t.dark }}>{v.posting_tip}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Refine */}
      <div style={{ margin: "0 22px 22px", display: "flex", gap: 7 }}>
        <input value={refText} onChange={e => setRefText(e.target.value)} onKeyDown={e => e.key === "Enter" && doRefine()} placeholder="Rafinează varianta... ex: 'fă hook-ul mai agresiv'" style={{ flex: 1, background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 7, padding: "9px 12px", fontFamily: "inherit", fontSize: 12, color: t.dark, outline: "none" }} />
        <button onClick={doRefine} disabled={refining} style={{ background: t.accent, color: "white", border: "none", borderRadius: 7, padding: "9px 14px", fontFamily: "inherit", fontSize: 12, fontWeight: 600, cursor: "pointer", opacity: refining ? .5 : 1 }}>
          {refining ? "..." : "✨ Rafinează"}
        </button>
      </div>
    </div>
  );
}

/* ─── A/B COMPARE VIEW ─── */
function ABView({ variants, idxA, idxB, t }) {
  const a = variants[idxA], b = variants[idxB];
  if (!a || !b) return null;
  const items = [
    ["Hook", a.hook, b.hook],
    ["Scor", a.conversion_score, b.conversion_score],
    ["CTA", a.cta?.primary || a.cta, b.cta?.primary || b.cta],
    ["Primary Tag", TAG_LABELS[a.psychology_tags?.primary] || "—", TAG_LABELS[b.psychology_tags?.primary] || "—"],
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      {[a, b].map((v, i) => (
        <div key={i} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: t.accent, marginBottom: 6 }}>Variantă {String.fromCharCode(65 + (i === 0 ? idxA : idxB))}</div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700, marginBottom: 10, color: t.dark }}>{v.hook}</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", border: `3px solid ${t.accent}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: t.accent }}>{v.conversion_score}</div>
            <div style={{ fontSize: 11, color: t.muted }}>
              <div>Primary: {TAG_LABELS[v.psychology_tags?.primary] || "—"}</div>
              <div>Secondary: {TAG_LABELS[v.psychology_tags?.secondary] || "—"}</div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: t.dark, lineHeight: 1.6, marginBottom: 8 }}>
            {(v.voiceover_lines || []).map(l => l.line).join(" ")}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: t.green }}>CTA: {v.cta?.primary || v.cta}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── MAIN APP ─── */
export default function App() {
  const [dark, setDark] = useState(false);
  const t = dark ? DARK : LIGHT;

  const [mode, setMode] = useState("manual");
  const [loading, setLoading] = useState(false);
  const [loadMsg, setLoadMsg] = useState(MSGS[0]);
  const [variants, setVariants] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [error, setError] = useState("");
  const [offerLabel, setOfferLabel] = useState("");
  const [viewMode, setViewMode] = useState("single"); // single | ab
  const [abA, setAbA] = useState(0);
  const [abB, setAbB] = useState(1);
  const [history, setHistory] = useState([]);
  const [avatarMode, setAvatarMode] = useState(false);
  const [avatarPlatform, setAvatarPlatform] = useState("HeyGen");
  const [avatarType, setAvatarType] = useState("Talking head static");
  const [avatarTone, setAvatarTone] = useState("Conversațional");
  const [avatarMaxScene, setAvatarMaxScene] = useState("60");
  const [avatarDesc, setAvatarDesc] = useState("");
  const intervalRef = useRef(null);

  // Brand Voice Memory
  const [brandVoice, setBrandVoice] = useState(() => {
    try { return window.localStorage?.getItem("ss_brand_voice") || ""; } catch(_) { return ""; }
  });
  const saveBrandVoice = (v) => {
    setBrandVoice(v);
    try { window.localStorage?.setItem("ss_brand_voice", v); } catch(_) {}
  };

  // Form fields
  const [offer, setOffer] = useState("");
  const [category, setCategory] = useState("Curs online");
  const [value, setValue] = useState("");
  const [audience, setAudience] = useState("");
  const [stage, setStage] = useState("Rece");
  const [objective, setObjective] = useState("Vânzare");
  const [platform, setPlatform] = useState("Instagram Reels");
  const [length, setLength] = useState("Scurt (20-45s)");
  const [proof, setProof] = useState("");
  const [objection, setObjection] = useState("");
  const [ctaGoal, setCtaGoal] = useState("");
  const [page, setPage] = useState("");
  const [aPlatform, setAPlatform] = useState("Instagram Reels");
  const [aLength, setALength] = useState("Scurt (20-45s)");
  const [script, setScript] = useState("");
  const [rPlatform, setRPlatform] = useState("Instagram Reels");
  const [rLength, setRLength] = useState("Scurt (20-45s)");

  const generate = async () => {
    setError("");
    let prompt = "", label = "";
    const bv = brandVoice;
    const avatarFields = { avatarMode, avatarPlatform, avatarType, avatarTone, avatarMaxScene, avatarDesc };
    if (mode === "manual") {
      if (!offer || !value || !audience) { setError("Completează: ofertă, valoare și audiență."); return; }
      prompt = buildPrompt("manual", { offer, category, value, audience, stage, objective, platform, length, proof, objection, ctaGoal, brandVoice: bv, ...avatarFields });
      label = offer;
    } else if (mode === "analyzer") {
      if (!page) { setError("Lipește textul paginii de vânzări."); return; }
      prompt = buildPrompt("analyzer", { page, platform: aPlatform, length: aLength, brandVoice: bv, ...avatarFields });
      label = "Pagină analizată";
    } else {
      if (!script) { setError("Lipește scriptul de recreat."); return; }
      prompt = buildPrompt("recreate", { script, platform: rPlatform, length: rLength, brandVoice: bv, ...avatarFields });
      label = "Recreare script";
    }
    setOfferLabel(label);
    setLoading(true);
    setVariants([]);
    setViewMode("single");
    let mi = 0;
    intervalRef.current = setInterval(() => setLoadMsg(MSGS[mi++ % MSGS.length]), 1400);
    try {
      const result = await callAPI(prompt);
      const v = result.variants || [];
      setVariants(v);
      setActiveIdx(0);
      if (v.length > 0) {
        setHistory(prev => [{ label, platform: mode === "manual" ? platform : mode === "analyzer" ? aPlatform : rPlatform, objective: mode === "manual" ? objective : "—", time: new Date().toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" }), count: v.length }, ...prev].slice(0, 10));
      }
    } catch (e) {
      setError("Eroare: " + e.message);
    }
    clearInterval(intervalRef.current);
    setLoading(false);
  };

  const exportPDF = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const W = 210, M = 16, CW = W - M * 2; // page width, margin, content width

      // Register DejaVu fonts with Romanian diacritics
      doc.addFileToVFS("DejaVuSans.ttf", DEJAVU_REGULAR);
      doc.addFont("DejaVuSans.ttf", "DejaVu", "normal");
      doc.addFileToVFS("DejaVuSans-Bold.ttf", DEJAVU_BOLD);
      doc.addFont("DejaVuSans-Bold.ttf", "DejaVu", "bold");

      const DARK = [26, 21, 18];
      const ACCENT = [232, 98, 26];
      const MUTED = [122, 110, 95];
      const GREEN = [42, 122, 75];
      const LIGHT_BG = [245, 240, 232];

      let y = 0;
      const checkPage = (need = 20) => { if (y > 277 - need) { doc.addPage(); y = 20; } };
      const setF = (style, size) => { doc.setFont("DejaVu", style); doc.setFontSize(size); };
      const textW = (txt, size, style = "normal") => { setF(style, size); return doc.getStringUnitWidth(txt) * size * 0.3528; };
      const drawLine = (y1, color = MUTED) => { doc.setDrawColor(...color); doc.setLineWidth(0.3); doc.line(M, y1, W - M, y1); };

      // === COVER / HEADER ===
      doc.setFillColor(...DARK);
      doc.rect(0, 0, W, 40, "F");
      setF("bold", 22);
      doc.setTextColor(245, 240, 232);
      doc.text("ScriptStudio", M, 18);
      setF("normal", 10);
      doc.setTextColor(...ACCENT);
      doc.text("by @steph.ai.studio", M, 26);
      setF("normal", 9);
      doc.setTextColor(180, 175, 165);
      doc.text(new Date().toLocaleDateString("ro-RO", { year: "numeric", month: "long", day: "numeric" }), W - M, 18, { align: "right" });
      doc.text(`${variants.length} variante generate`, W - M, 24, { align: "right" });

      // Title bar
      y = 50;
      doc.setFillColor(...LIGHT_BG);
      doc.roundedRect(M, y, CW, 14, 2, 2, "F");
      setF("bold", 13);
      doc.setTextColor(...DARK);
      doc.text(offerLabel || "Scripturi generate", M + 5, y + 9);

      y = 72;

      // === EACH VARIANT ===
      variants.forEach((v, i) => {
        checkPage(60);
        const pt = v.psychology_tags || {};
        const sb = v.score_breakdown || {};
        const cta = v.cta || {};
        const ad = v.ad_copy || {};
        const letter = String.fromCharCode(65 + i);

        // ─── Variant header with score ───
        doc.setFillColor(...ACCENT);
        doc.roundedRect(M, y, CW, 12, 2, 2, "F");
        setF("bold", 12);
        doc.setTextColor(255, 255, 255);
        doc.text(`Varianta ${letter}`, M + 5, y + 8);
        // Score circle
        const scoreX = W - M - 14;
        doc.setFillColor(255, 255, 255);
        doc.circle(scoreX, y + 6, 5, "F");
        setF("bold", 10);
        doc.setTextColor(...ACCENT);
        doc.text(`${v.conversion_score}`, scoreX, y + 7.5, { align: "center" });
        y += 16;

        // Psychology tags
        if (pt.primary) {
          setF("normal", 8);
          doc.setTextColor(...MUTED);
          const tagLine = `Primary: ${TAG_LABELS[pt.primary] || pt.primary}${pt.secondary ? "  |  Secondary: " + (TAG_LABELS[pt.secondary] || pt.secondary) : ""}`;
          doc.text(tagLine, M, y);
          y += 5;
        }

        // Style / Captions / Ratio
        setF("normal", 7);
        doc.setTextColor(...MUTED);
        doc.text(`Style: ${v.style || "mixed"}  |  Captions: ${v.captions || "burned_in"}  |  Ratio: ${v.ratio || "9:16"}`, M, y);
        y += 7;

        // ─── HOOK ───
        checkPage(20);
        setF("bold", 8);
        doc.setTextColor(...ACCENT);
        doc.text("HOOK", M, y);
        y += 5;
        setF("bold", 11);
        doc.setTextColor(...DARK);
        const hookLines = doc.splitTextToSize(v.hook || "", CW);
        doc.text(hookLines, M, y);
        y += hookLines.length * 5 + 4;

        // ─── VOICEOVER ───
        checkPage(15);
        setF("bold", 8);
        doc.setTextColor(21, 101, 192);
        doc.text("VOICEOVER SCRIPT", M, y);
        y += 5;
        (v.voiceover_lines || []).forEach((l, li) => {
          checkPage(10);
          setF("bold", 8);
          doc.setTextColor(...ACCENT);
          doc.text(`${li + 1}.`, M, y);
          setF("normal", 9);
          doc.setTextColor(...DARK);
          const vLines = doc.splitTextToSize(l.line || "", CW - 18);
          doc.text(vLines, M + 7, y);
          setF("normal", 7);
          doc.setTextColor(...MUTED);
          doc.text(`${l.seconds || 0}s`, W - M, y, { align: "right" });
          y += vLines.length * 4 + 2.5;
        });
        y += 2;

        // ─── ON-SCREEN TEXT ───
        if ((v.on_screen_texts || []).length > 0) {
          checkPage(12);
          setF("bold", 8);
          doc.setTextColor(106, 27, 154);
          doc.text("ON-SCREEN TEXT", M, y);
          y += 5;
          (v.on_screen_texts || []).forEach(item => {
            checkPage(8);
            setF("normal", 9);
            doc.setTextColor(...DARK);
            const tLines = doc.splitTextToSize(`• ${item.text}`, CW - 14);
            doc.text(tLines, M + 3, y);
            setF("normal", 7);
            doc.setTextColor(...MUTED);
            doc.text(`${item.seconds || 0}s`, W - M, y, { align: "right" });
            y += tLines.length * 4 + 2;
          });
          y += 2;
        }

        // ─── SHOT LIST ───
        if ((v.shot_list || []).length > 0) {
          checkPage(12);
          setF("bold", 8);
          doc.setTextColor(...GREEN);
          doc.text("SHOT LIST", M, y);
          y += 5;
          (v.shot_list || []).forEach(s => {
            checkPage(8);
            const shot = typeof s === "string" ? s : s.shot;
            const type = typeof s === "string" ? "" : s.type;
            if (type) {
              setF("bold", 7);
              doc.setTextColor(...MUTED);
              doc.text(`[${type.replace(/_/g, " ").toUpperCase()}]`, M + 3, y);
              const tw = textW(`[${type.replace(/_/g, " ").toUpperCase()}]`, 7, "bold") + 2;
              setF("normal", 9);
              doc.setTextColor(...DARK);
              const sLines = doc.splitTextToSize(shot || "", CW - tw - 5);
              doc.text(sLines, M + 3 + tw, y);
              y += sLines.length * 4 + 2;
            } else {
              setF("normal", 9);
              doc.setTextColor(...DARK);
              const sLines = doc.splitTextToSize(`• ${shot}`, CW - 5);
              doc.text(sLines, M + 3, y);
              y += sLines.length * 4 + 2;
            }
          });
          y += 2;
        }

        // ─── CTA ───
        checkPage(12);
        setF("bold", 8);
        doc.setTextColor(191, 54, 12);
        doc.text("CTA", M, y);
        y += 5;
        setF("bold", 10);
        doc.setTextColor(...DARK);
        doc.text(cta.primary || (typeof v.cta === "string" ? v.cta : ""), M, y);
        y += 5;
        if (cta.backup) {
          setF("normal", 8);
          doc.setTextColor(...MUTED);
          doc.text(`Backup: ${cta.backup}`, M, y);
          y += 5;
        }
        y += 2;

        // ─── AD COPY ───
        if (ad.headline || ad.description || ad.caption) {
          checkPage(20);
          setF("bold", 8);
          doc.setTextColor(...DARK);
          doc.text("AD COPY", M, y);
          y += 5;
          [["Headline", ad.headline, true], ["Description", ad.description, false], ["Caption", ad.caption, false]].forEach(([lbl, val, isBold]) => {
            if (!val) return;
            checkPage(10);
            setF("normal", 7);
            doc.setTextColor(...MUTED);
            doc.text(lbl.toUpperCase(), M, y);
            y += 4;
            setF(isBold ? "bold" : "normal", isBold ? 10 : 9);
            doc.setTextColor(...DARK);
            const adLines = doc.splitTextToSize(val, CW);
            doc.text(adLines, M, y);
            y += adLines.length * (isBold ? 5 : 4) + 3;
          });
          y += 2;
        }

        // ─── SCORE BREAKDOWN ───
        checkPage(35);
        doc.setFillColor(26, 21, 18);
        doc.roundedRect(M, y, CW, 34, 2, 2, "F");
        setF("bold", 7);
        doc.setTextColor(180, 175, 165);
        doc.text("SCORE BREAKDOWN", M + 4, y + 5);
        const sbItems = [
          ["Atentie", sb.attention, ACCENT],
          ["Valoare", sb.value, GREEN],
          ["Dovada", sb.proof, [255, 152, 0]],
          ["Frictiune", sb.friction, [233, 30, 99]],
          ["CTA", sb.cta, [33, 150, 243]],
          ["Platforma", sb.platform_fit, [156, 39, 176]],
        ];
        let bx = M + 4, by = y + 9;
        sbItems.forEach(([lbl, val, color], si) => {
          const col = si % 3;
          const row = Math.floor(si / 3);
          const cx = M + 4 + col * ((CW - 8) / 3);
          const cy = by + row * 12;
          setF("normal", 7);
          doc.setTextColor(180, 175, 165);
          doc.text(lbl, cx, cy);
          setF("bold", 7);
          doc.setTextColor(...color);
          doc.text(`${val || 0}`, cx + 32, cy);
          // Mini bar
          doc.setFillColor(60, 55, 50);
          doc.roundedRect(cx, cy + 1.5, 50, 2, 0.5, 0.5, "F");
          doc.setFillColor(...color);
          doc.roundedRect(cx, cy + 1.5, Math.max(1, (val || 0) / 2), 2, 0.5, 0.5, "F");
        });
        y += 38;

        // ─── WHY IT CONVERTS ───
        if ((v.why_it_converts || []).length > 0) {
          checkPage(15);
          setF("bold", 8);
          doc.setTextColor(...GREEN);
          doc.text("DE CE CONVERTESTE", M, y);
          y += 5;
          v.why_it_converts.forEach(r => {
            checkPage(8);
            setF("normal", 8);
            doc.setTextColor(...DARK);
            const wLines = doc.splitTextToSize(`• ${r}`, CW - 3);
            doc.text(wLines, M + 2, y);
            y += wLines.length * 3.5 + 1.5;
          });
          y += 3;
        }

        // ─── WHAT TO TEST ───
        if ((v.what_to_test || []).length > 0) {
          checkPage(12);
          setF("bold", 8);
          doc.setTextColor(...MUTED);
          doc.text("CE SA TESTEZI", M, y);
          y += 5;
          v.what_to_test.forEach(r => {
            checkPage(8);
            setF("normal", 8);
            doc.setTextColor(...DARK);
            const tLines = doc.splitTextToSize(`• ${r}`, CW - 3);
            doc.text(tLines, M + 2, y);
            y += tLines.length * 3.5 + 1.5;
          });
          y += 3;
        }

        // ─── POSTING TIP ───
        if (v.posting_tip) {
          checkPage(12);
          setF("bold", 8);
          doc.setTextColor(...MUTED);
          doc.text("POSTING TIP", M, y);
          y += 4;
          setF("normal", 8);
          doc.setTextColor(...DARK);
          const pLines = doc.splitTextToSize(v.posting_tip, CW - 3);
          doc.text(pLines, M + 2, y);
          y += pLines.length * 3.5 + 4;
        }

        // Separator between variants
        if (i < variants.length - 1) {
          y += 4;
          drawLine(y, LIGHT_BG);
          y += 8;
        }
      });

      // ─── FOOTER on last page ───
      setF("normal", 7);
      doc.setTextColor(...MUTED);
      doc.text("Generat cu ScriptStudio by @steph.ai.studio", W / 2, 290, { align: "center" });

      doc.save(`ScriptStudio_${(offerLabel || "export").replace(/\s+/g, "_")}.pdf`);
    } catch (e) {
      console.error("PDF export error:", e);
      alert("Eroare export PDF: " + e.message);
    }
  };

  const sLabel = { fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: t.muted, marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${t.border}` };

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: t.bg, minHeight: "100vh", color: t.dark, transition: "background .3s, color .3s" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} ::selection{background:${t.accent}33} ::-webkit-scrollbar{width:6px} ::-webkit-scrollbar-thumb{background:${t.border};border-radius:3px}`}</style>

      {/* HEADER */}
      <div style={{ background: dark ? "#111" : "#1A1512", padding: "0 24px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700, color: "#F5F0E8" }}>Script</span>
          <span style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700, color: t.accent }}>Studio</span>
          <span style={{ fontSize: 10, background: t.accent, color: "white", padding: "3px 8px", borderRadius: 20 }}>RO</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {variants.length > 0 && (
            <button onClick={exportPDF} style={{ background: "transparent", border: "1px solid rgba(245,240,232,.2)", borderRadius: 6, padding: "5px 12px", color: "rgba(245,240,232,.6)", fontSize: 11, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5 }}>
              📄 Export PDF
            </button>
          )}
          <button onClick={() => setDark(!dark)} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 16, padding: 4, color: "rgba(245,240,232,.5)" }}>
            {dark ? "☀️" : "🌙"}
          </button>
          <span style={{ fontSize: 11, color: "rgba(245,240,232,.3)" }}>by steph.ai.studio</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", minHeight: "calc(100vh - 52px)" }}>
        {/* SIDEBAR */}
        <div style={{ background: t.card, borderRight: `1px solid ${t.border}`, padding: "20px 18px", overflowY: "auto", transition: "background .3s" }}>
          {/* Mode tabs */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5, marginBottom: 16 }}>
            {[["manual", "Manual"], ["analyzer", "Analizor"], ["recreate", "Recreare"]].map(([id, lbl]) => (
              <button key={id} onClick={() => setMode(id)} style={{ background: mode === id ? t.accent : t.sand, border: `1px solid ${mode === id ? t.accent : t.border}`, borderRadius: 7, padding: "9px 4px", fontSize: 11, fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase", cursor: "pointer", color: mode === id ? "white" : t.muted, fontFamily: "inherit" }}>{lbl}</button>
            ))}
          </div>

          {/* Avatar Mode */}
          <div style={{ marginBottom: 16, borderRadius: 9, border: `1px solid ${avatarMode ? t.accent+"44" : t.border}`, overflow: "hidden", background: avatarMode ? `${t.accent}08` : t.barBg }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: t.dark }}>🤖 Avatar Mode</span>
              <button onClick={() => setAvatarMode(!avatarMode)} style={{ width: 38, height: 20, borderRadius: 10, background: avatarMode ? t.accent : t.border, border: "none", cursor: "pointer", position: "relative", transition: "background .2s" }}>
                <div style={{ width: 16, height: 16, borderRadius: "50%", background: "white", position: "absolute", top: 2, left: avatarMode ? 20 : 2, transition: "left .2s" }} />
              </button>
            </div>
            {!avatarMode && (
              <div style={{ padding: "0 12px 10px", fontSize: 11, color: t.muted, lineHeight: 1.5 }}>Activează pentru scripturi optimizate pentru avatare digitale (HeyGen, Synthesia, D-ID, Hedra)</div>
            )}
            {avatarMode && (
              <div style={{ padding: "0 12px 12px", display: "grid", gap: 8 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <FG label="Platformă avatar" t={t}><Sel val={avatarPlatform} set={setAvatarPlatform} opts={["HeyGen", "Synthesia", "D-ID", "Hedra", "Alta"]} t={t} /></FG>
                  <FG label="Tip avatar" t={t}><Sel val={avatarType} set={setAvatarType} opts={["Talking head static", "Talking head semi-static", "Full body static", "Full body cu gesturi"]} t={t} /></FG>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <FG label="Tonul vocii" t={t}><Sel val={avatarTone} set={setAvatarTone} opts={["Conversațional", "Profesional", "Energic", "Calm", "Autoritar", "Prietenos"]} t={t} /></FG>
                  <FG label="Max secunde/scenă" t={t}><Sel val={avatarMaxScene} set={setAvatarMaxScene} opts={["30", "45", "60", "90", "120"]} t={t} /></FG>
                </div>
                <FG label="Descriere avatar (opțional)" t={t}><Inp val={avatarDesc} set={setAvatarDesc} ph="ex: Femeie 30 ani, păr brunet, ton profesional, fundal birou minimalist" rows={2} t={t} /></FG>
              </div>
            )}
          </div>

          {/* FORM FIELDS */}
          {mode === "manual" && <>
            <div style={sLabel}>Detalii ofertă</div>
            <FG label="Ofertă / produs" t={t}><Inp val={offer} set={setOffer} ph="ex: Cursul meu de fotografie AI" t={t} /></FG>
            <FG label="Categorie" t={t}><Sel val={category} set={setCategory} opts={CATEGORIES} t={t} /></FG>
            <FG label="Propunere de valoare" t={t}><Inp val={value} set={setValue} ph="ex: Ajut antreprenorii să creeze conținut AI în 30 min/zi" rows={2} t={t} /></FG>
            <FG label="Audiență țintă" t={t}><Inp val={audience} set={setAudience} ph="ex: antreprenori români 25-40 ani" t={t} /></FG>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <FG label="Stadiu" t={t}><Sel val={stage} set={setStage} opts={STAGES} t={t} /></FG>
              <FG label="Obiectiv" t={t}><Sel val={objective} set={setObjective} opts={OBJECTIVES} t={t} /></FG>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <FG label="Platformă" t={t}><Sel val={platform} set={setPlatform} opts={PLATFORMS} t={t} /></FG>
              <FG label="Durată" t={t}><Sel val={length} set={setLength} opts={LENGTHS} t={t} /></FG>
            </div>
            <FG label="Proof Assets" t={t}><Inp val={proof} set={setProof} ph="ex: 400+ clienți, 1M vizualizări lunar" t={t} /></FG>
            <FG label="Obiecția principală" t={t}><Inp val={objection} set={setObjection} ph="ex: e prea scump, nu am timp" t={t} /></FG>
            <FG label="Obiectiv CTA" t={t}><Inp val={ctaGoal} set={setCtaGoal} ph="ex: Click link in bio" t={t} /></FG>
          </>}

          {mode === "analyzer" && <>
            <div style={sLabel}>Analizor pagină de vânzări</div>
            <FG label="Textul paginii de vânzări" t={t}><Inp val={page} set={setPage} ph="Lipește tot textul de pe landing page..." rows={10} t={t} /></FG>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <FG label="Platformă" t={t}><Sel val={aPlatform} set={setAPlatform} opts={PLATFORMS} t={t} /></FG>
              <FG label="Durată" t={t}><Sel val={aLength} set={setALength} opts={LENGTHS} t={t} /></FG>
            </div>
          </>}

          {mode === "recreate" && <>
            <div style={sLabel}>Recreează orice script</div>
            <FG label="Script original" t={t}><Inp val={script} set={setScript} ph="Lipește orice script de reclamă video..." rows={10} t={t} /></FG>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <FG label="Platformă" t={t}><Sel val={rPlatform} set={setRPlatform} opts={PLATFORMS} t={t} /></FG>
              <FG label="Durată" t={t}><Sel val={rLength} set={setRLength} opts={LENGTHS} t={t} /></FG>
            </div>
          </>}

          {/* Brand Voice */}
          <div style={{ marginTop: 12, marginBottom: 12, padding: "10px 10px", background: t.barBg, borderRadius: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: t.muted, marginBottom: 6 }}>💬 Brand Voice {brandVoice ? "(salvat)" : ""}</div>
            <Inp val={brandVoice} set={saveBrandVoice} ph="Lipește un text scris de tine ca referință de ton..." rows={2} t={t} />
          </div>

          {error && <div style={{ background: "rgba(192,57,43,.08)", border: "1px solid rgba(192,57,43,.25)", borderRadius: 7, padding: "9px 12px", fontSize: 12, color: "#c0392b", marginBottom: 10 }}>{error}</div>}

          <button onClick={generate} disabled={loading} style={{ width: "100%", background: loading ? t.muted : t.accent, color: "white", border: "none", borderRadius: 9, padding: 13, fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", marginTop: 6, transition: "background .2s" }}>
            {loading ? "⏳ Generăm..." : { manual: "⚡ Generează 3 scripturi", analyzer: "🔍 Analizează și generează", recreate: "🔄 Recreează mai bine" }[mode]}
          </button>

          {/* Recent History */}
          {history.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", ...sLabel }}>
                <span>🕐 Recente ({history.length})</span>
                <button onClick={() => setHistory([])} style={{ background: "transparent", border: "none", fontSize: 10, color: t.muted, cursor: "pointer" }}>Șterge</button>
              </div>
              {history.map((h, i) => (
                <div key={i} style={{ padding: "8px 10px", background: t.barBg, borderRadius: 6, marginBottom: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: t.dark }}>{h.label}</div>
                    <div style={{ fontSize: 10, color: t.muted }}>{h.platform} · {h.objective}</div>
                  </div>
                  <div style={{ fontSize: 10, color: t.muted }}>🕐 {h.time}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MAIN CONTENT */}
        <div style={{ padding: 24, overflowY: "auto" }}>
          {/* Empty state */}
          {!loading && variants.length === 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center", color: t.muted }}>
              <div style={{ fontSize: 52, opacity: .3, marginBottom: 18 }}>✍️</div>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 24, color: t.dark, marginBottom: 8 }}>Scriptul tău perfect te așteaptă</div>
              <div style={{ fontSize: 14, maxWidth: 380, lineHeight: 1.6 }}>Completează detaliile din stânga și generează 3 variante psihologic optimizate, cu scoring, ad copy și shot list — gata de filmat.</div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center" }}>
              <div style={{ width: 52, height: 52, border: `3px solid ${t.border}`, borderTopColor: t.accent, borderRadius: "50%", animation: "spin .75s linear infinite", marginBottom: 22 }} />
              <div style={{ fontSize: 15, fontWeight: 500, color: t.dark }}>{loadMsg}</div>
              <div style={{ fontSize: 13, color: t.muted, marginTop: 5 }}>Poate dura 30-60 secunde</div>
            </div>
          )}

          {/* Results */}
          {!loading && variants.length > 0 && (
            <>
              {/* Title bar */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700 }}>
                  Scripturi — <span style={{ color: t.accent }}>{offerLabel}</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setViewMode("single")} style={{ background: viewMode === "single" ? t.accent : "transparent", border: `1px solid ${viewMode === "single" ? t.accent : t.border}`, borderRadius: 6, padding: "5px 12px", fontSize: 10, color: viewMode === "single" ? "white" : t.muted, cursor: "pointer", fontFamily: "inherit" }}>Single</button>
                  <button onClick={() => { setViewMode("ab"); setAbA(0); setAbB(1); }} style={{ background: viewMode === "ab" ? t.accent : "transparent", border: `1px solid ${viewMode === "ab" ? t.accent : t.border}`, borderRadius: 6, padding: "5px 12px", fontSize: 10, color: viewMode === "ab" ? "white" : t.muted, cursor: "pointer", fontFamily: "inherit" }}>A/B Compare</button>
                </div>
              </div>

              {/* Variant tabs */}
              {viewMode === "single" && (
                <div style={{ display: "flex", gap: 7, marginBottom: 20, flexWrap: "wrap" }}>
                  {variants.map((v, i) => (
                    <button key={i} onClick={() => setActiveIdx(i)} style={{ background: activeIdx === i ? t.accent : t.card, border: `1px solid ${activeIdx === i ? t.accent : t.border}`, borderRadius: 7, padding: "7px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer", color: activeIdx === i ? "white" : t.dark, fontFamily: "inherit" }}>
                      Variantă {String.fromCharCode(65 + i)} — {v.conversion_score}/100
                    </button>
                  ))}
                </div>
              )}

              {/* A/B selectors */}
              {viewMode === "ab" && (
                <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: t.muted }}>Compară:</span>
                  <select value={abA} onChange={e => setAbA(+e.target.value)} style={{ background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 6, padding: "5px 10px", fontSize: 12, color: t.dark, fontFamily: "inherit" }}>
                    {variants.map((_, i) => <option key={i} value={i}>Variantă {String.fromCharCode(65+i)}</option>)}
                  </select>
                  <span style={{ fontSize: 12, color: t.muted }}>vs</span>
                  <select value={abB} onChange={e => setAbB(+e.target.value)} style={{ background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 6, padding: "5px 10px", fontSize: 12, color: t.dark, fontFamily: "inherit" }}>
                    {variants.map((_, i) => <option key={i} value={i}>Variantă {String.fromCharCode(65+i)}</option>)}
                  </select>
                </div>
              )}

              {/* Content */}
              {viewMode === "single" && (
                <VariantCard key={activeIdx} v={variants[activeIdx]} idx={activeIdx} t={t} onRefine={r => { const u = [...variants]; u[activeIdx] = r; setVariants(u); }} />
              )}
              {viewMode === "ab" && <ABView variants={variants} idxA={abA} idxB={abB} t={t} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
