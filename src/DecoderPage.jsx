import { useState, useRef, useEffect, useMemo } from "react";
import { Copy, Check, Loader2, AlertTriangle, Upload, FileText, X, Eye, HelpCircle, FileText as FileTextIcon } from "lucide-react";
import { StackNav, FloatingMark, SectionLabel, EditorialHeading, palette } from "./StackHomePage.jsx";
import { MarkdownContent } from "./MarkdownArtifact.jsx";

// Parse the decoder output (sections A/B/C as defined in the document_decoder prompt)
// into structured pieces. Falls back to a single "Decoded section" if the model deviates.
function parseDecoderOutput(text) {
  if (!text) return null;
  // Match either "A. WHAT THIS SECTION SAYS" (legacy) or "## A. ..." (markdown)
  const re = /(?:^|\n)#{0,3}\s*([ABC])\.\s+([^\n]+)\n([\s\S]*?)(?=(?:\n#{0,3}\s*[ABC]\.\s)|$)/g;
  const sections = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    sections.push({ key: m[1], heading: m[2].trim(), body: m[3].trim() });
  }
  if (sections.length < 2) return null;
  return sections;
}

const SECTION_META = {
  A: { icon: FileTextIcon, label: "What this section says" },
  B: { icon: Eye, label: "Watch for" },
  C: { icon: HelpCircle, label: "Questions to ask" },
};

function DecodedOutput({ output, loading, onCopyAll, copied }) {
  const sections = useMemo(() => parseDecoderOutput(output), [output]);

  // Empty state
  if (!output && !loading) {
    return (
      <div
        className="flex items-center justify-center text-center px-8 py-20"
        style={{
          background: palette.paper,
          border: `1px dashed ${palette.borderMid}`,
          borderRadius: "20px",
          fontFamily: "'Instrument Serif', serif",
          fontStyle: "italic",
          color: palette.dust,
          fontSize: "18px",
          minHeight: "20rem",
        }}
      >
        Your decoded breakdown will appear here. Always verify against the full document before any client conversation.
      </div>
    );
  }

  // Loading
  if (loading && !output) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ background: palette.paper, border: `1px solid ${palette.borderSubtle}`, borderRadius: "20px", color: palette.ash, minHeight: "20rem" }}
      >
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top-level header chrome */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-[11px] uppercase" style={{ fontFamily: "Inter", fontWeight: 500, letterSpacing: "0.18em", color: palette.ash }}>
          Decoded — for advisor review
        </span>
        <button
          onClick={onCopyAll}
          className="text-[11px] uppercase flex items-center gap-1.5"
          style={{ fontFamily: "Inter", letterSpacing: "0.18em", color: palette.forest }}
        >
          {copied ? (<><Check className="w-3.5 h-3.5" /> Copied</>) : (<><Copy className="w-3.5 h-3.5" /> Copy all</>)}
        </button>
      </div>

      {sections ? (
        sections.map(({ key, heading, body }) => {
          const meta = SECTION_META[key] || { icon: FileTextIcon, label: heading };
          const Icon = meta.icon;
          return (
            <div
              key={key}
              style={{
                background: palette.paper,
                border: `1px solid ${palette.borderSubtle}`,
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: "0 1px 2px rgba(15,14,12,0.04), 0 8px 24px -16px rgba(15,14,12,0.12)",
              }}
            >
              <div
                className="flex items-center gap-3 px-5 py-3.5"
                style={{ background: palette.cream, borderBottom: `1px solid ${palette.borderSubtle}` }}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(31,58,46,0.06)" }}>
                  <Icon className="w-4 h-4" style={{ color: palette.forest }} strokeWidth={1.6} />
                </div>
                <div>
                  <div className="text-[10px] uppercase" style={{ fontFamily: "Inter", fontWeight: 500, letterSpacing: "0.18em", color: palette.ash }}>
                    Section {key}
                  </div>
                  <div className="text-[16px]" style={{ fontFamily: "'Instrument Serif', serif", color: palette.ink, letterSpacing: "-0.005em" }}>
                    {meta.label}
                  </div>
                </div>
              </div>
              <div className="px-5 py-4">
                <MarkdownContent content={body} />
              </div>
            </div>
          );
        })
      ) : (
        // Fallback: render the whole output as one card if parsing failed
        <div
          style={{
            background: palette.paper,
            border: `1px solid ${palette.borderSubtle}`,
            borderRadius: "20px",
            padding: "24px",
            boxShadow: "0 1px 2px rgba(15,14,12,0.04), 0 8px 24px -16px rgba(15,14,12,0.12)",
          }}
        >
          <MarkdownContent content={output} />
        </div>
      )}
    </div>
  );
}

