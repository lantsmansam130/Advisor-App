// IntegrationCards — single source of truth for the integration tiles
// shown on /onboarding and /settings/integrations.
//
// Phase 2: every card is a placeholder with a "Available soon" state.
// Phase 3 wires up Google Calendar (it'll flip to a real Connect flow);
// later phases wire up Gmail and Drive. To do that, replace the
// placeholder branch on the matching card with a real button + handler.

import { CalendarDays, HardDrive, Mail } from "lucide-react";
import { palette } from "../StackHomePage.jsx";

export const INTEGRATIONS = [
  {
    id: "google_calendar",
    title: "Google Calendar",
    description: "See today's meetings and the next 14 days inside Advisor Stack. Read-only — we never modify your calendar.",
    icon: CalendarDays,
    status: "available_soon", // flip to "available" when Phase 3 ships
    phase: "Phase 3",
  },
  {
    id: "google_drive",
    title: "Google Drive",
    description: "Pick documents from Drive to decode without downloading them first. Narrow scope: only files you select.",
    icon: HardDrive,
    status: "available_soon",
    phase: "Phase 5",
  },
  {
    id: "gmail",
    title: "Gmail",
    description: "Summarize threads with a contact and save AI drafts to Gmail. Drafts only — we never send.",
    icon: Mail,
    status: "available_soon",
    phase: "Phase 4",
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
        border: isPlaceholder ? `1px dashed ${palette.borderMid}` : `1px solid ${palette.borderSubtle}`,
        borderRadius: "20px",
        padding: dense ? "20px" : "26px",
        opacity: isPlaceholder ? 0.92 : 1,
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: isPlaceholder ? "rgba(15,14,12,0.04)" : "rgba(31,58,46,0.06)" }}
        >
          <Icon className="w-4 h-4" style={{ color: isPlaceholder ? palette.dust : palette.forest }} strokeWidth={1.6} />
        </div>
        <span className="text-[10px] uppercase" style={{ fontFamily: "Inter", letterSpacing: "0.18em", color: palette.dust }}>
          {isPlaceholder ? integration.phase : "Connect"}
        </span>
      </div>
      <div className="text-xl mb-2" style={{ fontFamily: "'Fraunces', Georgia, serif", color: palette.ink, letterSpacing: "-0.005em" }}>
        {integration.title}
      </div>
      <div className="text-[13px] leading-relaxed mb-4 flex-1" style={{ fontFamily: "Inter", color: palette.ash }}>
        {integration.description}
      </div>
      {isPlaceholder ? (
        <button
          disabled
          className="w-full py-2.5"
          style={{
            background: "transparent",
            color: palette.dust,
            border: `1px solid ${palette.borderSubtle}`,
            borderRadius: "999px",
            fontFamily: "Inter",
            fontWeight: 500,
            fontSize: "12px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            cursor: "not-allowed",
          }}
        >
          Available soon
        </button>
      ) : (
        // Connect handler will be added when each phase wires this up.
        <button
          className="w-full py-2.5 transition-all"
          style={{
            background: palette.ink,
            color: palette.cream,
            border: `1px solid ${palette.ink}`,
            borderRadius: "999px",
            fontFamily: "Inter",
            fontWeight: 500,
            fontSize: "12px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
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
