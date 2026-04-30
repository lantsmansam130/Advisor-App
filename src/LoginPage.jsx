// LoginPage — email/password sign-in + Google OAuth.
// Returning users land here. New users see /signup.

import { useState } from "react";
import { Navigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext.jsx";
import { palette } from "./StackHomePage.jsx";
import AuthShell, {
  AuthInput, AuthPrimaryButton, AuthGhostButton, AuthDivider, AuthError, GoogleG,
} from "./components/AuthShell.jsx";

export default function LoginPage() {
  const { user, loading, signInWithGoogle, signInWithEmail, error: globalError, configured } = useAuth();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  if (!loading && user) {
    const dest = location.state?.from || "/dashboard";
    return <Navigate to={dest} replace />;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!email || !password) {
      setFormError("Enter your email and password.");
      return;
    }
    setSubmitting(true);
    const { error } = await signInWithEmail(email, password);
    setSubmitting(false);
    if (error) setFormError(error);
    // On success, AuthContext updates session → component re-renders → Navigate redirect runs.
  };

  return (
    <AuthShell
      eyebrow="Sign in"
      headlineItalic="Welcome"
      headlineRest="back."
      intro="Use the email tied to your firm, or continue with Google."
      footer={
        <>
          New here?{" "}
          <Link to="/signup" className="no-underline" style={{ color: palette.forest, fontWeight: 500 }}>
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-3">
        <AuthInput
          label="Email"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          autoFocus
          placeholder="you@firm.com"
        />
        <AuthInput
          label="Password"
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          placeholder="••••••••"
        />
        <div className="text-right">
          <Link to="/forgot-password" className="text-[12px] no-underline" style={{ fontFamily: "Inter", color: palette.ash }}>
            Forgot password?
          </Link>
        </div>
        <div className="pt-1">
          <AuthPrimaryButton loading={submitting} disabled={!configured}>
            Sign in
          </AuthPrimaryButton>
        </div>
        <AuthError>{formError || (globalError && !user ? globalError : "")}</AuthError>
      </form>

      <AuthDivider />

      <AuthGhostButton onClick={signInWithGoogle} disabled={!configured || submitting}>
        <GoogleG className="w-4 h-4" />
        Continue with Google
      </AuthGhostButton>

      {!configured && (
        <p className="mt-4 text-[12px] leading-snug text-center" style={{ fontFamily: "Inter", color: "#9F6F3D" }}>
          Auth is not configured yet. Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in Netlify.
        </p>
      )}
    </AuthShell>
  );
}