const DOC_TYPES = [
  "Annuity contract",
  "Insurance policy",
  "Trust / estate doc",
  "Employer benefits",
  "Other / Unknown",
];

const READING_LEVELS = ["General client", "Sophisticated client"];

const MAX_CHARS = 15000;
const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25 MB

const inputStyle = {
  background: palette.paper,
  border: `1px solid ${palette.borderMid}`,
  borderRadius: "14px",
  color: palette.ink,
};

const optionBase = {
  fontFamily: "Inter",
  fontSize: "13px",
  borderRadius: "999px",
  padding: "10px 18px",
  transition: "all 0.2s",
  cursor: "pointer",
};

// Lazily extract text from a PDF using pdfjs-dist.
// Imported dynamically so the chunk only loads when a user actually uploads a PDF.
async function extractPdfText(file) {
  const pdfjs = await import("pdfjs-dist/build/pdf.mjs");
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buf }).promise;
  const parts = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((it) => ("str" in it ? it.str : "")).join(" ");
    parts.push(strings);
  }
  return parts.join("\n\n").replace(/\s+\n/g, "\n").trim();
}

async function extractTextFromFile(file) {
  const name = (file.name || "").toLowerCase();
  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    return extractPdfText(file);
  }
  if (name.endsWith(".txt") || name.endsWith(".md") || file.type.startsWith("text/")) {
    return await file.text();
  }
  throw new Error("Unsupported file type. Upload a PDF or .txt file, or paste text directly.");
}

