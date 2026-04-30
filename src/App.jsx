import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import AuthGate from "./components/AuthGate.jsx";
import StackHomePage from "./StackHomePage.jsx";
import LandingPage from "./LandingPage.jsx";
import DecoderPage from "./DecoderPage.jsx";
import AdvisorChatPage from "./AdvisorChatPage.jsx";
import LoginPage from "./LoginPage.jsx";
import SignupPage from "./SignupPage.jsx";
import ForgotPasswordPage from "./ForgotPasswordPage.jsx";
import ResetPasswordPage from "./ResetPasswordPage.jsx";
import VerifyEmailPage from "./VerifyEmailPage.jsx";
import OnboardingPage from "./OnboardingPage.jsx";
import DashboardPage from "./DashboardPage.jsx";
import IntegrationsSettingsPage from "./IntegrationsSettingsPage.jsx";
import { useAuth } from "./contexts/AuthContext.jsx";

// Routes a user who hasn't yet finished the first-run flow to /onboarding.
// Wraps post-auth pages so a fresh signup can't bypass it by typing /dashboard
// in the address bar. /onboarding itself is excluded so we don't loop.
function OnboardedGate({ children }) {
  const { needsOnboarding, loading, profile } = useAuth();
  if (loading || !profile) return children; // AuthGate handles loading/error/null states
  if (needsOnboarding) return <Navigate to="/onboarding" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public marketing + tools — anonymous access kept */}
          <Route path="/" element={<StackHomePage />} />
          <Route path="/notes" element={<LandingPage />} />
          <Route path="/app" element={<AdvisorChatPage />} />
          <Route path="/decoder" element={<DecoderPage />} />

          {/* Auth (unauthenticated) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />

          {/* Authenticated — onboarding (no OnboardedGate, this IS where the gate routes) */}
          <Route path="/onboarding" element={<AuthGate><OnboardingPage /></AuthGate>} />

          {/* Authenticated — main app */}
          <Route
            path="/dashboard"
            element={<AuthGate><OnboardedGate><DashboardPage /></OnboardedGate></AuthGate>}
          />
          <Route
            path="/settings/integrations"
            element={<AuthGate><OnboardedGate><IntegrationsSettingsPage /></OnboardedGate></AuthGate>}
          />
          <Route path="/settings" element={<Navigate to="/settings/integrations" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
