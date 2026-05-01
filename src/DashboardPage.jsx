// DashboardPage — first authenticated landing.
// Folio dashboard pattern: page-title in Fraunces, page-sub in soft ink-40,
// then card grids on the cream surface with cream-paper card surfaces.

import { Link } from "react-router-dom";
import { MessageSquare, FileText, ArrowUpRight, CalendarDays, Mail, BarChart3 } from "lucide-react";
import AppShell from "./components/AppShell.jsx";
import { useAuth } from "./contexts/AuthContext.jsx";
import { palette } from "./StackHomePage.jsx";
import { roleLabel } from "./lib/roleLabel.js";

const QUICK_TOOLS = [
  {
    to: "/app",
    title: "AdvisorNotes",
    description: "Drafts, summaries, and explanations tailored to RIA workflows. Streaming chat with file upload.",
    icon: MessageSquare,
  },
  {
    to: "/decoder",
    title: "Document Decoder",
    description: "Upload an annuity, insurance, trust, or benefits doc — get a structured plain-English breakdown.",
    icon: FileText,
  },
];

const PLANNED = [
  { title: "Meetings",      description: "Connect Google Calendar to see today's meetings + the next 14 days.", icon: CalendarDays },
  { title: "Email history", description: "Connect Gmail to summarize threads with a contact and draft (never send) replies.", icon: Mail },
  { title: "Insights",      description: "Meeting cadence, top contacts, and duration trends — pulled from your synced data.", icon: BarChart3 },
];

const SECTION_LABEL = {
  fontFamily: "'Inter', sans-serif",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.07em",
  textTransform: "uppercase",
  color: palette.ink40,
};

export default function DashboardPage() {
  const { profile, firm } = useAuth();
  const firstName = (profile?.display_name || "").split(" ")[0] || "there";

  return (
    <AppShell breadcrumb="Dashboard">
      <div className="max-w-6xl mx-auto px-7 py-8">
        {/* Welcome */}
        <div className="mb-9">
          <div className="mb-2.5" style={SECTION_LABEL}>
            {firm?.name ? `${firm.name} · ${roleLabel(profile?.role)}` : "Advisor Stack"}
          </div>
          <h1
            className="text-3xl md:text-4xl mb-3"
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontWeight: 600,
              lineHeight: 1.1,
              letterSpacing: "-0.018em",
              color: palette.ink,
            }}
          >
            Welcome back, {firstName}.
          </h1>
          <p
            className="max-w-xl"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "15px",
              lineHeight: 1.6,
              color: palette.ink60,
            }}
          >
            Your tools below. Calendar, email, and Drive integrations are coming — they'll fill the rest of this page once Phase 3 ships.
          </p>
        </div>

        {/* Available tools */}
        <div className="mb-10">
          <div className="mb-4" style={SECTION_LABEL}>Tools</div>
          <div className="grid md:grid-cols-2 gap-4">
            {QUICK_TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.to}
                  to={tool.to}
                  className="block no-underline"
                  style={{
                    background: palette.paper,
                    border: `1px solid ${palette.border}`,
                    borderRadius: "20px",
                    padding: "26px",
                    transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = palette.shadowMd;
                    e.currentTarget.style.borderColor = palette.borderStrong;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.borderColor = palette.border;
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="flex items-center justify-center"
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "14px",
                        background: palette.greenLight,
                      }}
                    >
                      <Icon className="w-4.5 h-4.5" style={{ color: palette.greenDark }} strokeWidth={1.7} />
                    </div>
                    <ArrowUpRight className="w-4 h-4" style={{ color: palette.ink40 }} strokeWidth={1.7} />
                  </div>
                  <div
                    style={{
                      fontFamily: "'Fraunces', Georgia, serif",
                      fontWeight: 600,
                      fontSize: "21px",
                      letterSpacing: "-0.01em",
                      color: palette.ink,
                      marginBottom: "8px",
                      lineHeight: 1.2,
                    }}
                  >
                    {tool.title}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "14px",
                      lineHeight: 1.6,
                      color: palette.ink60,
                    }}
                  >
                    {tool.description}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Coming next */}
        <div>
          <div className="mb-4" style={SECTION_LABEL}>Coming next</div>
          <div className="grid md:grid-cols-3 gap-4">
            {PLANNED.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  style={{
                    background: palette.paper,
                    border: `1px dashed ${palette.borderStrong}`,
                    borderRadius: "20px",
                    padding: "22px",
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="flex items-center justify-center"
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "12px",
                        background: palette.ink10,
                      }}
                    >
                      <Icon className="w-4 h-4" style={{ color: palette.ink40 }} strokeWidth={1.7} />
                    </div>
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "10.5px",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: palette.ink40,
                      }}
                    >
                      Planned
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: "'Fraunces', Georgia, serif",
                      fontWeight: 600,
                      fontSize: "17px",
                      letterSpacing: "-0.005em",
                      color: palette.ink,
                      marginBottom: "6px",
                      lineHeight: 1.25,
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "13px",
                      lineHeight: 1.6,
                      color: palette.ink60,
                    }}
                  >
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
