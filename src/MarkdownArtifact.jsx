import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check, Mail, FileText, Download, ExternalLink } from "lucide-react";
import { palette } from "./StackHomePage.jsx";

// ---------- Markdown components (styled to match the design system) ----------

const mdComponents = {
  h1: ({ children }) => (
    <h1 className="text-2xl mt-6 mb-3 first:mt-0" style={{ fontFamily: "'Instrument Serif', serif", color: palette.ink, letterSpacing: "-0.01em", fontWeight: 400 }}>
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl mt-5 mb-3 first:mt-0" style={{ fontFamily: "'Instrument Serif', serif", color: palette.ink, letterSpacing: "-0.01em", fontWeight: 400 }}>
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base mt-5 mb-2 first:mt-0 uppercase" style={{ fontFamily: "Inter", fontWeight: 600, letterSpacing: "0.08em", color: palette.ash }}>
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-[15px] leading-relaxed mb-3 last:mb-0" style={{ fontFamily: "Inter", color: palette.ink }}>
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="text-[15px] leading-relaxed mb-3 last:mb-0 pl-5 list-disc marker:text-[color:var(--mk-marker)]" style={{ fontFamily: "Inter", color: palette.ink, "--mk-marker": palette.dust }}>
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="text-[15px] leading-relaxed mb-3 last:mb-0 pl-5 list-decimal marker:text-[color:var(--mk-marker)]" style={{ fontFamily: "Inter", color: palette.ink, "--mk-marker": palette.dust }}>
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="mb-1.5 last:mb-0">{children}</li>
  ),
  // GFM task list items render as <li> with <input type="checkbox">. Render the box ourselves.
  input: ({ type, checked, ...rest }) => {
    if (type !== "checkbox") return <input type={type} {...rest} />;
    return (
      <span
        className="inline-flex items-center justify-center w-4 h-4 mr-2 align-text-bottom"
        style={{
          border: `1.5px solid ${checked ? palette.forest : palette.borderMid}`,
          background: checked ? palette.forest : palette.paper,
          borderRadius: "4px",
          color: palette.cream,
          flexShrink: 0,
          transform: "translateY(1px)",
        }}
      >
        {checked && <Check className="w-3 h-3" strokeWidth={3} />}
      </span>
    );
  },
  blockquote: ({ children }) => (
    <blockquote
      className="my-4 pl-4 italic text-[15px] leading-relaxed"
      style={{ fontFamily: "'Instrument Serif', serif", color: palette.ash, borderLeft: `2px solid ${palette.borderMid}` }}
    >
      {children}
    </blockquote>
  ),
  strong: ({ children }) => (
    <strong style={{ fontWeight: 600, color: palette.ink }}>{children}</strong>
  ),
  em: ({ children }) => (
    <em style={{ fontStyle: "italic" }}>{children}</em>
  ),
  hr: () => (
    <hr className="my-6" style={{ border: 0, borderTop: `1px solid ${palette.borderSubtle}` }} />
  ),
  code: ({ inline, className, children, ...rest }) => {
    if (inline) {
      return (
        <code
          className="px-1.5 py-0.5 text-[13px]"
          style={{
            fontFamily: "'SF Mono', 'Menlo', 'Consolas', monospace",
            background: palette.cream,
            border: `1px solid ${palette.borderSubtle}`,
            borderRadius: "4px",
            color: palette.ink,
          }}
          {...rest}
        >
          {children}
        </code>
      );
    }
    return <code className={className} {...rest}>{children}</code>;
  },
  pre: ({ children }) => (
    <pre
      className="my-3 p-4 overflow-x-auto text-[13px] leading-relaxed"
      style={{
        fontFamily: "'SF Mono', 'Menlo', 'Consolas', monospace",
        background: palette.cream,
        border: `1px solid ${palette.borderSubtle}`,
        borderRadius: "12px",
        color: palette.ink,
      }}
    >
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto" style={{ border: `1px solid ${palette.borderSubtle}`, borderRadius: "12px" }}>
      <table className="w-full text-[14px]" style={{ fontFamily: "Inter", color: palette.ink, borderCollapse: "collapse" }}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead style={{ background: palette.cream, borderBottom: `1px solid ${palette.borderSubtle}` }}>
      {children}
    </thead>
  ),
  th: ({ children }) => (
    <th className="px-3 py-2 text-left text-[12px] uppercase" style={{ fontFamily: "Inter", fontWeight: 500, letterSpacing: "0.08em", color: palette.ash }}>
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2" style={{ borderTop: `1px solid ${palette.borderSubtle}` }}>
      {children}
    </td>
  ),
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noreferrer" style={{ color: palette.forest, textDecoration: "underline" }}>
      {children}
    </a>
  ),
};

// ---------- Output type detection ----------

// Heuristic: emails lead with **Subject:** or "Subject:" (within first ~250 chars)
const SUBJECT_LINE_RE = /^\s*(?:\*\*\s*)?subject\s*:\s*(?:\*\*\s*)?(.+)/im;

