import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Copy, Check, Sparkles, Mail, ClipboardList, ShieldCheck, FileSignature, Loader2, AlertTriangle, Compass, ListChecks } from "lucide-react";
import StackHomePage, { StackNav, FloatingMark, SectionLabel } from "./StackHomePage.jsx";
import LandingPage from "./LandingPage.jsx";
import DecoderPage from "./DecoderPage.jsx";

const OUTPUT_TYPES = [
  { id: "client_recap", label: "Client Meeting Recap", icon: Mail, description: "Compliant follow-up email summarizing the meeting" },
  { id: "discovery_call", label: "Discovery Call Summary", icon: Compass, description: "Warm, professional follow-up after a first prospect meeting" },
  { id: "crm_note", label: "CRM Meeting Note", icon: ClipboardList, description: "Structured note for Redtail, Wealthbox, or Salesforce" },
  { id: "compliance_log", label: "Compliance Memo", icon: ShieldCheck, description: "Suitability rationale & audit-ready record" },
  { id: "ips_update", label: "IPS Change Summary", icon: FileSignature, description: "Investment Policy Statement updates from the discussion" },
  { id: "task_list", label: "Internal Task List", icon: ListChecks, description: "Post-meeting tasks organized by owner for your team" },
];

const TONES = ["Formal", "Warm", "Concise"];

const panelStyle = {
  background: "rgba(255,255,255,0.025)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: "20px",
};

const inputBase = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "14px",
  color: "#fff",
  fontFamily: "Inter",
};

function ToolPage() {
  const [notes, setNotes] = useState("");
  const [tone, setTone] = useState("Formal");
  const [outputType, setOutputType] = useState("client_recap");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!notes.trim()) { setError("Paste meeting notes first."); return; }
    setLoading(true); setError(""); setOutput(""); setCopied(false);
    try {
      const response = await fetch("/.netlify/functions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes, tone, outputType }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed (${response.status})`);
      }
      const data = await response.json();
      setOutput(data.text || "");
    } catch (e) {
      setError(e.message || "Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyOutput = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen" style={{ background: "#000", color: "#fff" }}>
      <StackNav tool="AdvisorNotes" />

      <main className="max-w-6xl mx-auto px-6 pt-10 pb-16">

        <div className="mb-8 p-5 flex gap-3 items-start" style={{ background: "rgba(252,211,77,0.08)", border: "1px solid rgba(252,211,77,0.25)", borderRadius: "16px" }}>
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#fbbf24" }} />
          <p className="text-[14px] leading-relaxed" style={{ fontFamily: "Inter", color: "rgba(254,243,199,0.95)" }}>
            <strong style={{ fontWeight: 600 }}>Compliance reminder:</strong> AI-generated drafts must be reviewed by a qualified person before sending to clients or filing in books and records. This tool does not replace your firm's WSP, CCO review, or supervisory procedures. Output may be considered an electronic communication subject to retention rules (SEC 17a-4 / FINRA 4511).
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          {/* INPUT PANEL */}
          <section style={{ ...panelStyle, padding: "28px" }}>
            <SectionLabel>01 — Paste raw meeting notes</SectionLabel>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Annual review w/ Robert & Linda Chen 4/28 — Robert retiring Dec 2027 (was 2030), wants to derisk gradually, Linda inherited $180k from mother..."
              className="w-full h-72 p-4 text-[14px] leading-relaxed focus:outline-none resize-none"
              style={inputBase}
              onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
            />

            <div className="mt-7">
              <SectionLabel>02 — Choose output</SectionLabel>
              <div className="space-y-2">
                {OUTPUT_TYPES.map((t) => {
                  const Icon = t.icon;
                  const active = outputType === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setOutputType(t.id)}
                      className="w-full text-left p-3.5 transition-all flex items-start gap-3"
                      style={{
                        background: active ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.025)",
                        border: `1px solid ${active ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.07)"}`,
                        borderRadius: "14px",
                      }}
                    >
                      <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: active ? "#fff" : "rgba(255,255,255,0.55)" }} strokeWidth={1.6} />
                      <div>
                        <div style={{ fontFamily: "'Instrument Serif', serif", color: "#fff", fontSize: "17px" }}>{t.label}</div>
                        <div className="text-[13px] mt-0.5" style={{ fontFamily: "Inter", color: "rgba(255,255,255,0.55)" }}>{t.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-7">
              <SectionLabel>03 — Tone</SectionLabel>
              <div className="flex gap-2">
                {TONES.map((t) => {
                  const active = tone === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setTone(t)}
                      className="px-5 py-2.5 transition-all"
                      style={{
                        background: active ? "#fff" : "rgba(255,255,255,0.04)",
                        color: active ? "#000" : "rgba(255,255,255,0.85)",
                        border: `1px solid ${active ? "#fff" : "rgba(255,255,255,0.12)"}`,
                        borderRadius: "999px",
                        fontFamily: "Inter",
                        fontSize: "13px",
                      }}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={generate}
              disabled={loading}
              className="mt-8 w-full py-4 flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: "#fff", color: "#000", borderRadius: "999px", fontFamily: "Inter", fontWeight: 500, fontSize: "12px", letterSpacing: "0.14em", textTransform: "uppercase", border: "1px solid #fff", cursor: loading ? "wait" : "pointer" }}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Generate draft <span>→</span></>
              )}
            </button>
            {error && <p className="mt-3 text-sm" style={{ color: "#f87171", fontFamily: "Inter" }}>{error}</p>}
          </section>

          {/* OUTPUT PANEL */}
          <section style={{ ...panelStyle, padding: "28px" }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] uppercase" style={{ fontFamily: "Inter", letterSpacing: "0.22em", color: "rgba(255,255,255,0.5)" }}>
                Draft — for advisor review
              </span>
              {output && (
                <button onClick={copyOutput} className="text-[11px] uppercase flex items-center gap-1.5" style={{ fontFamily: "Inter", letterSpacing: "0.18em", color: "rgba(255,255,255,0.7)" }}>
                  {copied ? (<><Check className="w-3.5 h-3.5" /> Copied</>) : (<><Copy className="w-3.5 h-3.5" /> Copy</>)}
                </button>
              )}
            </div>
            <div className="min-h-[32rem] p-6" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px" }}>
              {!output && !loading && (
                <div className="h-full min-h-[28rem] flex items-center justify-center text-center px-8" style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", color: "rgba(255,255,255,0.35)", fontSize: "18px" }}>
                  Your draft will appear here. Always review before sending or filing.
                </div>
              )}
              {loading && (
                <div className="h-full min-h-[28rem] flex items-center justify-center" style={{ color: "rgba(255,255,255,0.5)" }}>
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              )}
              {output && (
                <pre className="whitespace-pre-wrap text-[15px] leading-relaxed" style={{ fontFamily: "Inter", color: "rgba(255,255,255,0.9)" }}>
                  {output}
                </pre>
              )}
            </div>
          </section>
        </div>

        <footer className="mt-16 pt-8 flex justify-between flex-wrap gap-3 text-[11px]" style={{ fontFamily: "Inter", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <span>Advisor Stack — Prototype</span>
          <span>Not a substitute for compliance review · Not investment advice</span>
        </footer>
      </main>

      <FloatingMark />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StackHomePage />} />
        <Route path="/notes" element={<LandingPage />} />
        <Route path="/app" element={<ToolPage />} />
        <Route path="/decoder" element={<DecoderPage />} />
      </Routes>
    </BrowserRouter>
  );
}
