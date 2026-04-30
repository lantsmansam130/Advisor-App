import { useState } from "react";
import { Link } from "react-router-dom";
import { Copy, Check, Loader2, AlertTriangle, ArrowLeft } from "lucide-react";

const DOC_TYPES = [
  "Annuity contract",
  "Insurance policy",
  "Trust / estate doc",
  "Employer benefits",
  "Other / Unknown",
];

const READING_LEVELS = ["General client", "Sophisticated client"];

const MAX_CHARS = 15000;

export default function DecoderPage() {
  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const [readingLevel, setReadingLevel] = useState(READING_LEVELS[0]);
  const [source, setSource] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const decode = async () => {
    if (!source.trim()) {
      setError("Paste a document section first.");
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
        body: JSON.stringify({
          notes: source,
          tone: `${docType}|${readingLevel}`,
          outputType: "document_decoder",
        }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed (${response.status})`);
      }
      const data = await response.json();
      setOutput(data.text || "");
    } catch (e) {
      setError(e.message || "Decode failed. Please try again.");
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
            <div className="text-base text-slate-700" style={{ fontFamily: "Georgia, serif" }}>Document Decoder</div>
          </Link>
          <Link to="/" className="flex items-center gap-1.5 text-slate-600 hover:text-emerald-800 transition-colors no-underline" style={{ fontFamily: "system-ui", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            <ArrowLeft className="w-3.5 h-3.5" /> All tools
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">

        <div className="mb-8">
          <h1 className="text-4xl text-slate-900 leading-tight mb-3" style={{ fontFamily: "Georgia, serif", fontWeight: 400 }}>
            Document Decoder
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl leading-relaxed" style={{ fontFamily: "Georgia, serif" }}>
            Paste a section of an annuity contract, insurance policy, trust document, or benefits package. Get a plain-English breakdown — what it says, what to watch for, and what to ask before signing.
          </p>
        </div>

        <div className="mb-8 p-4 bg-amber-50 border border-amber-300 flex gap-3 items-start">
          <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-900 leading-relaxed" style={{ fontFamily: "system-ui" }}>
            <strong>Compliance reminder:</strong> Explanations are starting drafts, not legal, tax, or insurance advice. Verify with the document issuer, the client's attorney, or the appropriate professional before any client conversation or recommendation.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-slate-500 block mb-3" style={{ fontFamily: "system-ui" }}>
              01 — Document type
            </span>
            <div className="grid grid-cols-2 gap-2">
              {DOC_TYPES.map((d, i) => {
                const active = docType === d;
                const fullWidth = i === DOC_TYPES.length - 1;
                return (
                  <button
                    key={d}
                    onClick={() => setDocType(d)}
                    className={`p-2.5 border text-sm transition-all text-left ${
                      active ? "border-emerald-800 bg-emerald-50 text-emerald-800" : "border-slate-300 bg-white text-slate-700 hover:border-slate-500"
                    } ${fullWidth ? "col-span-2" : ""}`}
                    style={{ fontFamily: "system-ui" }}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-slate-500 block mb-3" style={{ fontFamily: "system-ui" }}>
              02 — Reading level for output
            </span>
            <div className="flex gap-2">
              {READING_LEVELS.map((r) => (
                <button
                  key={r}
                  onClick={() => setReadingLevel(r)}
                  className={`px-4 py-2.5 border text-sm transition-all ${
                    readingLevel === r ? "border-slate-900 bg-slate-900 text-slate-50" : "border-slate-300 bg-white text-slate-700 hover:border-slate-500"
                  }`}
                  style={{ fontFamily: "system-ui" }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs uppercase tracking-[0.2em] text-slate-500" style={{ fontFamily: "system-ui" }}>
              03 — Paste the document section
            </span>
            <span className={`text-xs ${source.length > MAX_CHARS ? "text-red-700" : "text-slate-500"}`} style={{ fontFamily: "system-ui" }}>
              {source.length.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters
            </span>
          </div>
          <textarea
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder='"Section 4.3 — Surrender Charges. The Owner may surrender this Contract for its Cash Surrender Value at any time prior to the Annuity Date. Surrender Charges shall apply during the Surrender Charge Period as set forth in Schedule A..."'
            className="w-full h-64 p-4 bg-white border border-slate-300 rounded-sm text-slate-800 text-sm leading-relaxed focus:outline-none focus:border-emerald-700 transition-colors resize-none"
            style={{ fontFamily: "Georgia, serif" }}
          />
        </div>

        <button
          onClick={decode}
          disabled={loading || source.length > MAX_CHARS}
          className="w-full py-4 bg-slate-900 text-slate-50 hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mb-8"
          style={{ fontFamily: "system-ui", letterSpacing: "0.1em", textTransform: "uppercase", fontSize: "13px" }}
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Decoding document...</>
          ) : (
            <>Decode document →</>
          )}
        </button>
        {error && <p className="mb-6 text-sm text-red-700">{error}</p>}

        <div className="bg-white border border-slate-300 rounded-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <span className="text-xs uppercase tracking-[0.2em] text-slate-500" style={{ fontFamily: "system-ui" }}>
              Decoded — for advisor review
            </span>
            {output && (
              <button
                onClick={copyOutput}
                className="text-xs uppercase tracking-[0.2em] text-slate-600 hover:text-emerald-800 flex items-center gap-1.5 transition-colors"
                style={{ fontFamily: "system-ui" }}
              >
                {copied ? (<><Check className="w-3.5 h-3.5" /> Copied</>) : (<><Copy className="w-3.5 h-3.5" /> Copy all</>)}
              </button>
            )}
          </div>
          <div className="min-h-[24rem] p-6">
            {!output && !loading && (
              <div className="h-full min-h-[20rem] flex items-center justify-center text-slate-400 italic text-center px-8">
                Your decoded breakdown will appear here. Always verify against the full document before any client conversation.
              </div>
            )}
            {loading && (
              <div className="h-full min-h-[20rem] flex items-center justify-center text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}
            {output && (
              <pre className="whitespace-pre-wrap text-slate-800 text-[15px] leading-relaxed" style={{ fontFamily: "Georgia, serif" }}>
                {output}
              </pre>
            )}
          </div>
        </div>

        <footer className="mt-16 pt-8 border-t border-slate-300 text-xs uppercase tracking-[0.2em] text-slate-500 flex justify-between flex-wrap gap-3" style={{ fontFamily: "system-ui" }}>
          <span>Advisor Stack — Prototype</span>
          <span>Not a substitute for compliance review · Not investment advice</span>
        </footer>
      </div>
    </div>
  );
}
