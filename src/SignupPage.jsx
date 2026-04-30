// SignupPage — create a new account with email/password or Google.
// On email/password signup, Supabase sends a confirmation email and we
// route the user to /verify-email. Once they confirm, AuthContext picks
// up the verified session and bootstraps their firm.

import { useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext.jsx";
import { palette } from "./StackHomePage.jsx";
import AuthShell, {
  AuthInput, AuthPrimaryButton, AuthGhostButton, AuthDivider, AuthError, GoogleG,
} from "./components/AuthShell.jsx";

export default function SignupPage() {
  const { user, loading, signInWithGoogle, signUpWithEmail, configured } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!email || !password || !confirm || !name) {
      setFormError("Please fill in every field.");
      return;
    }
    if (password.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setFormError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    const { error, needsConfirmation } = await signUpWithEmail(email, password, name);
    setSubmitting(false);
    if (error) {
      setFormError(error);
      return;
    }
    if (needsConfirmation) {
      navigate("/verify-email", { state: { email } });
    } else {
      // Rare path: email confirmation disabled in Supabase. Session is live;
      // AuthContext will bootstrap and route. Send to dashboard.
      navigate("/dashboard");
    }
  };

  return (
    <AuthShell
      eyebrow="Create account"
      headlineItalic="Start"
      headlineRest="with Advisor Stack."
      intro="Drafts only — every output is advisor-reviewed. Compliance-first by design."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="no-underline" style={{ color: palette.forest, fontWeight: 500 }}>
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-3">
        <AuthInput
          label="Your name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          required
          autoFocus
          placeholder="Jane Advisor"
        />
        <AuthInput
          label="Work email"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          placeholder="you@firm.com"
        />
        <AuthInput
          label="Password"
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
          placeholder="At least 8 characters"
        />
        <AuthInput
          label="Confirm password"
          type="password"
          name="confirm"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          required
          placeholder="Re-enter password"
        />
        <div className="pt-1">
          <AuthPrimaryButton loading={submitting} disabled={!configured}>
            Create account
          </AuthPrimaryButton>
        </div>
        <p className="text-[11px] leading-snug text-center" style={{ fontFamily: "Inter", color: palette.dust }}>
          We'll email a confirmation link before your account is active.
        </p>
        <AuthError>{formError}</AuthError>
      </form>

      <AuthDivider />

      <AuthGhostButton onClick={signInWithGoogle} disabled={!configured || submitting}>
        <GoogleG className="w-4 h-4" />
        Continue with Google
      </AuthGhostButton>
    </AuthShell>
  );
}
