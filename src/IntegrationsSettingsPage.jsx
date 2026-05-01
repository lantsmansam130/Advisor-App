// IntegrationsSettingsPage — `/settings/integrations`. Always-on home for
// the connect cards, accessible from the sidebar after the user has
// finished (or skipped) onboarding.

import AppShell from "./components/AppShell.jsx";
import { palette } from "./StackHomePage.jsx";
import { IntegrationGrid } from "./components/IntegrationCards.jsx";

const SECTION_LABEL = {
  fontFamily: "'Inter', sans-serif",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.07em",
  textTransform: "uppercase",
  color: palette.ink40,
};

export default function IntegrationsSettingsPage() {
  return (
    <AppShell breadcrumb="Integrations">
      <div className="max-w-5xl mx-auto px-7 py-8">
        <div className="mb-8">
          <div className="mb-2.5" style={SECTION_LABEL}>Settings · Integrations</div>
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
            Connect your tools.
          </h1>
          <p
            className="max-w-2xl"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "15px",
              lineHeight: 1.6,
              color: palette.ink60,
            }}
          >
            Read-only by default. Drafts only. Refresh tokens encrypted at rest. Every connect, sync, and draft is audit-logged for your firm.
          </p>
        </div>

        <IntegrationGrid />

        <div
          className="mt-8 px-5 py-4 max-w-3xl"
          style={{
            background: palette.paper,
            border: `1px solid ${palette.border}`,
            borderRadius: "14px",
          }}
        >
          <div className="mb-1.5" style={SECTION_LABEL}>Coming soon</div>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "13px",
              lineHeight: 1.6,
              color: palette.ink60,
            }}
          >
            Connections roll out one phase at a time so each one ships with a complete audit trail and clear consent UX. You'll see them flip from "Available soon" to "Connect" as they go live.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
