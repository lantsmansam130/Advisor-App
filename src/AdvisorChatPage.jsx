import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Send, Plus, Trash2, Loader2, AlertTriangle, MessageSquare,
  Mail, ClipboardList, ShieldCheck, FileSignature, ListChecks, Compass,
  HelpCircle, BookOpen, ScrollText, MessageCircleMore,
  Paperclip, Sliders, X, RotateCw, FileText, ChevronDown, ChevronUp, Upload,
} from "lucide-react";
import { palette } from "./StackHomePage.jsx";
import { MarkdownArtifact } from "./MarkdownArtifact.jsx";
import { extractTextFromFile } from "./extractText.js";

const STORAGE_KEY = "advisornotes.chats.v1";
const SETTINGS_KEY = "advisornotes.settings.v1";
const MAX_CHATS = 50;
const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25 MB per file
const MAX_ATTACHMENT_CHARS = 30000; // ~7-8K tokens; backend trims further if needed
const MAX_ATTACHMENTS_PER_TURN = 3;

// ---------- Per-chat settings ----------

const DEFAULT_SETTINGS = {
  tone: "warm",          // "warm" | "formal" | "concise"
  length: "standard",    // "brief" | "standard" | "detailed"
  audience: "client",    // "client" | "internal" | "compliance"
  advisorName: "",
  firmName: "",
  customDisclosure: "",
};

const TONE_OPTIONS = [
  { id: "warm", label: "Warm" },
  { id: "formal", label: "Formal" },
  { id: "concise", label: "Concise" },
];
const LENGTH_OPTIONS = [
  { id: "brief", label: "Brief" },
  { id: "standard", label: "Standard" },
  { id: "detailed", label: "Detailed" },
];
const AUDIENCE_OPTIONS = [
  { id: "client", label: "Client-facing" },
  { id: "internal", label: "Internal" },
  { id: "compliance", label: "Compliance" },
];

// ---------- Quick-action follow-ups (chips on the last assistant message) ----------

const QUICK_ACTIONS = [
  { label: "Shorter", prompt: "Make this shorter — about half the length, but keep the key points and any required disclosures." },
  { label: "Warmer", prompt: "Rewrite this with a warmer, more personal tone while keeping the substance the same." },
  { label: "More formal", prompt: "Rewrite this in a more formal, professional register suitable for a high-net-worth client or a first prospect meeting." },
  { label: "Add full disclosure", prompt: "Append the standard advisory disclosure block to the end (or, if a custom disclosure is set in session preferences, use that one verbatim)." },
  { label: "Convert to CRM note", prompt: "Reformat this as a structured CRM note in Redtail / Wealthbox / Salesforce style — MEETING TYPE, ATTENDEES, KEY DISCUSSION, LIFE EVENTS, ACTION ITEMS by owner, NEXT TOUCH POINT." },
];

// ---------- Curated example prompts (financial advisor domain) ----------

const EXAMPLE_GROUPS = [
  {
    label: "Drafting",
    items: [
      {
        icon: Mail,
        title: "Recap a client meeting",
        prompt: "Draft a follow-up recap email from these meeting notes:\n\n[paste your raw notes here — fragments and shorthand are fine]\n\nKeep it warm but professional, 200 words max, with a clear next steps section and a standard disclosure line at the end.",
      },
      {
        icon: ClipboardList,
        title: "Turn rough notes into a CRM entry",
        prompt: "Convert these rough notes into a structured CRM meeting note (Redtail / Wealthbox style — headers for meeting type, attendees, key discussion, life events, action items by owner, next touch point):\n\n[paste your notes]",
      },
      {
        icon: ShieldCheck,
        title: "Suitability memo for a recommendation",
        prompt: "I just recommended [product / strategy] to [client] based on our conversation about [context]. Help me draft an internal suitability memo documenting the rationale — facts considered, alternatives evaluated, why this fits their stated objectives and risk tolerance, and what we agreed to revisit.",
      },
      {
        icon: FileSignature,
        title: "IPS update from a discussion",
        prompt: "From these meeting notes, draft the IPS sections that need to change — risk tolerance, target allocation, time horizon, liquidity needs, anything material. If a section doesn't need to change based on what was discussed, write \"No change discussed.\"\n\nNotes:\n[paste here]",
      },
    ],
  },
  {
    label: "Client communication",
    items: [
      {
        icon: MessageCircleMore,
        title: "Plain-English explainer for a client",
        prompt: "I have a client asking about [topic — e.g., \"what a Roth conversion actually is\" / \"the difference between a 401(k) rollover and an IRA transfer\" / \"why the new RMD age changes matter for them\"]. Write a short plain-English explainer I can paste into an email — no jargon, no recommendations, just the concepts. Add a closing line that we'll discuss the specifics on our next call.",
      },
      {
        icon: ScrollText,
        title: "Market downturn check-in",
        prompt: "Help me draft a brief check-in email to a client who's nervous about a recent market downturn. I want to acknowledge the volatility, reaffirm we built their plan with this in mind, avoid making any predictions or recommendations, and invite a call if they want to talk. Keep it 150 words max.",
      },
      {
        icon: ListChecks,
        title: "Internal task list from a meeting",
        prompt: "Convert these meeting notes into a structured task list — separated by Advisor / Team / Client owners, with due dates if mentioned and \"TBD\" if not. Include a \"documents to request\" section.\n\nNotes:\n[paste here]",
      },
    ],
  },
  {
    label: "Compliance & prep",
    items: [
      {
        icon: HelpCircle,
        title: "Walk me through a rule",
        prompt: "Walk me through the SEC marketing rule's testimonial requirements in 5 minutes — what qualifies as a testimonial, what disclosures are required, and the most common mistakes RIAs make under the principles-based framework. End with what to flag for our CCO if we're considering using a client testimonial.",
      },
      {
        icon: Compass,
        title: "Discovery call prep",
        prompt: "I have a discovery call tomorrow with a [age, occupation, rough net worth, situation — e.g., \"58-year-old physician planning to retire in 4 years, ~$3M in qualified accounts, mid-divorce\"]. Help me think through the key questions to ask, the topics likely to come up, and what disclosures need to be on the table given Reg BI.",
      },
      {
        icon: BookOpen,
        title: "Decode a contract section",
        prompt: "Decode this section of an [annuity contract / insurance policy / trust document] for me — what it actually says in plain English, what to watch for, and 3-5 questions I should ask the issuer or attorney before relying on it.\n\n[paste section]",
      },
    ],
  },
];

