import { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Copy, Check, Sparkles, Mail, ClipboardList, ShieldCheck, FileSignature, Loader2, AlertTriangle, ArrowLeft, Compass, ListChecks } from "lucide-react";
import StackHomePage from "./StackHomePage.jsx";
import LandingPage from "./LandingPage.jsx";

const OUTPUT_TYPES = [
  { id: "client_recap", label: "Client Meeting Recap", icon: Mail, description: "Compliant follow-up email summarizing the meeting" },
  { id: "discovery_call", label: "Discovery Call Summary", icon: Compass, description: "Warm, professional follow-up after a first prospect meeting" },
  { id: "crm_note", label: "CRM Meeting Note", icon: ClipboardList, description: "Structured note for Redtail, Wealthbox, or Salesforce" },
  { id: "compliance_log", label: "Compliance Memo", icon: ShieldCheck, description: "Suitability rationale & audit-ready record" },
  { id: "ips_update", label: "IPS Change Summary", icon: FileSignature, description: "Investment Policy Statement updates from the discussion" },
  { id: "task_list", label: "Internal Task List", icon: ListChecks, description: "Post-meeting tasks organized by owner for your team" },
];

const TONES = ["Formal", "Warm", "Concise"];

function ToolPage() {
  const [notes, setNotes] = useState("");
  const [tone, setTone] = useState("Formal");
  const [outputType, setOutputType] = useState("client_recap");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!notes.trim()) {
      setError("Paste meeting notes first.");
      return;
    }
    setLoading(true);
    setError("");
    setOutput("");
    setCopied(false);

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
    <div className="min-h-screen bg-slate-50 text-slate-900" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
      <div className="h-0.5 bg-emerald-800" />

      <nav className="border-b border-slate-200 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <svg width="22" height="22" viewBox="0 0 28 28" className="flex-shrink-0">
              <rect x="0" y="0" width="28" height="28" rx="2" fill="#065f46"/>
              <text x="14" y="20" fontFamily="Georgia, serif" fontSize="18" fontStyle="italic" fill="#f8fafc" textAnchor="middle">A</text>
            </svg>
            <div className="text-xl text-slate-900" style={{ fontFamily: "Georgia, serif" }}>
              Advisor<span className="italic text-emerald-800">Stack</span>
            </div>
            <span className="text-slate-400 mx-2" style={{ fontFamily: "Georgia, serif" }}>/</span>
            <div className="text-base text-slate-700" style={{ fontFamily: "Georgia, serif" }}>AdvisorNotes</div>
          </Link>
          <div className="flex gap-5 items-center">
            <Link to="/notes" className="flex items-center gap-1.5 text-slate-600 hover:text-emerald-800 transition-colors no-underline" style={{ fontFamily: "system-ui", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              About this tool
            </Link>
            <Link to="/" className="flex items-center gap-1.5 text-slate-600 hover:text-emerald-800 transition-colors no-underline" style={{ fontFamily: "system-ui", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              <ArrowLeft className="w-3.5 h-3.5" /> All tools
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">

        <div className="mb-10 p-4 bg-amber-50 border border-amber-300 flex gap-3 items-start">
          <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-900 leading-relaxed" style={{ fontFamily: "system-ui" }}>
            <strong>Compliance reminder:</strong> AI-generated drafts must be reviewed by a qualified person before sending to clients or filing in books and records. This tool does not replace your firm's WSP, CCO review, or supervisory procedures. Output may be considered an electronic communication subject to retention rules (SEC 17a-4 / FINRA 4511).
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          <section>
            <label className="block mb-3">
              <span className="text-xs uppercase tracking-[0.2em] text-slate-500" style={{ fontFamily: "system-ui" }}>
                01 — Paste raw meeting notes
              </span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Annual review w/ Robert & Linda Chen 4/28 — Robert retiring Dec 2027 (was 2030), wants to derisk gradually, Linda inherited $180k from mother, asking re: Roth conversions before retirement, concerned about LTC for Linda's father, daughter starting college fall 2027 — 529 balance ~$95k, need to send updated risk questionnaire, schedule tax planning mtg w/ CPA in June..."
              className="w-full h-72 p-4 bg-white border border-slate-300 rounded-sm text-slate-800 text-base leading-relaxed focus:outline-none focus:border-emerald-700 transition-colors resize-none"
              style={{ fontFamily: "Georgia, serif" }}
            />

            <div className="mt-6">
              <span className="text-xs uppercase tracking-[0.2em] text-slate-500 block mb-3" style={{ fontFamily: "system-ui" }}>
                02 — Choose output
              </span>
              <div className="space-y-2">
                {OUTPUT_TYPES.map((t) => {
                  const Icon = t.icon;
                  const active = outputType === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setOutputType(t.id)}
                      className={`w-full text-left p-3 border transition-all flex items-start gap-3 ${
                        active ? "border-emerald-800 bg-emerald-50" : "border-slate-300 bg-white hover:border-slate-500"
                      }`}
                    >
                      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${active ? "text-emerald-800" : "text-slate-400"}`} />
                      <div>
                        <div className="font-semibold text-slate-900">{t.label}</div>
                        <div className="text-sm text-slate-600">{t.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6">
              <span className="text-xs uppercase tracking-[0.2em] text-slate-500 block mb-3" style={{ fontFamily: "system-ui" }}>
                03 — Tone
              </span>
              <div className="flex gap-2">
                {TONES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`px-4 py-2 border text-sm transition-all ${
                      tone === t ? "border-slate-900 bg-slate-900 text-slate-50" : "border-slate-300 bg-white hover:border-slate-500"
                    }`}
                    style={{ fontFamily: "system-ui" }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={generate}
              disabled={loading}
              className="mt-8 w-full py-4 bg-slate-900 text-slate-50 hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ fontFamily: "system-ui", letterSpacing: "0.1em" }}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> GENERATING...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> GENERATE DRAFT</>
              )}
            </button>
            {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-[0.2em] text-slate-500" style={{ fontFamily: "system-ui" }}>
                Draft — for advisor review
              </span>
              {output && (
                <button
                  onClick={copyOutput}
                  className="text-xs uppercase tracking-[0.2em] text-slate-600 hover:text-emerald-800 flex items-center gap-1.5 transition-colors"
                  style={{ fontFamily: "system-ui" }}
                >
                  {copied ? (<><Check className="w-3.5 h-3.5" /> Copied</>) : (<><Copy className="w-3.5 h-3.5" /> Copy</>)}
                </button>
              )}
            </div>
            <div className="min-h-[32rem] p-6 bg-white border border-slate-300 rounded-sm">
              {!output && !loading && (
                <div className="h-full flex items-center justify-center text-slate-400 italic text-center px-8">
                  Your draft will appear here. Always review before sending or filing.
                </div>
              )}
              {loading && (
                <div className="h-full flex items-center justify-center text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              )}
              {output && (
                <pre className="whitespace-pre-wrap text-slate-800 text-[15px] leading-relaxed" style={{ fontFamily: "Georgia, serif" }}>
                  {output}
                </pre>
              )}
            </div>
          </section>
        </div>

        <footer className="mt-16 pt-8 border-t border-slate-300 text-xs uppercase tracking-[0.2em] text-slate-500 flex justify-between flex-wrap gap-3" style={{ fontFamily: "system-ui" }}>
          <span>Advisor Stack — Prototype</span>
          <span>Not a substitute for compliance review · Not investment advice</span>
        </footer>
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
      </Routes>
    </BrowserRouter>
  );
}
