import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import AuthGate from "./components/AuthGate.jsx";
import StackHomePage from "./StackHomePage.jsx";
import LandingPage from "./LandingPage.jsx";
import DecoderPage from "./DecoderPage.jsx";
import AdvisorChatPage from "./AdvisorChatPage.jsx";
import LoginPage from "./LoginPage.jsx";
import DashboardPage from "./DashboardPage.jsx";

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

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />

          {/* Authenticated */}
          <Route path="/dashboard" element={<AuthGate><DashboardPage /></AuthGate>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