// ---------- Storage helpers ----------

function loadChats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveChats(chats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats.slice(0, MAX_CHATS)));
  } catch {
    // ignore quota errors silently
  }
}

function makeChatId() {
  return "chat_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

function deriveTitle(text) {
  const cleaned = (text || "").trim().replace(/\s+/g, " ");
  if (!cleaned) return "New chat";
  return cleaned.length > 48 ? cleaned.slice(0, 45) + "…" : cleaned;
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore quota errors
  }
}

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

// Combine typed text + extracted attachments into the single string the API consumes.
// Wrapped in <file> tags so the model can clearly distinguish source documents from
// the advisor's instructions.
function buildApiContent(typedText, attachments) {
  if (!attachments || attachments.length === 0) return typedText;
  const fileBlocks = attachments
    .map((a) => `<file name="${a.name.replace(/"/g, "'")}" size="${formatBytes(a.sizeBytes)}">\n${a.text}\n</file>`)
    .join("\n\n");
  const intro = attachments.length === 1
    ? "The advisor has attached the following document for context:"
    : `The advisor has attached the following ${attachments.length} documents for context:`;
  return `${intro}\n\n${fileBlocks}\n\n${typedText || "(No additional question — please review the attached file(s) and follow the advisor's standing preferences.)"}`;
}

// Indicator chip for whether settings differ from defaults — small breadcrumb
// shown collapsed so the advisor knows what's currently in effect.
function settingsSummary(settings) {
  const tone = TONE_OPTIONS.find((o) => o.id === settings.tone)?.label || "Warm";
  const length = LENGTH_OPTIONS.find((o) => o.id === settings.length)?.label || "Standard";
  const audience = AUDIENCE_OPTIONS.find((o) => o.id === settings.audience)?.label || "Client-facing";
  return `${tone} · ${length} · ${audience}`;
}

// ---------- SSE parser ----------

async function streamChatResponse(messages, { onText, onDone, onError, signal, settings }) {
  let response;
  try {
    response = await fetch("/.netlify/functions/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outputType: "advisor_chat", messages, settings }),
      signal,
    });
  } catch (e) {
    if (e.name !== "AbortError") onError(e.message || "Network error");
    return;
  }

  if (!response.ok) {
    let errText = `Request failed (${response.status})`;
    try {
      const err = await response.json();
      errText = err.error || errText;
    } catch {}
    onError(errText);
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const events = buffer.split("\n\n");
      buffer = events.pop() || "";

      for (const block of events) {
        const lines = block.split("\n");
        let eventType = "";
        let dataLine = "";
        for (const line of lines) {
          if (line.startsWith("event:")) eventType = line.slice(6).trim();
          else if (line.startsWith("data:")) dataLine += line.slice(5).trim();
        }
        if (!dataLine) continue;
        try {
          const data = JSON.parse(dataLine);
          if (data.type === "content_block_delta" && data.delta?.type === "text_delta") {
            onText(data.delta.text);
          } else if (data.type === "message_stop" || eventType === "message_stop") {
            onDone();
          } else if (data.type === "error") {
            onError(data.error?.message || "Stream error");
          }
        } catch {
          // ignore malformed event
        }
      }
    }
    onDone();
  } catch (e) {
    if (e.name !== "AbortError") onError(e.message || "Stream interrupted");
  }
}

// ---------- Components ----------

