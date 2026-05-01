// OnboardingPage — first-run screen for newly-created accounts.
// Offers connections (Calendar / Drive / Gmail) and a "Skip for now"
// option. Either path posts to auth-complete-onboarding which sets
// users.onboarded_at and writes an audit row, then we route to /dashboard.
//
// In Phase 2 the connect buttons are placeholders ("Available soon") —
// the integrations themselves ship in Phase 3+. Skip is the only path
// that actually leaves this page right now.

import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ArrowRight, Lock } from "lucide-react";
import { useAuth } from "./contexts/AuthContext.jsx";
import { palette } from "./StackHomePage.jsx";
import { IntegrationGrid } from "./components/IntegrationCards.jsx";

export default function OnboardingPage() {
  const { user, profile, loading, needsOnboarding, completeOnboarding } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  // If they've already onboarded (returning user), don't trap them here.
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
    <div className="min-h-screen" style={{ background: palette.cream, color: palette.ink }}>
      <header className="px-8 pt-7">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: palette.ink }}>
            <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic", color: palette.cream, fontSize: "17px", lineHeight: 1, transform: "translateY(-1px)" }}>A</span>
          </div>
          <span style={{ fontFamily: "'Fraunces', Georgia, serif", color: palette.ink, fontSize: "20px", letterSpacing: "-0.01em", lineHeight: 1 }}>
            Advisor<span style={{ fontStyle: "italic" }}>Stack</span>
          </span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-8 py-12">
        <div className="mb-10 max-w-2xl">
          <div className="text-[11px] uppercase mb-3" style={{ fontFamily: "Inter", fontWeight: 500, letterSpacing: "0.22em", color: palette.ash }}>
            Welcome to Advisor Stack
          </div>
          <h1
            className="text-4xl md:text-5xl mb-4"
            style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400, lineHeight: 1.05, letterSpacing: "-0.02em", color: palette.ink }}
          >
            <span style={{ fontStyle: "italic" }}>One step</span> before you start, {firstName}.
          </h1>
          <p className="text-lg" style={{ fontFamily: "Inter", color: palette.ash, lineHeight: 1.55 }}>
            Connect the tools you already use. Read-only by default. Drafts only — we never send, post, or modify anything without your click. You can always do this later from Settings.
          </p>
        </div>

        <div className="mb-8">
          <div className="text-[11px] uppercase mb-4" style={{ fontFamily: "Inter", fontWeight: 500, letterSpacing: "0.22em", color: palette.ash }}>
            Integrations
          </div>
          <IntegrationGrid />
        </div>

        <div
          className="flex items-start gap-3 mb-10 px-4 py-3"
          style={{ background: "rgba(31,58,46,0.05)", borderRadius: "12px", border: `1px solid ${palette.borderSubtle}` }}
        >
          <Lock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: palette.forest }} strokeWidth={1.8} />
          <p className="text-[12px] leading-relaxed" style={{ fontFamily: "Inter", color: palette.ash }}>
            We request the narrowest scopes possible. Refresh tokens are encrypted at rest. Every connect, sync, and draft is written to your firm's audit log — aligned with SEC 17a-4 / FINRA 4511 expectations.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <button
            onClick={() => onContinue({ skipped: true })}
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 px-7 py-3 transition-all"
            style={{
              background: palette.ink,
              color: palette.cream,
              border: `1px solid ${palette.ink}`,
              borderRadius: "999px",
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: "13px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Working…" : "Continue to dashboard"}
            <ArrowRight className="w-4 h-4" strokeWidth={1.6} />
          </button>
          <span className="text-[12px]" style={{ fontFamily: "Inter", color: palette.ash }}>
            You can connect integrations any time from Settings → Integrations.
          </span>
        </div>
        {error && (
          <p className="mt-4 text-[12px] leading-snug" style={{ fontFamily: "Inter", color: "#B5483B" }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
