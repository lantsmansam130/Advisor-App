import { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Copy, Check, Sparkles, Mail, ClipboardList, ShieldCheck, FileSignature, Loader2, AlertTriangle, Compass, ListChecks } from "lucide-react";
import StackHomePage, { AnimatedBackground, StackNav } from "./StackHomePage.jsx";
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

const glassPanel = { background: "rgba(255,255,255,0.55)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.7)", borderRadius: "16px", boxShadow: "0 8px 32px rgba(31,38,135,0.08)" };

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
    <div className="min-h-screen relative" style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: "#0a0f1f" }}>
      <AnimatedBackground />

      <div className="relative z-10">
        <StackNav tool="AdvisorNotes" />

        <div className="max-w-6xl mx-auto px-6 py-10">

          <div className="mb-10 p-4 flex gap-3 items-start" style={{ background: "rgba(254,243,199,0.7)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(251,191,36,0.6)", borderRadius: "12px" }}>
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#b45309" }} />
            <p className="text-sm leading-relaxed" style={{ fontFamily: "system-ui", color: "#78350f" }}>
              <strong>Compliance reminder:</strong> AI-generated drafts must be reviewed by a qualified person before sending to clients or filing in books and records. This tool does not replace your firm's WSP, CCO review, or supervisory procedures. Output may be considered an electronic communication subject to retention rules (SEC 17a-4 / FINRA 4511).
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <section style={{ ...glassPanel, padding: "24px" }}>
              <label className="block mb-3">
                <span className="text-xs uppercase tracking-[0.2em]" style={{ fontFamily: "system-ui", color: "#1e1b4b" }}>
                  01 — Paste raw meeting notes
                </span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Annual review w/ Robert & Linda Chen 4/28 — Robert retiring Dec 2027 (was 2030), wants to derisk gradually, Linda inherited $180k from mother..."
                className="w-full h-72 p-4 text-base leading-relaxed focus:outline-none resize-none"
                style={{ fontFamily: "Georgia, serif", color: "#0a0f1f", background: "rgba(255,255,255,0.65)", border: "1px solid rgba(30,27,75,0.2)", borderRadius: "10px" }}
              />

              <div className="mt-6">
                <span className="text-xs uppercase tracking-[0.2em] block mb-3" style={{ fontFamily: "system-ui", color: "#1e1b4b" }}>02 — Choose output</span>
                <div className="space-y-2">
                  {OUTPUT_TYPES.map((t) => {
                    const Icon = t.icon;
                    const active = outputType === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setOutputType(t.id)}
                        className="w-full text-left p-3 transition-all flex items-start gap-3"
                        style={{
                          background: active ? "rgba(30,27,75,0.1)" : "rgba(255,255,255,0.4)",
                          border: active ? "1px solid rgba(30,27,75,0.5)" : "1px solid rgba(255,255,255,0.6)",
                          borderRadius: "10px",
                        }}
                      >
                        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: active ? "#1e1b4b" : "#475569" }} strokeWidth={1.8} />
                        <div>
                          <div style={{ fontFamily: "Georgia, serif", color: "#0a0f1f", fontSize: "15px" }}>{t.label}</div>
                          <div className="text-sm" style={{ color: "#475569" }}>{t.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6">
                <span className="text-xs uppercase tracking-[0.2em] block mb-3" style={{ fontFamily: "system-ui", color: "#1e1b4b" }}>03 — Tone</span>
                <div className="flex gap-2">
                  {TONES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTone(t)}
                      className="px-4 py-2 text-sm transition-all"
                      style={{
                        background: tone === t ? "rgba(30,27,75,0.95)" : "rgba(255,255,255,0.5)",
                        color: tone === t ? "#fff" : "#1f2937",
                        border: "1px solid " + (tone === t ? "rgba(30,27,75,0.95)" : "rgba(255,255,255,0.7)"),
                        borderRadius: "10px",
                        fontFamily: "system-ui",
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={generate}
                disabled={loading}
                className="mt-8 w-full py-4 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: "rgba(30,27,75,0.95)", color: "#fff", borderRadius: "12px", fontFamily: "system-ui", letterSpacing: "0.1em", boxShadow: "0 8px 24px rgba(30,27,75,0.35)" }}
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> GENERATING...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> GENERATE DRAFT</>
                )}
              </button>
              {error && <p className="mt-3 text-sm" style={{ color: "#b91c1c" }}>{error}</p>}
            </section>

            <section style={{ ...glassPanel, padding: "24px" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-[0.2em]" style={{ fontFamily: "system-ui", color: "#1e1b4b" }}>Draft — for advisor review</span>
                {output && (
                  <button onClick={copyOutput} className="text-xs uppercase tracking-[0.2em] flex items-center gap-1.5 transition-colors" style={{ fontFamily: "system-ui", color: "#1e1b4b" }}>
                    {copied ? (<><Check className="w-3.5 h-3.5" /> Copied</>) : (<><Copy className="w-3.5 h-3.5" /> Copy</>)}
                  </button>
                )}
              </div>
              <div className="min-h-[32rem] p-6" style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(30,27,75,0.15)", borderRadius: "10px" }}>
                {!output && !loading && (
                  <div className="h-full min-h-[28rem] flex items-center justify-center italic text-center px-8" style={{ color: "#94a3b8" }}>
                    Your draft will appear here. Always review before sending or filing.
                  </div>
                )}
                {loading && (
                  <div className="h-full min-h-[28rem] flex items-center justify-center" style={{ color: "#475569" }}>
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                )}
                {output && (
                  <pre className="whitespace-pre-wrap text-[15px] leading-relaxed" style={{ fontFamily: "Georgia, serif", color: "#0a0f1f" }}>
                    {output}
                  </pre>
                )}
              </div>
            </section>
          </div>

          <footer className="mt-16 pt-8 text-xs uppercase tracking-[0.2em] flex justify-between flex-wrap gap-3" style={{ fontFamily: "system-ui", color: "#1e1b4b", borderTop: "1px solid rgba(30,27,75,0.15)" }}>
            <span>Advisor Stack — Prototype</span>
            <span>Not a substitute for compliance review · Not investment advice</span>
          </footer>
        </div>
      </div>
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
