// AuthGate — wraps authenticated routes. While auth is loading, shows a
// minimal placeholder (no flash of public marketing nav). When unauthenticated,
// redirects to /login. When authenticated, renders children.

import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { palette } from "../StackHomePage.jsx";

export default function AuthGate({ children }) {
  const { user, profile, loading, error, configured } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: palette.cream, color: palette.ash }}>
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  if (!configured) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: palette.cream, color: palette.ink }}>
        <div className="max-w-md text-center">
          <h1 className="text-3xl mb-3" style={{ fontFamily: "'Instrument Serif', serif", color: palette.ink, lineHeight: 1.1 }}>
            <span style={{ fontStyle: "italic" }}>Auth</span> not configured
          </h1>
          <p className="text-[14px] leading-relaxed" style={{ fontFamily: "Inter", color: palette.ash }}>
            Set <code style={{ background: palette.paper, padding: "1px 5px", borderRadius: 4, border: `1px solid ${palette.borderSubtle}` }}>VITE_SUPABASE_URL</code> and <code style={{ background: palette.paper, padding: "1px 5px", borderRadius: 4, border: `1px solid ${palette.borderSubtle}` }}>VITE_SUPABASE_ANON_KEY</code> in Netlify, redeploy, and reload this page. See <code>README.md</code> → Environment variables.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Logged in but profile load failed — surface the error rather than loop.
  if (!profile && error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: palette.cream }}>
        <div className="max-w-md text-center">
          <h1 className="text-3xl mb-3" style={{ fontFamily: "'Instrument Serif', serif", color: palette.ink, lineHeight: 1.1 }}>
            Couldn't load your profile.
          </h1>
          <p className="text-[14px] leading-relaxed mb-6" style={{ fontFamily: "Inter", color: palette.ash }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  return children;
}
