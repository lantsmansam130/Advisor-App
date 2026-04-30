// ResetPasswordPage — landing for the password-reset email link.
// Supabase places a recovery token in the URL hash and `detectSessionInUrl`
// (in src/lib/supabase.js) consumes it, leaving the user in a transient
// "PASSWORD_RECOVERY" session. We then call updateUser({ password }) to
// complete the reset.

import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext.jsx";
import { palette } from "./StackHomePage.jsx";
import AuthShell, {
  AuthInput, AuthPrimaryButton, AuthError, AuthInfo,
} from "./components/AuthShell.jsx";
import { supabase } from "./lib/supabase.js";

export default function ResetPasswordPage() {
  const { updatePassword, configured } = useAuth();
  const navigate = useNavigate();

  const [recoveryReady, setRecoveryReady] = useState(false);
  const [recoveryFailed, setRecoveryFailed] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setRecoveryReady(true);
    });
    // Also check existing session — landing here from a fresh tab will already have it.
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (data.session) setRecoveryReady(true);
      else {
        // Wait briefly for detectSessionInUrl to finish parsing the hash.
        setTimeout(() => {
          supabase.auth.getSession().then(({ data: data2 }) => {
            if (cancelled) return;
            if (data2.session) setRecoveryReady(true);
            else setRecoveryFailed(true);
          });
        }, 1200);
      }
    });
    return () => { cancelled = true; sub?.subscription?.unsubscribe?.(); };
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (password.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setFormError("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    const { error } = await updatePassword(password);
    setSubmitting(false);
    if (error) {
      setFormError(error);
      return;
    }
    setDone(true);
    setTimeout(() => navigate("/dashboard"), 1500);
  };

  if (done) {
    return (
      <AuthShell eyebrow="Reset password" headlineItalic="Password" headlineRest="updated.">
        <AuthInfo>You're signed in. Taking you to your dashboard…</AuthInfo>
      </AuthShell>
    );
  }

  if (recoveryFailed) {
    return (
      <AuthShell eyebrow="Reset password" headlineItalic="Link" headlineRest="expired.">
        <AuthInfo>That reset link is no longer valid. Request a fresh one.</AuthInfo>
        <div className="mt-5">
          <AuthPrimaryButton type="button" onClick={() => navigate("/forgot-password")}>
            Request new link
          </AuthPrimaryButton>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Reset password"
      headlineItalic="Set"
      headlineRest="a new password."
      intro="Choose a password you don't use anywhere else."
    >
      <form onSubmit={onSubmit} className="space-y-3">
        <AuthInput
          label="New password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
          autoFocus
          placeholder="At least 8 characters"
        />
        <AuthInput
          label="Confirm password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          required
          placeholder="Re-enter password"
        />
        <div className="pt-1">
          <AuthPrimaryButton loading={submitting} disabled={!configured || !recoveryReady}>
            Update password
          </AuthPrimaryButton>
        </div>
        {!recoveryReady && (
          <p className="text-[12px] text-center" style={{ fontFamily: "Inter", color: palette.dust }}>
            Verifying your reset link…
          </p>
        )}
        <AuthError>{formError}</AuthError>
      </form>
    </AuthShell>
  );
}