function AttachmentChip({ name, sizeBytes, onRemove }) {
  return (
    <span
      className="inline-flex items-center gap-2 max-w-full"
      style={{
        background: palette.cream,
        border: `1px solid ${palette.borderSubtle}`,
        borderRadius: "10px",
        padding: "6px 10px",
        fontFamily: "Inter",
        fontSize: "12px",
        color: palette.ink,
      }}
    >
      <FileText className="w-3.5 h-3.5 flex-shrink-0" style={{ color: palette.forest }} strokeWidth={1.6} />
      <span className="truncate">{name}</span>
      <span style={{ color: palette.dust }}>· {formatBytes(sizeBytes)}</span>
      {onRemove && (
        <button onClick={onRemove} aria-label="Remove attachment" style={{ color: palette.ash }}>
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </span>
  );
}

function QuickActionsRow({ onAction }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {QUICK_ACTIONS.map((qa) => (
        <button
          key={qa.label}
          onClick={() => onAction(qa.prompt)}
          className="text-[11px] uppercase transition-colors"
          style={{
            fontFamily: "Inter",
            fontWeight: 500,
            letterSpacing: "0.14em",
            padding: "6px 12px",
            background: palette.paper,
            border: `1px solid ${palette.borderSubtle}`,
            borderRadius: "999px",
            color: palette.ash,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = palette.borderMid; e.currentTarget.style.color = palette.ink; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = palette.borderSubtle; e.currentTarget.style.color = palette.ash; }}
        >
          {qa.label}
        </button>
      ))}
    </div>
  );
}

function MessageBubble({ role, content, attachments, streaming, isLast, onRegenerate, onQuickAction }) {
  const isUser = role === "user";

  // Assistant output renders as a markdown artifact card
  // (with type-aware chrome for emails + Copy/Save/Compose actions).
  if (!isUser) {
    return (
      <div className="group w-full mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: palette.ink }}>
            <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic", color: palette.cream, fontSize: "13px", lineHeight: 1, transform: "translateY(-1px)" }}>A</span>
          </div>
          <span className="text-[11px] uppercase" style={{ fontFamily: "Inter", letterSpacing: "0.16em", color: palette.ash }}>
            AdvisorNotes
          </span>
          {streaming && (
            <span className="text-[11px]" style={{ fontFamily: "Inter", color: palette.dust, fontStyle: "italic" }}>
              drafting…
            </span>
          )}
        </div>
        {content || streaming ? (
          <MarkdownArtifact content={content} streaming={streaming} />
        ) : null}
        {/* Quick actions + regenerate appear only on the last completed assistant message */}
        {isLast && !streaming && content && (
          <>
            <QuickActionsRow onAction={onQuickAction} />
            <button
              onClick={onRegenerate}
              className="mt-2 inline-flex items-center gap-1.5 text-[11px] uppercase"
              style={{ fontFamily: "Inter", letterSpacing: "0.16em", color: palette.ash }}
              onMouseEnter={(e) => { e.currentTarget.style.color = palette.ink; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = palette.ash; }}
            >
              <RotateCw className="w-3 h-3" strokeWidth={1.8} />
              Regenerate
            </button>
          </>
        )}
      </div>
    );
  }

  // User messages — plain bubble + optional attachment chips above it
  return (
    <div className="group w-full flex justify-end mb-5">
      <div className="max-w-[78%] flex flex-col items-end gap-2">
        {attachments && attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-end">
            {attachments.map((a, i) => (
              <AttachmentChip key={i} name={a.name} sizeBytes={a.sizeBytes} />
            ))}
          </div>
        )}
        {content && (
          <div
            className="text-[15px] leading-relaxed px-4 py-3"
            style={{
              fontFamily: "Inter",
              color: palette.ink,
              background: palette.paper,
              border: `1px solid ${palette.borderSubtle}`,
              borderRadius: "16px",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {content}
          </div>
        )}
      </div>
    </div>
  );
}

function ExamplePromptCard({ icon: Icon, title, prompt, onClick }) {
  return (
    <button
      onClick={() => onClick(prompt)}
      className="text-left transition-all"
      style={{
        background: palette.paper,
        border: `1px solid ${palette.borderSubtle}`,
        borderRadius: "16px",
        padding: "18px",
        boxShadow: "0 1px 2px rgba(15,14,12,0.04)",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = palette.borderMid; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 2px 4px rgba(15,14,12,0.06), 0 8px 16px -10px rgba(15,14,12,0.12)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = palette.borderSubtle; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 2px rgba(15,14,12,0.04)"; }}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(31,58,46,0.06)" }}>
          <Icon className="w-4 h-4" style={{ color: palette.forest }} strokeWidth={1.6} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] mb-1" style={{ fontFamily: "'Fraunces', Georgia, serif", color: palette.ink, letterSpacing: "-0.005em" }}>
            {title}
          </div>
          <div className="text-[13px] leading-snug line-clamp-2" style={{ fontFamily: "Inter", color: palette.ash }}>
            {prompt.split("\n")[0].replace(/\[.*?\]/g, "…").slice(0, 120)}
          </div>
        </div>
      </div>
    </button>
  );
}

function PillToggle({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            style={{
              padding: "6px 14px",
              fontFamily: "Inter",
              fontSize: "12px",
              fontWeight: 500,
              borderRadius: "999px",
              background: active ? palette.ink : palette.cream,
              color: active ? palette.cream : palette.ink,
              border: `1px solid ${active ? palette.ink : palette.borderMid}`,
              transition: "all 0.15s",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function SettingsBar({ open, onToggle, settings, onChange }) {
  const update = (patch) => onChange({ ...settings, ...patch });
  return (
    <div
      style={{
        background: palette.paper,
        border: `1px solid ${palette.borderSubtle}`,
        borderRadius: "16px",
        boxShadow: "0 1px 2px rgba(15,14,12,0.04)",
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2.5"
        style={{ borderRadius: "16px" }}
      >
        <div className="flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5" style={{ color: palette.forest }} strokeWidth={1.8} />
          <span className="text-[11px] uppercase" style={{ fontFamily: "Inter", fontWeight: 500, letterSpacing: "0.18em", color: palette.ash }}>
            Response settings
          </span>
          <span className="text-[12px]" style={{ fontFamily: "Inter", color: palette.dust }}>
            · {settingsSummary(settings)}
            {settings.customDisclosure ? " · custom disclosure" : ""}
          </span>
        </div>
        {open ? <ChevronUp className="w-4 h-4" style={{ color: palette.ash }} /> : <ChevronDown className="w-4 h-4" style={{ color: palette.ash }} />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 grid md:grid-cols-3 gap-x-5 gap-y-4" style={{ borderTop: `1px solid ${palette.borderSubtle}` }}>
          <div>
            <div className="text-[10px] uppercase mb-2 mt-3" style={{ fontFamily: "Inter", fontWeight: 500, letterSpacing: "0.18em", color: palette.dust }}>Tone</div>
            <PillToggle options={TONE_OPTIONS} value={settings.tone} onChange={(v) => update({ tone: v })} />
          </div>
          <div>
            <div className="text-[10px] uppercase mb-2 mt-3" style={{ fontFamily: "Inter", fontWeight: 500, letterSpacing: "0.18em", color: palette.dust }}>Length</div>
            <PillToggle options={LENGTH_OPTIONS} value={settings.length} onChange={(v) => update({ length: v })} />
          </div>
          <div>
            <div className="text-[10px] uppercase mb-2 mt-3" style={{ fontFamily: "Inter", fontWeight: 500, letterSpacing: "0.18em", color: palette.dust }}>Audience</div>
            <PillToggle options={AUDIENCE_OPTIONS} value={settings.audience} onChange={(v) => update({ audience: v })} />
          </div>
          <div>
            <div className="text-[10px] uppercase mb-2" style={{ fontFamily: "Inter", fontWeight: 500, letterSpacing: "0.18em", color: palette.dust }}>Advisor name</div>
            <input
              type="text"
              value={settings.advisorName}
              onChange={(e) => update({ advisorName: e.target.value })}
              placeholder="e.g. Sarah Patel, CFP"
              className="w-full focus:outline-none"
              style={{
                padding: "8px 12px",
                fontFamily: "Inter",
                fontSize: "13px",
                color: palette.ink,
                background: palette.cream,
                border: `1px solid ${palette.borderSubtle}`,
                borderRadius: "10px",
              }}
            />
          </div>
          <div>
            <div className="text-[10px] uppercase mb-2" style={{ fontFamily: "Inter", fontWeight: 500, letterSpacing: "0.18em", color: palette.dust }}>Firm name</div>
            <input
              type="text"
              value={settings.firmName}
              onChange={(e) => update({ firmName: e.target.value })}
              placeholder="e.g. Northbridge Wealth Advisors"
              className="w-full focus:outline-none"
              style={{
                padding: "8px 12px",
                fontFamily: "Inter",
                fontSize: "13px",
                color: palette.ink,
                background: palette.cream,
                border: `1px solid ${palette.borderSubtle}`,
                borderRadius: "10px",
              }}
            />
          </div>
          <div className="md:col-span-3">
            <div className="text-[10px] uppercase mb-2" style={{ fontFamily: "Inter", fontWeight: 500, letterSpacing: "0.18em", color: palette.dust }}>
              Custom disclosure (used verbatim on client-facing drafts)
            </div>
            <textarea
              value={settings.customDisclosure}
              onChange={(e) => update({ customDisclosure: e.target.value })}
              placeholder="Paste your firm's required disclosure language. Leave empty to use the standard one."
              rows={3}
              className="w-full focus:outline-none resize-y"
              style={{
                padding: "10px 12px",
                fontFamily: "Inter",
                fontSize: "13px",
                lineHeight: 1.5,
                color: palette.ink,
                background: palette.cream,
                border: `1px solid ${palette.borderSubtle}`,
                borderRadius: "10px",
                maxHeight: "180px",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarSectionLabel({ children }) {
  return (
    <div
      className="text-[10px] uppercase mb-2 px-3"
      style={{ fontFamily: "Inter", fontWeight: 500, letterSpacing: "0.2em", color: palette.dust }}
    >
      {children}
    </div>
  );
}

// ---------- Main page ----------

export default function AdvisorChatPage() {
  const [chats, setChats] = useState(() => loadChats());
  const [activeId, setActiveId] = useState(() => {
    const stored = loadChats();
    return stored[0]?.id || null;
  });
  const [input, setInput] = useState("");
  const [streamingId, setStreamingId] = useState(null);
  const [error, setError] = useState("");

  // Settings — workspace-level defaults persisted to localStorage. Each chat snapshots
  // the current settings into its own object on creation, so changing settings later
  // doesn't retroactively rewrite history (and so settings can be tuned per-chat).
  const [defaultSettings, setDefaultSettings] = useState(() => loadSettings());
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Pending attachments — files staged for the next send, displayed as chips above the composer.
  const [pendingAttachments, setPendingAttachments] = useState([]);
  const [extracting, setExtracting] = useState(false);

  // Drag-over UI state (entire chat area becomes a drop zone)
  const [dragActive, setDragActive] = useState(false);
  const dragCounterRef = useRef(0);

  const abortRef = useRef(null);
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const activeChat = useMemo(() => chats.find((c) => c.id === activeId) || null, [chats, activeId]);
  const messages = activeChat?.messages || [];
  // Active chat's settings (or workspace defaults if no active chat yet)
  const currentSettings = activeChat?.settings || defaultSettings;

  useEffect(() => { saveChats(chats); }, [chats]);
  useEffect(() => { saveSettings(defaultSettings); }, [defaultSettings]);

  // Auto-scroll to bottom on new messages or while streaming
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, streamingId, activeId]);

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 220) + "px";
  }, [input]);

  function newChat() {
    if (streamingId && abortRef.current) abortRef.current.abort();
    setActiveId(null);
    setInput("");
    setError("");
    setStreamingId(null);
    setPendingAttachments([]);
  }

  function selectChat(id) {
    if (streamingId && abortRef.current) abortRef.current.abort();
    setStreamingId(null);
    setActiveId(id);
    setError("");
    setPendingAttachments([]);
  }

  function deleteChat(id, e) {
    e.stopPropagation();
    setChats((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) setActiveId(null);
  }

  // Update settings on the active chat (or workspace default if no active chat)
  function updateSettings(next) {
    if (activeChat) {
      setChats((prev) => prev.map((c) => c.id === activeChat.id ? { ...c, settings: next } : c));
    } else {
      setDefaultSettings(next);
    }
  }

  // ----- File upload helpers -----

  async function ingestFile(file) {
    if (!file) return;
    setError("");
    if (file.size > MAX_FILE_BYTES) {
      setError(`File too large. Maximum size is ${Math.round(MAX_FILE_BYTES / (1024 * 1024))} MB.`);
      return;
    }
    if (pendingAttachments.length >= MAX_ATTACHMENTS_PER_TURN) {
      setError(`You can attach up to ${MAX_ATTACHMENTS_PER_TURN} files per message.`);
      return;
    }
    setExtracting(true);
    try {
      const text = await extractTextFromFile(file);
      if (!text.trim()) {
        setError("No text could be extracted from this file. Scanned PDFs without OCR aren't supported — paste the text instead.");
        return;
      }
      const trimmed = text.length > MAX_ATTACHMENT_CHARS ? text.slice(0, MAX_ATTACHMENT_CHARS) : text;
      const att = {
        name: file.name,
        sizeBytes: file.size,
        text: trimmed,
        truncated: text.length > MAX_ATTACHMENT_CHARS,
      };
      setPendingAttachments((prev) => [...prev, att]);
    } catch (e) {
      setError(e.message || "Could not read this file.");
    } finally {
      setExtracting(false);
    }
  }

  async function handleFileSelect(e) {
    const files = Array.from(e.target.files || []);
    for (const f of files) {
      if (pendingAttachments.length + files.indexOf(f) >= MAX_ATTACHMENTS_PER_TURN) break;
      // sequential to avoid slamming pdfjs and to keep error states clean
      // eslint-disable-next-line no-await-in-loop
      await ingestFile(f);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removePendingAttachment(idx) {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== idx));
  }

  // Page-level drag handlers — turn the whole chat area into a drop zone.
  const onDragEnter = useCallback((e) => {
    if (!e.dataTransfer?.types?.includes("Files")) return;
    e.preventDefault();
    dragCounterRef.current += 1;
    setDragActive(true);
  }, []);
  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
    if (dragCounterRef.current === 0) setDragActive(false);
  }, []);
  const onDragOver = useCallback((e) => {
    if (!e.dataTransfer?.types?.includes("Files")) return;
    e.preventDefault();
  }, []);
  const onDrop = useCallback(async (e) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files || []);
    for (const f of files) {
      if (pendingAttachments.length + files.indexOf(f) >= MAX_ATTACHMENTS_PER_TURN) break;
      // eslint-disable-next-line no-await-in-loop
      await ingestFile(f);
    }
  }, [pendingAttachments.length]);

  // ----- Core sending logic -----

  // Internal: actually performs the API call given a fully-built message history.
  function runStream(chatId, fullMessages, settings) {
    const controller = new AbortController();
    abortRef.current = controller;
    setStreamingId(chatId);

    const apiMessages = fullMessages.map((m) => ({
      role: m.role,
      content: buildApiContent(m.content, m.attachments),
    }));

    streamChatResponse(apiMessages, {
      signal: controller.signal,
      settings,
      onText: (delta) => {
        setChats((prev) =>
          prev.map((c) => {
            if (c.id !== chatId) return c;
            const msgs = c.messages.slice();
            const last = msgs[msgs.length - 1];
            if (last && last.role === "assistant") {
              msgs[msgs.length - 1] = { ...last, content: last.content + delta };
            }
            return { ...c, messages: msgs, updatedAt: Date.now() };
          })
        );
      },
      onDone: () => {
        setStreamingId(null);
        abortRef.current = null;
      },
      onError: (msg) => {
        setError(msg);
        setStreamingId(null);
        abortRef.current = null;
        setChats((prev) =>
          prev.map((c) => {
            if (c.id !== chatId) return c;
            const msgs = c.messages.slice();
            const last = msgs[msgs.length - 1];
            if (last && last.role === "assistant" && last.content === "") {
              msgs.pop();
            }
            return { ...c, messages: msgs };
          })
        );
      },
    });
  }

  function sendMessage(text, opts = {}) {
    const content = (text || "").trim();
    const attachments = opts.attachments ?? pendingAttachments;
    // Need either text or at least one attachment to send.
    if ((!content && attachments.length === 0) || streamingId) return;
    setError("");

    // Locate or create chat
    let chatId = activeId;
    let chatList = chats;
    let history = [];
    let settings = currentSettings;

    if (!chatId || !chatList.find((c) => c.id === chatId)) {
      chatId = makeChatId();
      const seedSettings = { ...defaultSettings };
      const created = {
        id: chatId,
        title: deriveTitle(content || (attachments[0]?.name) || "New chat"),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        settings: seedSettings,
        messages: [],
      };
      chatList = [created, ...chatList];
      settings = seedSettings;
      setActiveId(chatId);
    } else {
      const existing = chatList.find((c) => c.id === chatId);
      history = existing.messages;
      settings = existing.settings || defaultSettings;
    }

    const userMsg = {
      role: "user",
      content,
      ts: Date.now(),
      attachments: attachments.length > 0 ? attachments : undefined,
    };
    const assistantMsg = { role: "assistant", content: "", ts: Date.now() };
    const updatedMessages = [...history, userMsg, assistantMsg];

    chatList = chatList.map((c) =>
      c.id === chatId
        ? { ...c, messages: updatedMessages, updatedAt: Date.now(), title: c.messages.length === 0 ? deriveTitle(content || attachments[0]?.name || "New chat") : c.title }
        : c
    );
    setChats(chatList);
    setInput("");
    setPendingAttachments([]);

    // Build the message history that will be sent. The new state hasn't propagated yet,
    // so use the locally-built sequence.
    runStream(chatId, [...history, userMsg], settings);
  }

  // Quick-action: send a follow-up user message (no attachments)
  function handleQuickAction(promptText) {
    if (streamingId) return;
    sendMessage(promptText, { attachments: [] });
  }

  // Regenerate: drop the last assistant message and re-run from the prior user message.
  function regenerate() {
    if (streamingId || !activeChat) return;
    const msgs = activeChat.messages;
    if (msgs.length < 2) return;
    const last = msgs[msgs.length - 1];
    if (last.role !== "assistant") return;

    // Trim the last assistant message and replace with an empty placeholder
    const trimmedHistory = msgs.slice(0, -1);
    const newAssistant = { role: "assistant", content: "", ts: Date.now() };
    const updatedMessages = [...trimmedHistory, newAssistant];

    setChats((prev) => prev.map((c) =>
      c.id === activeChat.id
        ? { ...c, messages: updatedMessages, updatedAt: Date.now() }
        : c
    ));
    setError("");

    runStream(activeChat.id, trimmedHistory, currentSettings);
  }

  function stopStreaming() {
    if (abortRef.current) abortRef.current.abort();
    setStreamingId(null);
    abortRef.current = null;
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div
      className="h-screen flex relative"
      style={{ background: palette.cream, color: palette.ink }}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Inline keyframes for cursor blink */}
      <style>{`
        @keyframes blink { 0%, 100% { opacity: 0.6 } 50% { opacity: 0 } }
      `}</style>

      {/* Drag-and-drop overlay */}
      {dragActive && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
          style={{
            background: "rgba(31,58,46,0.06)",
            border: `2px dashed ${palette.forest}`,
            borderRadius: "12px",
            margin: "12px",
          }}
        >
          <div className="text-center px-6 py-8" style={{ background: palette.paper, border: `1px solid ${palette.borderSubtle}`, borderRadius: "20px", boxShadow: "0 12px 30px -10px rgba(15,14,12,0.18)" }}>
            <Upload className="w-8 h-8 mx-auto mb-3" style={{ color: palette.forest }} strokeWidth={1.6} />
            <div className="text-[18px] mb-1" style={{ fontFamily: "'Fraunces', Georgia, serif", color: palette.ink }}>
              Drop to attach
            </div>
            <div className="text-[12px]" style={{ fontFamily: "Inter", color: palette.ash }}>
              PDF or .txt · up to {Math.round(MAX_FILE_BYTES / (1024 * 1024))} MB · {MAX_ATTACHMENTS_PER_TURN} files max per message
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside
        className="hidden md:flex flex-col flex-shrink-0"
        style={{
          width: "280px",
          background: palette.paper,
          borderRight: `1px solid ${palette.borderSubtle}`,
        }}
      >
        {/* Sidebar header */}
        <div className="p-4">
          <Link to="/" className="flex items-center gap-2 no-underline mb-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: palette.ink }}>
              <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic", color: palette.cream, fontSize: "17px", lineHeight: 1, transform: "translateY(-1px)" }}>A</span>
            </div>
            <span style={{ fontFamily: "'Fraunces', Georgia, serif", color: palette.ink, fontSize: "20px", letterSpacing: "-0.01em", lineHeight: 1 }}>
              Advisor<span style={{ fontStyle: "italic" }}>Notes</span>
            </span>
          </Link>
          <button
            onClick={newChat}
            className="w-full flex items-center gap-2 px-4 py-2.5 transition-all"
            style={{
              background: palette.ink,
              color: palette.cream,
              borderRadius: "999px",
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: "12px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              border: `1px solid ${palette.ink}`,
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            New chat
          </button>
        </div>

        {/* Scrollable middle */}
        <div className="flex-1 overflow-y-auto pb-3">
          {/* Example prompts */}
          <div className="mb-5">
            <SidebarSectionLabel>Try asking</SidebarSectionLabel>
            <div className="px-2">
              {EXAMPLE_GROUPS.flatMap((g) => g.items).slice(0, 4).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.title}
                    onClick={() => sendMessage(item.prompt)}
                    className="w-full text-left px-2 py-2 mb-0.5 transition-colors flex items-center gap-2"
                    style={{ borderRadius: "10px", color: palette.ink }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = palette.cream; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: palette.forest }} strokeWidth={1.6} />
                    <span className="text-[13px] truncate" style={{ fontFamily: "Inter", color: palette.ink }}>
                      {item.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recent chats */}
          <div>
            <SidebarSectionLabel>Recent</SidebarSectionLabel>
            <div className="px-2">
              {chats.length === 0 && (
                <div className="px-2 py-2 text-[12px]" style={{ fontFamily: "Inter", color: palette.dust, fontStyle: "italic" }}>
                  No chats yet.
                </div>
              )}
              {chats.map((c) => {
                const isActive = c.id === activeId;
                return (
                  <div
                    key={c.id}
                    onClick={() => selectChat(c.id)}
                    className="w-full px-2 py-2 mb-0.5 flex items-center gap-2 cursor-pointer group transition-colors"
                    style={{
                      borderRadius: "10px",
                      background: isActive ? palette.cream : "transparent",
                    }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = palette.cream; }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                  >
                    <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" style={{ color: palette.ash }} strokeWidth={1.6} />
                    <span className="text-[13px] truncate flex-1" style={{ fontFamily: "Inter", color: palette.ink }}>
                      {c.title}
                    </span>
                    <button
                      onClick={(e) => deleteChat(c.id, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: palette.ash }}
                      aria-label="Delete chat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar footer */}
        <div className="p-4" style={{ borderTop: `1px solid ${palette.borderSubtle}` }}>
          <Link
            to="/"
            className="text-[11px] uppercase no-underline"
            style={{ fontFamily: "Inter", letterSpacing: "0.18em", color: palette.ash }}
          >
            ← All tools
          </Link>
          <div className="mt-2 text-[10px] leading-snug" style={{ fontFamily: "Inter", color: palette.dust }}>
            Drafts only · Always advisor-reviewed · Never a recommendation
          </div>
        </div>
      </aside>

      {/* MAIN PANE */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile header (sidebar hidden on small screens) */}
        <div className="md:hidden flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${palette.borderSubtle}`, background: palette.paper }}>
          <Link to="/" className="flex items-center gap-2 no-underline">
            <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: palette.ink }}>
              <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic", color: palette.cream, fontSize: "15px", lineHeight: 1, transform: "translateY(-1px)" }}>A</span>
            </div>
            <span style={{ fontFamily: "'Fraunces', Georgia, serif", color: palette.ink, fontSize: "18px", letterSpacing: "-0.01em", lineHeight: 1 }}>
              Advisor<span style={{ fontStyle: "italic" }}>Notes</span>
            </span>
          </Link>
          <button
            onClick={newChat}
            className="text-[11px] uppercase"
            style={{ fontFamily: "Inter", letterSpacing: "0.14em", color: palette.ink }}
          >
            New chat
          </button>
        </div>

        {/* Messages or empty state */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="max-w-3xl mx-auto px-6 pt-16 pb-12">
              <div className="text-center mb-12">
                <div className="inline-block mb-5" style={{ background: "rgba(31,58,46,0.08)", color: palette.forest, fontFamily: "Inter", fontWeight: 500, fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", borderRadius: "999px", padding: "8px 18px", border: `1px solid ${palette.borderSubtle}` }}>
                  Compliance-first AI for advisors
                </div>
                <h1 className="text-4xl md:text-6xl mb-4" style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400, lineHeight: 1.05, letterSpacing: "-0.02em", color: palette.ink }}>
                  <span style={{ fontStyle: "italic" }}>How</span> can I help today?
                </h1>
                <p className="max-w-xl mx-auto text-[15px]" style={{ fontFamily: "Inter", color: palette.ash, lineHeight: 1.55 }}>
                  Drafts, summaries, and explanations tailored to RIA workflows. Pick a starting point or just type below.
                </p>
              </div>

              {/* Compliance reminder */}
              <div className="mb-10 p-4 flex gap-3 items-start" style={{ background: "rgba(212,165,116,0.10)", border: "1px solid rgba(212,165,116,0.35)", borderRadius: "14px" }}>
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#9F6F3D" }} />
                <p className="text-[13px] leading-relaxed" style={{ fontFamily: "Inter", color: "#5C3F1E" }}>
                  Drafts only — review before sending or filing. Outputs may be electronic communications under SEC 17a-4 / FINRA 4511.
                </p>
              </div>

              {EXAMPLE_GROUPS.map((group) => (
                <div key={group.label} className="mb-8">
                  <div className="text-[11px] uppercase mb-3" style={{ fontFamily: "Inter", fontWeight: 500, letterSpacing: "0.2em", color: palette.ash }}>
                    {group.label}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {group.items.map((item) => (
                      <ExamplePromptCard
                        key={item.title}
                        icon={item.icon}
                        title={item.title}
                        prompt={item.prompt}
                        onClick={(p) => { setInput(p); textareaRef.current?.focus(); }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-6 pt-8 pb-8">
              {messages.map((m, idx) => {
                const isLastAssistant = idx === messages.length - 1 && m.role === "assistant";
                return (
                  <MessageBubble
                    key={idx}
                    role={m.role}
                    content={m.content}
                    attachments={m.attachments}
                    streaming={streamingId === activeId && isLastAssistant}
                    isLast={isLastAssistant}
                    onRegenerate={regenerate}
                    onQuickAction={handleQuickAction}
                  />
                );
              })}
              {error && (
                <div className="my-4 p-3 text-[13px]" style={{ background: "rgba(181,72,59,0.08)", border: "1px solid rgba(181,72,59,0.3)", borderRadius: "12px", color: "#7A2F26", fontFamily: "Inter" }}>
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="px-4 pb-4 md:px-6 md:pb-6" style={{ background: palette.cream }}>
          <div className="max-w-3xl mx-auto space-y-3">
            {/* Settings bar (collapsible) */}
            <SettingsBar
              open={settingsOpen}
              onToggle={() => setSettingsOpen((v) => !v)}
              settings={currentSettings}
              onChange={updateSettings}
            />

            {/* Pending attachments (above the textarea) */}
            {(pendingAttachments.length > 0 || extracting) && (
              <div className="flex flex-wrap gap-2 items-center">
                {pendingAttachments.map((a, i) => (
                  <AttachmentChip
                    key={i}
                    name={a.name}
                    sizeBytes={a.sizeBytes}
                    onRemove={() => removePendingAttachment(i)}
                  />
                ))}
                {extracting && (
                  <span className="inline-flex items-center gap-2 text-[12px]" style={{ fontFamily: "Inter", color: palette.ash }}>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Reading file…
                  </span>
                )}
              </div>
            )}

            {/* Composer box */}
            <div
              className="flex items-end gap-2 px-3 py-2"
              style={{
                background: palette.paper,
                border: `1px solid ${palette.borderMid}`,
                borderRadius: "20px",
                boxShadow: "0 1px 2px rgba(15,14,12,0.04), 0 8px 24px -16px rgba(15,14,12,0.12)",
              }}
            >
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={extracting || pendingAttachments.length >= MAX_ATTACHMENTS_PER_TURN}
                className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ color: palette.ash }}
                aria-label="Attach file"
                title="Attach a PDF, .txt, or .md file"
                onMouseEnter={(e) => { if (!e.currentTarget.disabled) { e.currentTarget.style.color = palette.ink; e.currentTarget.style.background = palette.cream; } }}
                onMouseLeave={(e) => { e.currentTarget.style.color = palette.ash; e.currentTarget.style.background = "transparent"; }}
              >
                <Paperclip className="w-4 h-4" strokeWidth={1.8} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.txt,.md,application/pdf,text/plain"
                className="hidden"
                onChange={handleFileSelect}
              />
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask AdvisorNotes anything — paste raw notes, attach a contract, ask about a rule…"
                rows={1}
                className="flex-1 resize-none focus:outline-none px-2 py-2 text-[15px] leading-relaxed"
                style={{
                  fontFamily: "Inter",
                  color: palette.ink,
                  background: "transparent",
                  maxHeight: "220px",
                }}
              />
              {streamingId ? (
                <button
                  onClick={stopStreaming}
                  className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: palette.ink, color: palette.cream }}
                  aria-label="Stop"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                </button>
              ) : (
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() && pendingAttachments.length === 0}
                  className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
                  style={{ background: palette.ink, color: palette.cream }}
                  aria-label="Send"
                >
                  <Send className="w-4 h-4" strokeWidth={2} />
                </button>
              )}
            </div>
            <div className="mt-2 px-2 flex justify-between items-center text-[11px]" style={{ fontFamily: "Inter", color: palette.dust }}>
              <span>Enter to send · Shift+Enter for newline · drag a file anywhere to attach</span>
              <span className="hidden md:inline">Drafts only · Always advisor-reviewed · Never a recommendation</span>
            </div>
          </div>
        </div>
      </main>

      {/* No floating mark on chat — sidebar serves the navigation role */}
    </div>
  );
}
