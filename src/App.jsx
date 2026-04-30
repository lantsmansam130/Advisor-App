import { BrowserRouter, Routes, Route } from "react-router-dom";
import StackHomePage from "./StackHomePage.jsx";
import LandingPage from "./LandingPage.jsx";
import DecoderPage from "./DecoderPage.jsx";
import AdvisorChatPage from "./AdvisorChatPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StackHomePage />} />
        <Route path="/notes" element={<LandingPage />} />
        <Route path="/app" element={<AdvisorChatPage />} />
        <Route path="/decoder" element={<DecoderPage />} />
      </Routes>
    </BrowserRouter>
  );
}
