// OnboardingPage — first-run screen for newly-created accounts.
// Folio-style cream surface, Fraunces title, green-light pill eyebrow,
// integration cards grid, green primary CTA at the bottom.

import { useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { useAuth } from "./contexts/AuthContext.jsx";
import { palette, BrandMark, PillCTA } from "./StackHomePage.jsx";
import { IntegrationGrid } from "./components/IntegrationCards.jsx";

const SECTION_LABEL = {
  fontFamily: "'Inter', sans-serif",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.07em",
  textTransform: "uppercase",
  color: palette.ink40,
};

export default function OnboardingPage() {
  const { user, profile, loading, needsOnboarding, completeOnboarding } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (profile && !needsOnboarding) return <Navigate to="/dashboard" replace />;

  const onContinue = async ({ skipped }) => {
    setSubmitting(true);
    setError("");
    const { error } = await completeOnboarding({ skipped });
    setSubmitting(false);
    if (error) {
      setError(error);
      return;
    }
    navigate("/dashboard");
  };

  const firstName = (profile?.display_name || "").split(" ")[0] || "there";

  return (
    <div className="min-h-screen" style={{ background: palette.surface, color: palette.ink }}>
      {/* Sticky translucent brand bar */}
      <header
        className="sticky top-0 z-50 px-6 md:px-8"
        style={{
          height: "68px",
          background: "rgba(250,245,238,0.85)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderBottom: `1px solid ${palette.border}`,
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* TODO: swap to AdvisorSuite portal URL when portal launches */}
        <Link to="/" className="no-underline">
          <BrandMark />
        </Link>
      </header>

      <div className="max-w-5xl mx-auto px-7 py-12">
        <div className="mb-10 max-w-2xl">
          <span
            className="inline-flex items-center mb-4"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: palette.greenDark,
              background: palette.greenLight,
              padding: "5px 14px",
              borderRadius: "100px",
            }}
          >
            Welcome to Advisor Stack
          </span>
          <h1
            className="text-3xl md:text-4xl mb-4"
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontWeight: 600,
              lineHeight: 1.1,
              letterSpacing: "-0.018em",
              color: palette.ink,
            }}
          >
            One step before you start, {firstName}.
          </h1>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "16px",
              lineHeight: 1.65,
              color: palette.ink60,
            }}
          >
            Connect the tools you already use. Read-only by default. Drafts only — we never send, post, or modify anything without your click. You can do this later from Settings.
          </p>
        </div>

        <div className="mb-8">
          <div className="mb-4" style={SECTION_LABEL}>Integrations</div>
          <IntegrationGrid />
        </div>

        <div
          className="flex items-start gap-3 mb-10 px-5 py-3.5"
          style={{
            background: palette.greenLight,
            borderRadius: "14px",
            border: `1px solid rgba(47,138,95,0.18)`,
          }}
        >
          <Lock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: palette.greenDark }} strokeWidth={1.8} />
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "12.5px",
              lineHeight: 1.6,
              color: palette.greenDark,
            }}
          >
            We request the narrowest scopes possible. Refresh tokens are encrypted at rest. Every connect, sync, and draft is written to your firm's audit log — aligned with SEC 17a-4 / FINRA 4511 expectations.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <PillCTA
            variant="primary"
            onClick={() => onContinue({ skipped: true })}
          >
            {submitting ? "Working…" : "Continue to dashboard"}
          </PillCTA>
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "13px",
              color: palette.ink60,
            }}
          >
            You can connect integrations any time from Settings → Integrations.
          </span>
        </div>
        {error && (
          <p
            className="mt-4"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "12.5px",
              lineHeight: 1.5,
              color: palette.red,
            }}
          >
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
