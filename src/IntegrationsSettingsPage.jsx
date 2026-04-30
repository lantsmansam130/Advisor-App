// IntegrationsSettingsPage — `/settings/integrations`. Always-on home for
// the connect cards, accessible from the sidebar after the user has
// finished (or skipped) onboarding.

import AppShell from "./components/AppShell.jsx";
import { palette } from "./StackHomePage.jsx";
import { IntegrationGrid } from "./components/IntegrationCards.jsx";

export default function IntegrationsSettingsPage() {
  return (
    <AppShell breadcrumb="Integrations">
      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="mb-8">
          <div className="text-[11px] uppercase mb-3" style={{ fontFamily: "Inter", fontWeight: 500, letterSpacing: "0.22em", color: palette.ash }}>
            Settings · Integrations
          </div>
          <h1
            className="text-4xl mb-3"
            style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, lineHeight: 1.05, letterSpacing: "-0.02em", color: palette.ink }}
          >
            <span style={{ fontStyle: "italic" }}>Connect</span> your tools.
          </h1>
          <p className="text-lg max-w-2xl" style={{ fontFamily: "Inter", color: palette.ash, lineHeight: 1.55 }}>
            Read-only by default. Drafts only. Refresh tokens encrypted at rest. Every connect, sync, and draft is audit-logged for your firm.
          </p>
        </div>

        <IntegrationGrid />

        <div
          className="mt-8 px-5 py-4 max-w-3xl"
          style={{ background: palette.paper, border: `1px solid ${palette.borderSubtle}`, borderRadius: "14px" }}
        >
          <div className="text-[11px] uppercase mb-1.5" style={{ fontFamily: "Inter", fontWeight: 500, letterSpacing: "0.18em", color: palette.dust }}>
            Coming soon
          </div>
          <p className="text-[13px] leading-relaxed" style={{ fontFamily: "Inter", color: palette.ash }}>
            Connections roll out one phase at a time so each one ships with a complete audit trail and clear consent UX. You'll see them flip from "Available soon" to "Connect" as they go live.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
