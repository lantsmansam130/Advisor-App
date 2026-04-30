// VerifyEmailPage — shown after email/password signup. Tells the user to
// click the link in their inbox. Once they confirm, AuthContext picks up
// the verified session via onAuthStateChange and we redirect to /onboarding.

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext.jsx";
import { palette } from "./StackHomePage.jsx";
import AuthShell, {
  AuthPrimaryButton, AuthGhostButton, AuthError, AuthInfo,
} from "./components/AuthShell.jsx";

export default function VerifyEmailPage() {
  const { user, emailConfirmed, profile, needsOnboarding, resendVerificationEmail, signOut, configured } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const seedEmail = location.state?.email || user?.email || "";
  const [resendStatus, setResendStatus] = useState({ state: "idle", message: "" });

  // Once confirmed, route them onward.
  useEffect(() => {
    if (emailConfirmed && profile) {
      navigate(needsOnboarding ? "/onboarding" : "/dashboard", { replace: true });
    }
  }, [emailConfirmed, profile, needsOnboarding, navigate]);

  const onResend = async () => {
    if (!seedEmail) return;
    setResendStatus({ state: "sending", message: "" });
    const { error } = await resendVerificationEmail(seedEmail);
    if (error) {
      setResendStatus({ state: "error", message: error });
    } else {
      setResendStatus({ state: "sent", message: "Confirmation email re-sent. Check your inbox." });
    }
  };

  return (
    <AuthShell
      eyebrow="Confirm your email"
      headlineItalic="Check"
      headlineRest="your inbox."
      intro={
        seedEmail
          ? `We sent a confirmation link to ${seedEmail}. Click it to activate your account.`
          : "We sent you a confirmation link. Click it to activate your account."
      }
    >
      <div className="space-y-3">
        <AuthPrimaryButton type="button" onClick={onResend} disabled={!configured || !seedEmail || resendStatus.state === "sending"}>
          {resendStatus.state === "sending" ? "Resending…" : "Resend confirmation email"}
        </AuthPrimaryButton>
        <AuthGhostButton onClick={() => signOut().then(() => navigate("/login"))}>
          Use a different account
        </AuthGhostButton>
        {resendStatus.state === "sent" && <AuthInfo>{resendStatus.message}</AuthInfo>}
        {resendStatus.state === "error" && <AuthError>{resendStatus.message}</AuthError>}
        <p className="text-[11px] leading-snug text-center pt-2" style={{ fontFamily: "Inter", color: palette.dust }}>
          Already confirmed? This page redirects automatically once your session updates. If it doesn't, refresh.
        </p>
      </div>
    </AuthShell>
  );
}
