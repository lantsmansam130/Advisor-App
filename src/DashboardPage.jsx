// DashboardPage — first authenticated landing. Phase 1 ships an empty-shell
// dashboard: a personalized welcome and tile shortcuts to the existing tools.
// Phase 2 will populate this with calendar widgets ("Today's meetings",
// "This week").

import { Link } from "react-router-dom";
import { MessageSquare, FileText, ArrowUpRight, CalendarDays, Mail, BarChart3 } from "lucide-react";
import AppShell from "./components/AppShell.jsx";
import { useAuth } from "./contexts/AuthContext.jsx";
import { palette } from "./StackHomePage.jsx";

const QUICK_TOOLS = [
  {
    to: "/app",
    title: "AdvisorNotes",
    italic: "AdvisorNotes",
    rest: "",
    description: "Drafts, summaries, and explanations tailored to RIA workflows. Streaming chat with file upload.",
    icon: MessageSquare,
    available: true,
  },
  {
    to: "/decoder",
    title: "Document Decoder",
    italic: "Decode",
    rest: " the fine print.",
    description: "Upload an annuity, insurance, trust, or benefits doc — get a structured plain-English breakdown.",
    icon: FileText,
    available: true,
  },
];

const PLANNED = [
  { title: "Meetings", description: "Connect Google Calendar to see today's meetings + the next 14 days.", icon: CalendarDays },
  { title: "Email history", description: "Connect Gmail to summarize threads with a contact and draft (never send) replies.", icon: Mail },
  { title: "Insights", description: "Meeting cadence, top contacts, and duration trends — pulled from your synced data.", icon: BarChart3 },
];

export default function DashboardPage() {
  const { profile, firm } = useAuth();
  const firstName = (profile?.display_name || "").split(" ")[0] || "there";

  return (
    <AppShell breadcrumb="Dashboard">
      <div className="max-w-6xl mx-auto px-8 py-10">
        {/* Welcome */}
        <div className="mb-10">
          <div className="text-[11px] uppercase mb-3" style={{ fontFamily: "Inter", fontWeight: 500, letterSpacing: "0.22em", color: palette.ash }}>
            {firm?.name ? `${firm.name} · ${profile?.role}` : "Advisor Stack"}
          </div>
          <h1
            className="text-4xl md:text-5xl mb-3"
            style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, lineHeight: 1.05, letterSpacing: "-0.02em", color: palette.ink }}
          >
            <span style={{ fontStyle: "italic" }}>Welcome</span> back, {firstName}.
          </h1>
          <p className="text-lg max-w-xl" style={{ fontFamily: "Inter", color: palette.ash, lineHeight: 1.55 }}>
            Your tools below. Calendar, email, and Drive integrations are landing in the next phases — they'll fill the rest of this page.
          </p>
        </div>

        {/* Available tools */}
        <div className="mb-12">
          <div className="text-[11px] uppercase mb-4" style={{ fontFamily: "Inter", fontWeight: 500, letterSpacing: "0.22em", color: palette.ash }}>
            Tools
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {QUICK_TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.to}
                  to={tool.to}
                  className="block no-underline group"
                  style={{
                    background: palette.paper,
                    border: `1px solid ${palette.borderSubtle}`,
                    borderRadius: "20px",
                    padding: "28px",
                    boxShadow: "0 1px 2px rgba(15,14,12,0.04), 0 8px 24px -16px rgba(15,14,12,0.12)",
                    transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = palette.borderMid; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 2px 4px rgba(15,14,12,0.06), 0 16px 32px -16px rgba(15,14,12,0.18)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = palette.borderSubtle; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 2px rgba(15,14,12,0.04), 0 8px 24px -16px rgba(15,14,12,0.12)"; }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(31,58,46,0.06)" }}>
                      <Icon className="w-4 h-4" style={{ color: palette.forest }} strokeWidth={1.6} />
                    </div>
                    <ArrowUpRight className="w-4 h-4" style={{ color: palette.ash }} strokeWidth={1.6} />
                  </div>
                  <div className="text-2xl mb-2" style={{ fontFamily: "'Instrument Serif', serif", color: palette.ink, letterSpacing: "-0.01em" }}>
                    <span style={{ fontStyle: "italic" }}>{tool.italic}</span>{tool.rest}
                  </div>
                  <div className="text-[14px] leading-relaxed" style={{ fontFamily: "Inter", color: palette.ash }}>
                    {tool.description}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Coming next */}
        <div>
          <div className="text-[11px] uppercase mb-4" style={{ fontFamily: "Inter", fontWeight: 500, letterSpacing: "0.22em", color: palette.ash }}>
            Coming next
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {PLANNED.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  style={{
                    background: palette.paper,
                    border: `1px dashed ${palette.borderMid}`,
                    borderRadius: "20px",
                    padding: "22px",
                    opacity: 0.85,
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(15,14,12,0.04)" }}>
                      <Icon className="w-4 h-4" style={{ color: palette.dust }} strokeWidth={1.6} />
                    </div>
                    <span className="text-[10px] uppercase" style={{ fontFamily: "Inter", letterSpacing: "0.18em", color: palette.dust }}>
                      Planned
                    </span>
                  </div>
                  <div className="text-lg mb-1" style={{ fontFamily: "'Instrument Serif', serif", color: palette.ink, letterSpacing: "-0.005em" }}>
                    {item.title}
                  </div>
                  <div className="text-[13px] leading-relaxed" style={{ fontFamily: "Inter", color: palette.ash }}>
                    {item.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