export function detectOutputType(content) {
  if (!content) return { type: "draft" };
  const head = content.slice(0, 300);
  const m = head.match(SUBJECT_LINE_RE);
  if (m) {
    return { type: "email", subject: m[1].trim().replace(/\*+$/, "").trim() };
  }
  return { type: "draft" };
}

// ---------- The shared artifact card ----------

function ActionButton({ icon: Icon, label, onClick, success }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] uppercase transition-colors"
      style={{
        fontFamily: "Inter",
        fontWeight: 500,
        letterSpacing: "0.14em",
        color: success ? palette.forest : palette.ash,
        background: "transparent",
        border: `1px solid ${palette.borderSubtle}`,
        borderRadius: "999px",
      }}
      onMouseEnter={(e) => { if (!success) { e.currentTarget.style.borderColor = palette.borderMid; e.currentTarget.style.color = palette.ink; } }}
      onMouseLeave={(e) => { if (!success) { e.currentTarget.style.borderColor = palette.borderSubtle; e.currentTarget.style.color = palette.ash; } }}
    >
      <Icon className="w-3 h-3" strokeWidth={1.8} />
      {label}
    </button>
  );
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Strip leading "Subject:" line so it isn't repeated in the body
function stripSubjectLine(content) {
  return content.replace(SUBJECT_LINE_RE, "").replace(/^\s*\n+/, "");
}

/**
 * Render a piece of model output as an artifact card.
 * Detects "email" outputs and renders Subject as a header chrome.
 * Everything else renders as a generic "Draft" card.
 *
 * Pass streaming=true while content is still being written to skip the
 * action buttons (they'd flicker as the type detection changes mid-stream).
 */
export function MarkdownArtifact({ content, streaming = false, label }) {
  const [copied, setCopied] = useState(false);
  const detection = useMemo(() => detectOutputType(content), [content]);

  const isEmail = detection.type === "email";
  const headerLabel = label || (isEmail ? "Email draft" : "Draft");
  const HeaderIcon = isEmail ? Mail : FileText;

  const bodyContent = isEmail ? stripSubjectLine(content) : content;

  const onCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const onDownload = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    const baseName = isEmail
      ? `email-${stamp}.txt`
      : `draft-${stamp}.txt`;
    downloadText(baseName, content);
  };

  const onCompose = () => {
    if (!isEmail) return;
    const subject = encodeURIComponent(detection.subject || "");
    const body = encodeURIComponent(bodyContent);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div
      className="my-1"
      style={{
        background: palette.paper,
        border: `1px solid ${palette.borderSubtle}`,
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 1px 2px rgba(15,14,12,0.04)",
      }}
    >
      {/* Header chrome */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ background: palette.cream, borderBottom: `1px solid ${palette.borderSubtle}` }}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <HeaderIcon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: palette.forest }} strokeWidth={1.8} />
          <span className="text-[10px] uppercase flex-shrink-0" style={{ fontFamily: "Inter", fontWeight: 500, letterSpacing: "0.18em", color: palette.ash }}>
            {headerLabel}
          </span>
          {isEmail && detection.subject && !streaming && (
            <>
              <span className="text-[10px]" style={{ color: palette.dust }}>·</span>
              <span className="text-[12px] truncate" style={{ fontFamily: "Inter", color: palette.ink, fontWeight: 500 }}>
                {detection.subject}
              </span>
            </>
          )}
        </div>
        {!streaming && content && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {isEmail && (
              <ActionButton icon={ExternalLink} label="Compose" onClick={onCompose} />
            )}
            <ActionButton icon={Download} label="Save" onClick={onDownload} />
            <ActionButton icon={copied ? Check : Copy} label={copied ? "Copied" : "Copy"} onClick={onCopy} success={copied} />
          </div>
        )}
      </div>

      {/* Email subject as a "field" row, when detected */}
      {isEmail && detection.subject && (
        <div className="px-5 pt-4 pb-1">
          <div className="text-[11px] uppercase mb-1" style={{ fontFamily: "Inter", fontWeight: 500, letterSpacing: "0.18em", color: palette.ash }}>
            Subject
          </div>
          <div className="text-[16px] mb-3" style={{ fontFamily: "'Instrument Serif', serif", color: palette.ink, letterSpacing: "-0.005em" }}>
            {detection.subject}
          </div>
          <div style={{ borderTop: `1px solid ${palette.borderSubtle}` }} />
        </div>
      )}

      {/* Body */}
      <div className="px-5 py-4">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
          {bodyContent || ""}
        </ReactMarkdown>
        {streaming && (
          <span style={{ display: "inline-block", width: "8px", height: "16px", marginLeft: "2px", background: palette.ink, opacity: 0.6, verticalAlign: "text-bottom", animation: "blink 1s step-end infinite" }} />
        )}
      </div>
    </div>
  );
}

// ---------- Standalone markdown renderer (no artifact chrome) ----------

export function MarkdownContent({ content }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
      {content || ""}
    </ReactMarkdown>
  );
}
