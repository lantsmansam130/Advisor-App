import { useEffect, useRef, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Send, Plus, Trash2, Loader2, AlertTriangle, MessageSquare,
  Mail, ClipboardList, ShieldCheck, FileSignature, ListChecks, Compass,
  HelpCircle, BookOpen, ScrollText, MessageCircleMore,
} from "lucide-react";
import { palette } from "./StackHomePage.jsx";
import { MarkdownArtifact } from "./MarkdownArtifact.jsx";

const STORAGE_KEY = "advisornotes.chats.v1";
const MAX_CHATS = 50;

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

// ---------- SSE parser ----------

async function streamChatResponse(messages, { onText, onDone, onError, signal }) {
  let response;
  try {
    response = await fetch("/.netlify/functions/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outputType: "advisor_chat", messages }),
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

function MessageBubble({ role, content, streaming }) {
  const isUser = role === "user";

  // User messages stay as plain bubbles. Assistant output renders as a markdown artifact card
  // (with type-aware chrome for emails + Copy/Save/Compose actions).
  if (!isUser) {
    return (
      <div className="group w-full mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: palette.ink }}>
            <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", color: palette.cream, fontSize: "13px", lineHeight: 1, transform: "translateY(-1px)" }}>A</span>
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
      </div>
    );
  }

  return (
    <div className="group w-full flex justify-end mb-5">
      <div className="max-w-[78%]">
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
          <div className="text-[15px] mb-1" style={{ fontFamily: "'Instrument Serif', serif", color: palette.ink, letterSpacing: "-0.005em" }}>
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
  const abortRef = useRef(null);
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  const activeChat = useMemo(() => chats.find((c) => c.id === activeId) || null, [chats, activeId]);
  const messages = activeChat?.messages || [];

  useEffect(() => { saveChats(chats); }, [chats]);

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
  }

  function selectChat(id) {
    if (streamingId && abortRef.current) abortRef.current.abort();
    setStreamingId(null);
    setActiveId(id);
    setError("");
  }

  function deleteChat(id, e) {
    e.stopPropagation();
    setChats((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) setActiveId(null);
  }

  function sendMessage(text) {
    const content = (text || "").trim();
    if (!content || streamingId) return;
    setError("");

    // Locate or create chat
    let chatId = activeId;
    let chatList = chats;
    let history = [];

    if (!chatId || !chatList.find((c) => c.id === chatId)) {
      chatId = makeChatId();
      const newChat = {
        id: chatId,
        title: deriveTitle(content),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
      };
      chatList = [newChat, ...chatList];
      setActiveId(chatId);
    } else {
      history = chatList.find((c) => c.id === chatId).messages;
    }

    const userMsg = { role: "user", content, ts: Date.now() };
    const assistantMsg = { role: "assistant", content: "", ts: Date.now() };
    const updatedMessages = [...history, userMsg, assistantMsg];

    chatList = chatList.map((c) =>
      c.id === chatId
        ? { ...c, messages: updatedMessages, updatedAt: Date.now(), title: c.messages.length === 0 ? deriveTitle(content) : c.title }
        : c
    );
    setChats(chatList);
    setInput("");
    setStreamingId(chatId);

    const controller = new AbortController();
    abortRef.current = controller;

    const apiMessages = [...history, userMsg].map((m) => ({ role: m.role, content: m.content }));

    streamChatResponse(apiMessages, {
      signal: controller.signal,
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
        // Drop the empty assistant placeholder if nothing came back
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
    <div className="h-screen flex" style={{ background: palette.cream, color: palette.ink }}>
      {/* Inline keyframes for cursor blink */}
      <style>{`
        @keyframes blink { 0%, 100% { opacity: 0.6 } 50% { opacity: 0 } }
      `}</style>

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
              <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", color: palette.cream, fontSize: "17px", lineHeight: 1, transform: "translateY(-1px)" }}>A</span>
            </div>
            <span style={{ fontFamily: "'Instrument Serif', serif", color: palette.ink, fontSize: "20px", letterSpacing: "-0.01em", lineHeight: 1 }}>
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
              <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", color: palette.cream, fontSize: "15px", lineHeight: 1, transform: "translateY(-1px)" }}>A</span>
            </div>
            <span style={{ fontFamily: "'Instrument Serif', serif", color: palette.ink, fontSize: "18px", letterSpacing: "-0.01em", lineHeight: 1 }}>
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
                <h1 className="text-4xl md:text-6xl mb-4" style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, lineHeight: 1.05, letterSpacing: "-0.02em", color: palette.ink }}>
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
              {messages.map((m, idx) => (
                <MessageBubble
                  key={idx}
                  role={m.role}
                  content={m.content}
                  streaming={streamingId === activeId && idx === messages.length - 1 && m.role === "assistant"}
                />
              ))}
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
          <div className="max-w-3xl mx-auto">
            <div
              className="flex items-end gap-2 px-3 py-2"
              style={{
                background: palette.paper,
                border: `1px solid ${palette.borderMid}`,
                borderRadius: "20px",
                boxShadow: "0 1px 2px rgba(15,14,12,0.04), 0 8px 24px -16px rgba(15,14,12,0.12)",
              }}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask AdvisorNotes anything — paste raw notes, ask about a rule, draft a memo…"
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
                  disabled={!input.trim()}
                  className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
                  style={{ background: palette.ink, color: palette.cream }}
                  aria-label="Send"
                >
                  <Send className="w-4 h-4" strokeWidth={2} />
                </button>
              )}
            </div>
            <div className="mt-2 px-2 flex justify-between items-center text-[11px]" style={{ fontFamily: "Inter", color: palette.dust }}>
              <span>Enter to send · Shift+Enter for newline</span>
              <span className="hidden md:inline">Drafts only · Always advisor-reviewed · Never a recommendation</span>
            </div>
          </div>
        </div>
      </main>

      {/* No floating mark on chat — sidebar serves the navigation role */}
    </div>
  );
}
