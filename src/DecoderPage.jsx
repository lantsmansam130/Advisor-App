import { useState } from "react";
import { Copy, Check, Loader2, AlertTriangle } from "lucide-react";
import { StackNav, FloatingMark, SectionLabel, EditorialHeading } from "./StackHomePage.jsx";

const DOC_TYPES = [
  "Annuity contract",
  "Insurance policy",
  "Trust / estate doc",
  "Employer benefits",
  "Other / Unknown",
];

const READING_LEVELS = ["General client", "Sophisticated client"];

const MAX_CHARS = 15000;

const inputStyle = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "14px",
  color: "#fff",
};

const optionBase = {
  fontFamily: "Inter",
  fontSize: "13px",
  borderRadius: "999px",
  padding: "10px 18px",
  transition: "all 0.2s",
  cursor: "pointer",
};

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
    <div className="min-h-screen" style={{ background: "#000", color: "#fff" }}>
      <StackNav tool="Document Decoder" />

      <main className="max-w-5xl mx-auto px-6 pt-12 pb-16">

        <div className="mb-12 text-center">
          <SectionLabel>Document Decoder</SectionLabel>
          <EditorialHeading italic="Decode" rest="the fine print." size="lg" className="mb-5 max-w-3xl mx-auto" />
          <p className="max-w-2xl mx-auto text-lg" style={{ fontFamily: "Inter", color: "rgba(255,255,255,0.65)", lineHeight: 1.55 }}>
            Paste a section of an annuity contract, insurance policy, trust document, or benefits package. Get a plain-English breakdown — what it says, what to watch for, what to ask before signing.
          </p>
        </div>

        <div className="mb-8 p-5 flex gap-3 items-start" style={{ background: "rgba(252,211,77,0.08)", border: "1px solid rgba(252,211,77,0.25)", borderRadius: "16px" }}>
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#fbbf24" }} />
          <p className="text-[14px] leading-relaxed" style={{ fontFamily: "Inter", color: "rgba(254,243,199,0.95)" }}>
            <strong style={{ fontWeight: 600 }}>Compliance reminder:</strong> Explanations are starting drafts, not legal, tax, or insurance advice. Verify with the document issuer, the client's attorney, or the appropriate professional before any client conversation or recommendation.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-5 mb-6">
          <div>
            <SectionLabel>01 — Document type</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {DOC_TYPES.map((d) => {
                const active = docType === d;
                return (
                  <button
                    key={d}
                    onClick={() => setDocType(d)}
                    style={{
                      ...optionBase,
                      background: active ? "#fff" : "rgba(255,255,255,0.04)",
                      color: active ? "#000" : "rgba(255,255,255,0.85)",
                      border: `1px solid ${active ? "#fff" : "rgba(255,255,255,0.12)"}`,
                    }}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <SectionLabel>02 — Reading level</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {READING_LEVELS.map((r) => {
                const active = readingLevel === r;
                return (
                  <button
                    key={r}
                    onClick={() => setReadingLevel(r)}
                    style={{
                      ...optionBase,
                      background: active ? "#fff" : "rgba(255,255,255,0.04)",
                      color: active ? "#000" : "rgba(255,255,255,0.85)",
                      border: `1px solid ${active ? "#fff" : "rgba(255,255,255,0.12)"}`,
                    }}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-end mb-3">
            <SectionLabel>03 — Paste the document section</SectionLabel>
            <span className="text-[11px]" style={{ fontFamily: "Inter", color: source.length > MAX_CHARS ? "#f87171" : "rgba(255,255,255,0.45)", letterSpacing: "0.1em" }}>
              {source.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
            </span>
          </div>
          <textarea
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder='"Section 4.3 — Surrender Charges. The Owner may surrender this Contract for its Cash Surrender Value at any time prior to the Annuity Date..."'
            className="w-full h-64 p-5 text-[14px] leading-relaxed focus:outline-none resize-none"
            style={{ ...inputStyle, fontFamily: "Inter" }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
          />
        </div>

        <button
          onClick={decode}
          disabled={loading || source.length > MAX_CHARS}
          className="w-full py-4 mb-8 flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ background: "#fff", color: "#000", borderRadius: "999px", fontFamily: "Inter", fontWeight: 500, fontSize: "12px", letterSpacing: "0.14em", textTransform: "uppercase", border: "1px solid #fff", cursor: loading ? "wait" : "pointer" }}
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Decoding document…</>
          ) : (
            <>Decode document <span>→</span></>
          )}
        </button>
        {error && <p className="mb-6 text-sm" style={{ color: "#f87171", fontFamily: "Inter" }}>{error}</p>}

        <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px" }}>
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <span className="text-[11px] uppercase" style={{ fontFamily: "Inter", letterSpacing: "0.18em", color: "rgba(255,255,255,0.5)" }}>
              Decoded — for advisor review
            </span>
            {output && (
              <button
                onClick={copyOutput}
                className="text-[11px] uppercase flex items-center gap-1.5"
                style={{ fontFamily: "Inter", letterSpacing: "0.18em", color: "rgba(255,255,255,0.7)" }}
              >
                {copied ? (<><Check className="w-3.5 h-3.5" /> Copied</>) : (<><Copy className="w-3.5 h-3.5" /> Copy all</>)}
              </button>
            )}
          </div>
          <div className="min-h-[24rem] p-6">
            {!output && !loading && (
              <div className="h-full min-h-[20rem] flex items-center justify-center text-center px-8" style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", color: "rgba(255,255,255,0.35)", fontSize: "18px" }}>
                Your decoded breakdown will appear here. Always verify against the full document before any client conversation.
              </div>
            )}
            {loading && (
              <div className="h-full min-h-[20rem] flex items-center justify-center" style={{ color: "rgba(255,255,255,0.5)" }}>
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}
            {output && (
              <pre className="whitespace-pre-wrap text-[15px] leading-relaxed" style={{ fontFamily: "Inter", color: "rgba(255,255,255,0.9)" }}>
                {output}
              </pre>
            )}
          </div>
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
