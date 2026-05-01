// IntegrationCards — single source of truth for the integration tiles
// shown on /onboarding and /settings/integrations. Folio card pattern:
// cream surface, 20px radius, 14px-radius green-light icon tile, Fraunces
// title, sentence-case description, pill connect button. Placeholders use
// a dashed border + an "Available soon" pill.

import { CalendarDays, HardDrive, Mail } from "lucide-react";
import { palette } from "../StackHomePage.jsx";

export const INTEGRATIONS = [
  {
    id: "google_calendar",
    title: "Google Calendar",
    description: "See today's meetings and the next 14 days inside Advisor Stack. Read-only — we never modify your calendar.",
    icon: CalendarDays,
    status: "available_soon", // flip to "available" when Phase 3 ships
    phase: "Coming soon",
  },
  {
    id: "google_drive",
    title: "Google Drive",
    description: "Pick documents from Drive to decode without downloading them first. Narrow scope: only files you select.",
    icon: HardDrive,
    status: "available_soon",
    phase: "Coming soon",
  },
  {
    id: "gmail",
    title: "Gmail",
    description: "Summarize threads with a contact and save AI drafts to Gmail. Drafts only — we never send.",
    icon: Mail,
    status: "available_soon",
    phase: "Coming soon",
  },
];

export function IntegrationCard({ integration, dense = false }) {
  const Icon = integration.icon;
  const isPlaceholder = integration.status !== "available";

  return (
    <div
      className="flex flex-col h-full"
      style={{
        background: palette.paper,
        border: isPlaceholder
          ? `1px dashed ${palette.borderStrong}`
          : `1px solid ${palette.border}`,
        borderRadius: "20px",
        padding: dense ? "20px" : "26px",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
      }}
      onMouseEnter={(e) => {
        if (!isPlaceholder) {
          e.currentTarget.style.transform = "translateY(-3px)";
          e.currentTarget.style.boxShadow = palette.shadowMd;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="flex items-center justify-center"
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "14px",
            background: isPlaceholder ? palette.ink10 : palette.greenLight,
          }}
        >
          <Icon
            className="w-4 h-4"
            strokeWidth={1.7}
            style={{ color: isPlaceholder ? palette.ink40 : palette.greenDark }}
          />
        </div>
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "10.5px",
            fontWeight: 700,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            color: palette.ink40,
          }}
        >
          {isPlaceholder ? integration.phase : "Connect"}
        </span>
      </div>
      <div
        style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontWeight: 600,
          fontSize: "19px",
          letterSpacing: "-0.005em",
          color: palette.ink,
          marginBottom: "8px",
          lineHeight: 1.25,
        }}
      >
        {integration.title}
      </div>
      <div
        className="flex-1"
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "13px",
          lineHeight: 1.6,
          color: palette.ink60,
          marginBottom: "20px",
        }}
      >
        {integration.description}
      </div>
      {isPlaceholder ? (
        <button
          disabled
          className="w-full"
          style={{
            background: "transparent",
            color: palette.ink40,
            border: `1.5px solid ${palette.border}`,
            borderRadius: "999px",
            padding: "10px 16px",
            fontFamily: "'Inter', sans-serif",
            fontSize: "12.5px",
            fontWeight: 600,
            letterSpacing: "-0.005em",
            cursor: "not-allowed",
          }}
        >
          Available soon
        </button>
      ) : (
        <button
          className="w-full transition-all"
          style={{
            background: palette.green,
            color: "#fff",
            border: `1.5px solid ${palette.green}`,
            borderRadius: "999px",
            padding: "10px 16px",
            fontFamily: "'Inter', sans-serif",
            fontSize: "12.5px",
            fontWeight: 600,
            letterSpacing: "-0.005em",
            boxShadow: "0 4px 14px rgba(47,138,95,0.22)",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = palette.greenDark; e.currentTarget.style.borderColor = palette.greenDark; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = palette.green; e.currentTarget.style.borderColor = palette.green; }}
        >
          Connect
        </button>
      )}
    </div>
  );
}

export function IntegrationGrid({ dense = false }) {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {INTEGRATIONS.map((it) => (
        <IntegrationCard key={it.id} integration={it} dense={dense} />
      ))}
    </div>
  );
}
