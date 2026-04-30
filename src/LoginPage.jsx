// LoginPage — single-action sign-in screen. Google OAuth via Supabase.
// Editorial cream aesthetic, consistent with the marketing pages.

import { Navigate, Link, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "./contexts/AuthContext.jsx";
import { palette } from "./StackHomePage.jsx";

// Inline Google "G" mark — keeps the Lucide-only constraint elsewhere.
function GoogleG({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 18 18" className={className} aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.17-1.84H9v3.49h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A8.99 8.99 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.97 10.71A5.4 5.4 0 0 1 3.68 9c0-.59.1-1.17.29-1.71V4.96H.96A8.99 8.99 0 0 0 0 9c0 1.45.35 2.83.96 4.04l3.01-2.33z"/>
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.59-2.59C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"/>
    </svg>
  );
}

export default function LoginPage() {
  const { user, loading, signInWithGoogle, error, configured } = useAuth();
  const location = useLocation();

  // Already signed in? Bounce to wherever they were headed (or /dashboard).
  if (!loading && user) {
    const dest = location.state?.from || "/dashboard";
    return <Navigate to={dest} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: palette.cream, color: palette.ink }}>
      {/* Minimal top bar — just the wordmark, linking back home */}
      <header className="px-6 pt-6">
        <Link to="/" className="inline-flex items-center gap-2 no-underline">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: palette.ink }}>
            <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", color: palette.cream, fontSize: "17px", lineHeight: 1, transform: "translateY(-1px)" }}>A</span>
          </div>
          <span style={{ fontFamily: "'Instrument Serif', serif", color: palette.ink, fontSize: "20px", letterSpacing: "-0.01em", lineHeight: 1 }}>
            Advisor<span style={{ fontStyle: "italic" }}>Stack</span>
          </span>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div
            className="px-8 py-10 text-center"
            style={{
              background: palette.paper,
              border: `1px solid ${palette.borderSubtle}`,
              borderRadius: "20px",
              boxShadow: "0 1px 2px rgba(15,14,12,0.04), 0 8px 24px -16px rgba(15,14,12,0.12)",
            }}
          >
            <div className="text-[11px] uppercase mb-4" style={{ fontFamily: "Inter", fontWeight: 500, letterSpacing: "0.22em", color: palette.ash }}>
              Sign in
            </div>
            <h1
              className="text-4xl mb-3"
              style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.02em", color: palette.ink }}
            >
              <span style={{ fontStyle: "italic" }}>Welcome</span> back.
            </h1>
            <p className="text-[14px] leading-relaxed mb-8 max-w-xs mx-auto" style={{ fontFamily: "Inter", color: palette.ash }}>
              Sign in with the Google account associated with your firm.
            </p>

            <button
              onClick={signInWithGoogle}
              disabled={loading || !configured}
              className="w-full inline-flex items-center justify-center gap-3 py-3 disabled:opacity-50 transition-all"
              style={{
                background: palette.paper,
                color: palette.ink,
                border: `1px solid ${palette.borderMid}`,
                borderRadius: "999px",
                fontFamily: "Inter",
                fontWeight: 500,
                fontSize: "14px",
                cursor: loading || !configured ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => { if (!e.currentTarget.disabled) { e.currentTarget.style.background = palette.cream; } }}
              onMouseLeave={(e) => { e.currentTarget.style.background = palette.paper; }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleG className="w-4 h-4" />}
              Continue with Google
            </button>

            {!configured && (
              <p className="mt-4 text-[12px] leading-snug" style={{ fontFamily: "Inter", color: "#9F6F3D" }}>
                Auth is not configured yet. The site administrator needs to set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in Netlify.
              </p>
            )}
            {error && (
              <p className="mt-4 text-[12px] leading-snug" style={{ fontFamily: "Inter", color: "#B5483B" }}>
                {error}
              </p>
            )}
          </div>

          <div className="mt-6 text-center text-[11px]" style={{ fontFamily: "Inter", letterSpacing: "0.14em", textTransform: "uppercase", color: palette.dust }}>
            <Link to="/" className="no-underline" style={{ color: palette.ash }}>← Back to home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