export default function DecoderPage() {
  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const [readingLevel, setReadingLevel] = useState(READING_LEVELS[0]);
  const [source, setSource] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null); // { name, sizeBytes }
  const [extracting, setExtracting] = useState(false);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const decode = async () => {
    if (!source.trim()) {
      setError("Upload a document or paste a section first.");
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

  async function handleFile(file) {
    if (!file) return;
    setError("");
    if (file.size > MAX_FILE_BYTES) {
      setError(`File too large. Maximum size is ${Math.round(MAX_FILE_BYTES / (1024 * 1024))} MB.`);
      return;
    }
    setExtracting(true);
    try {
      const text = await extractTextFromFile(file);
      if (!text.trim()) {
        setError("No text could be extracted from this file. Scanned PDFs without OCR aren't supported yet — paste the relevant section instead.");
        return;
      }
      const trimmed = text.length > MAX_CHARS ? text.slice(0, MAX_CHARS) : text;
      setSource(trimmed);
      setUploadedFile({ name: file.name, sizeBytes: file.size, truncated: text.length > MAX_CHARS });
    } catch (e) {
      setError(e.message || "Could not read this file.");
    } finally {
      setExtracting(false);
    }
  }

  function clearFile() {
    setUploadedFile(null);
    setSource("");
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  // Clear uploaded-file metadata if the user starts editing the textarea manually
  useEffect(() => {
    if (uploadedFile && !source) setUploadedFile(null);
  }, [source, uploadedFile]);

  return (
    <div className="min-h-screen" style={{ background: palette.cream, color: palette.ink }}>
      <StackNav tool="Document Decoder" />

      <main className="max-w-5xl mx-auto px-6 pt-12 pb-16">

        <div className="mb-12 text-center">
          <SectionLabel>Document Decoder</SectionLabel>
          <EditorialHeading italic="Decode" rest="the fine print." size="lg" className="mb-5 max-w-3xl mx-auto" />
          <p className="max-w-2xl mx-auto text-lg" style={{ fontFamily: "Inter", color: palette.ash, lineHeight: 1.55 }}>
            Upload a PDF — or paste a section — of an annuity, insurance policy, trust document, or benefits package. Get a plain-English breakdown: what it says, what to watch for, what to ask before signing.
          </p>
        </div>

        <div className="mb-8 p-5 flex gap-3 items-start" style={{ background: "rgba(212,165,116,0.12)", border: "1px solid rgba(212,165,116,0.4)", borderRadius: "16px" }}>
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#9F6F3D" }} />
          <p className="text-[14px] leading-relaxed" style={{ fontFamily: "Inter", color: "#5C3F1E" }}>
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
                      background: active ? palette.ink : palette.paper,
                      color: active ? palette.cream : palette.ink,
                      border: `1px solid ${active ? palette.ink : palette.borderMid}`,
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
                      background: active ? palette.ink : palette.paper,
                      color: active ? palette.cream : palette.ink,
                      border: `1px solid ${active ? palette.ink : palette.borderMid}`,
                    }}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upload zone */}
        <div className="mb-4">
          <SectionLabel>03 — Upload a file</SectionLabel>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => !uploadedFile && fileInputRef.current?.click()}
            style={{
              background: dragOver ? "rgba(31,58,46,0.04)" : palette.paper,
              border: `1px dashed ${dragOver ? palette.forest : palette.borderMid}`,
              borderRadius: "16px",
              padding: uploadedFile ? "16px 20px" : "32px 20px",
              cursor: uploadedFile ? "default" : "pointer",
              transition: "background 0.15s, border-color 0.15s",
            }}
          >
            {extracting ? (
              <div className="flex items-center justify-center gap-3" style={{ color: palette.ash }}>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-[13px]" style={{ fontFamily: "Inter" }}>Reading file…</span>
              </div>
            ) : uploadedFile ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(31,58,46,0.06)" }}>
                    <FileText className="w-4 h-4" style={{ color: palette.forest }} strokeWidth={1.6} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] truncate" style={{ fontFamily: "Inter", color: palette.ink, fontWeight: 500 }}>{uploadedFile.name}</div>
                    <div className="text-[12px] mt-0.5" style={{ fontFamily: "Inter", color: palette.ash }}>
                      {(uploadedFile.sizeBytes / 1024).toFixed(0)} KB · {source.length.toLocaleString()} chars extracted
                      {uploadedFile.truncated && (
                        <span style={{ color: "#9F6F3D" }}> · truncated to {MAX_CHARS.toLocaleString()} chars</span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); clearFile(); }}
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "transparent", color: palette.ash }}
                  aria-label="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "rgba(31,58,46,0.06)" }}>
                  <Upload className="w-4 h-4" style={{ color: palette.forest }} strokeWidth={1.6} />
                </div>
                <div className="text-[14px] mb-1" style={{ fontFamily: "Inter", color: palette.ink }}>
                  <span style={{ fontWeight: 500 }}>Drop a file here</span> or click to browse
                </div>
                <div className="text-[12px]" style={{ fontFamily: "Inter", color: palette.ash }}>
                  PDF or .txt · up to {Math.round(MAX_FILE_BYTES / (1024 * 1024))} MB · text-only PDFs (no OCR yet)
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.md,application/pdf,text/plain"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>
        </div>

        {/* Manual paste */}
        <div className="mb-6">
          <div className="flex justify-between items-end mb-3">
            <span className="text-[10px] uppercase" style={{ fontFamily: "Inter", fontWeight: 500, letterSpacing: "0.22em", color: palette.ash }}>
              {uploadedFile ? "Or edit the extracted text" : "Or paste text directly"}
            </span>
            <span className="text-[11px]" style={{ fontFamily: "Inter", color: source.length > MAX_CHARS ? "#B5483B" : palette.ash, letterSpacing: "0.1em" }}>
              {source.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
            </span>
          </div>
          <textarea
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder='"Section 4.3 — Surrender Charges. The Owner may surrender this Contract for its Cash Surrender Value at any time prior to the Annuity Date..."'
            className="w-full h-56 p-5 text-[14px] leading-relaxed focus:outline-none resize-none"
            style={{ ...inputStyle, fontFamily: "Inter" }}
            onFocus={(e) => { e.currentTarget.style.borderColor = palette.forest; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = palette.borderMid; }}
          />
        </div>

        <button
          onClick={decode}
          disabled={loading || source.length > MAX_CHARS}
          className="w-full py-4 mb-8 flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ background: palette.ink, color: palette.cream, borderRadius: "999px", fontFamily: "Inter", fontWeight: 500, fontSize: "12px", letterSpacing: "0.14em", textTransform: "uppercase", border: `1px solid ${palette.ink}`, cursor: loading ? "wait" : "pointer" }}
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Decoding document…</>
          ) : (
            <>Decode document <span>→</span></>
          )}
        </button>
        {error && <p className="mb-6 text-sm" style={{ color: "#B5483B", fontFamily: "Inter" }}>{error}</p>}

        <DecodedOutput output={output} loading={loading} onCopyAll={copyOutput} copied={copied} />

        <footer className="mt-16 pt-8 flex justify-between flex-wrap gap-3 text-[11px]" style={{ fontFamily: "Inter", letterSpacing: "0.18em", textTransform: "uppercase", color: palette.dust, borderTop: `1px solid ${palette.borderSubtle}` }}>
          <span>Advisor Stack — Prototype</span>
          <span>Not a substitute for compliance review · Not investment advice</span>
        </footer>
      </main>

      <FloatingMark />
    </div>
  );
}
