// ForgotPasswordPage — request a password reset email.

import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext.jsx";
import { palette } from "./StackHomePage.jsx";
import AuthShell, {
  AuthInput, AuthPrimaryButton, AuthError, AuthInfo,
} from "./components/AuthShell.jsx";

export default function ForgotPasswordPage() {
  const { requestPasswordReset, configured } = useAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!email) {
      setFormError("Enter your account email.");
      return;
    }
    setSubmitting(true);
    const { error } = await requestPasswordReset(email);
    setSubmitting(false);
    if (error) {
      setFormError(error);
      return;
    }
    setSent(true);
  };

  return (
    <AuthShell
      eyebrow="Reset password"
      headlineItalic="Forgot"
      headlineRest="your password?"
      intro="We'll email you a link to set a new one."
      footer={
        <>
          Remembered it?{" "}
          <Link to="/login" className="no-underline" style={{ color: palette.forest, fontWeight: 500 }}>
            Sign in
          </Link>
        </>
      }
    >
      {sent ? (
        <AuthInfo>
          If an account exists for <strong>{email}</strong>, a reset link is on its way. Check your inbox (and spam folder).
        </AuthInfo>
      ) : (
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
          <div className="pt-1">
            <AuthPrimaryButton loading={submitting} disabled={!configured}>
              Send reset link
            </AuthPrimaryButton>
          </div>
          <AuthError>{formError}</AuthError>
        </form>
      )}
    </AuthShell>
  );
}
