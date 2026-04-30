import { useEffect, useRef, useState } from "react";
import { Mail, ClipboardList, ShieldCheck, FileSignature, Send } from "lucide-react";
import { StackNav, FloatingMark, PillCTA, SectionLabel, EditorialHeading, darkCard, inkBlock, skyBadge, palette } from "./StackHomePage.jsx";

function useFadeIn() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setVisible(true)),
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function FadeSection({ children, className = "", style = {}, id }) {
  const [ref, visible] = useFadeIn();
  return (
    <section ref={ref} id={id} className={className} style={{ ...style, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)", transition: "opacity 0.7s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1)" }}>
      {children}
    </section>
  );
}

// ---------- Product preview: a styled snapshot of the chat UI ----------

function ChatPreview() {
  return (
    <div
      style={{
        background: palette.paper,
        border: `1px solid ${palette.borderSubtle}`,
        borderRadius: "24px",
        boxShadow: "0 4px 8px rgba(15,14,12,0.04), 0 24px 60px -24px rgba(15,14,12,0.18)",
        overflow: "hidden",
      }}
    >
      {/* Window chrome */}
      <div className="flex items-center justify-between px-4 py-3" style={{ background: palette.cream, borderBottom: `1px solid ${palette.borderSubtle}` }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: palette.ink }}>
            <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", color: palette.cream, fontSize: "13px", lineHeight: 1, transform: "translateY(-1px)" }}>A</span>
          </div>
          <span style={{ fontFamily: "'Instrument Serif', serif", color: palette.ink, fontSize: "16px", letterSpacing: "-0.01em", lineHeight: 1 }}>
            Advisor<span style={{ fontStyle: "italic" }}>Notes</span>
          </span>
        </div>
        <span className="text-[10px] uppercase" style={{ fontFamily: "Inter", letterSpacing: "0.18em", color: palette.dust }}>
          Live preview
        </span>
      </div>

      {/* Messages */}
      <div className="px-5 pt-5 pb-3" style={{ background: palette.paper }}>
        {/* User message */}
        <div className="flex justify-end mb-4">
          <div
            className="max-w-[85%] px-4 py-3 text-[13.5px] leading-relaxed"
            style={{
              fontFamily: "Inter",
              color: palette.ink,
              background: palette.cream,
              border: `1px solid ${palette.borderSubtle}`,
              borderRadius: "16px",
            }}
          >
            Draft a follow-up email from these notes: Annual review w/ Robert &amp; Linda Chen 4/28 — Robert retiring Dec 2027 (was 2030), Linda inherited $180k from her mother, both want to revisit estate plan.
          </div>
        </div>

        {/* Assistant message */}
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: palette.ink }}>
              <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", color: palette.cream, fontSize: "11px", lineHeight: 1, transform: "translateY(-1px)" }}>A</span>
            </div>
            <span className="text-[10px] uppercase" style={{ fontFamily: "Inter", letterSpacing: "0.16em", color: palette.ash }}>
              AdvisorNotes
            </span>
          </div>
          <div className="text-[13.5px] leading-relaxed" style={{ fontFamily: "Inter", color: palette.ink }}>
            <div className="mb-2"><strong>Subject:</strong> Following up — annual review &amp; next steps</div>
            <div className="mb-2">Robert and Linda,</div>
            <div className="mb-2">Thanks for making the time on the 28th. A few takeaways from our conversation:</div>
            <div className="mb-2">
              • Robert is now planning to retire in December 2027 (revised from 2030). We'll want to revisit the glide path and Social Security claiming strategy at our next meeting.<br/>
              • Linda's $180k inheritance — let's confirm whether it's qualified or non-qualified before we discuss positioning.<br/>
              • Estate plan: you both flagged wanting to refresh. I'll send a list of items for your attorney…
            </div>
            <span style={{ display: "inline-block", width: "8px", height: "14px", background: palette.ink, opacity: 0.5, verticalAlign: "text-bottom" }} />
          </div>
        </div>
      </div>

      {/* Composer (decorative) */}
      <div className="px-4 pb-4" style={{ background: palette.paper }}>
        <div
          className="flex items-center gap-2 px-3 py-2"
          style={{
            background: palette.cream,
            border: `1px solid ${palette.borderSubtle}`,
            borderRadius: "14px",
          }}
        >
          <span className="flex-1 text-[12px]" style={{ fontFamily: "Inter", color: palette.dust }}>
            Ask anything — paste raw notes, draft a memo, decode a contract…
          </span>
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: palette.ink, color: palette.cream }}>
            <Send className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Page ----------

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: palette.cream, color: palette.ink }}>
      <StackNav tool="AdvisorNotes" />

      <main className="max-w-6xl mx-auto px-6">

        {/* HERO — split: copy left, product preview right */}
        <FadeSection className="pt-20 md:pt-28 pb-20">
          <div className="grid lg:grid-cols-[5fr_6fr] gap-10 lg:gap-14 items-center">
            <div>
              <div className="mb-6">
                <span style={skyBadge}>The meeting notes tool</span>
              </div>
              <EditorialHeading italic="Drafted" rest={<>in seconds.<br/>Reviewed <span style={{ fontStyle: "italic" }}>by</span> you.</>} size="lg" className="mb-5" />
              <p className="text-lg mb-8 max-w-md" style={{ fontFamily: "Inter", color: palette.ash, lineHeight: 1.55 }}>
                A chat-based assistant trained on the way RIAs actually work. Paste raw notes, ask about a rule, or draft a memo. You sign off before anything leaves the page.
              </p>
              <div className="flex gap-3 items-center flex-wrap mb-6">
                <PillCTA to="/app">Open AdvisorNotes</PillCTA>
                <span className="text-sm" style={{ fontFamily: "Inter", color: palette.ash }}>Free during preview</span>
              </div>
              <div className="flex gap-6 flex-wrap text-[11px]" style={{ fontFamily: "Inter", letterSpacing: "0.18em", textTransform: "uppercase", color: palette.dust }}>
                <span>Drafts only</span>
                <span>Advisor-reviewed</span>
                <span>Never a recommendation</span>
              </div>
            </div>
            <div>
              <ChatPreview />
            </div>
          </div>
        </FadeSection>

        {/* WHAT IT DRAFTS — six output types as a quick-scan grid */}
        <FadeSection className="py-16">
          <div className="text-center mb-10">
            <SectionLabel>What it drafts</SectionLabel>
            <EditorialHeading italic="Six" rest="formats. One conversation." size="md" />
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              [Mail, "Recap email", "Compliant client follow-up with disclosure baked in"],
              [ClipboardList, "CRM note", "Redtail / Wealthbox / Salesforce-ready structure"],
              [ShieldCheck, "Suitability memo", "Documents your reasoning behind a recommendation"],
              [FileSignature, "IPS update", "Sections that changed, with \"no change\" where nothing did"],
              [Mail, "Discovery summary", "Warm follow-up that preserves prospect optionality"],
              [ClipboardList, "Internal task list", "Owner-tagged to-dos for advisor / team / client"],
            ].map(([Icon, title, body]) => (
              <div key={title} style={{ ...darkCard, padding: "20px" }}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(31,58,46,0.06)" }}>
                    <Icon className="w-4 h-4" style={{ color: palette.forest }} strokeWidth={1.6} />
                  </div>
                  <div>
                    <div className="text-base mb-1" style={{ fontFamily: "'Instrument Serif', serif", color: palette.ink, letterSpacing: "-0.005em" }}>{title}</div>
                    <div className="text-[13px] leading-relaxed" style={{ fontFamily: "Inter", color: palette.ash }}>{body}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </FadeSection>

        {/* DARK INK SECTION — the math */}
        <FadeSection className="py-16">
          <div style={{ ...inkBlock, padding: "56px 40px" }}>
            <div className="text-[11px] uppercase mb-4" style={{ fontFamily: "Inter", fontWeight: 500, letterSpacing: "0.22em", color: "rgba(250,246,238,0.55)" }}>
              The math
            </div>
            <EditorialHeading italic="Forty-five" rest="minutes becomes sixty seconds." size="md" className="mb-12 max-w-3xl" color={palette.cream} />
            <div className="grid md:grid-cols-3 gap-x-8 gap-y-10 max-w-5xl">
              <div>
                <div className="text-6xl mb-3 leading-none" style={{ fontFamily: "'Instrument Serif', serif", color: palette.cream, fontVariantNumeric: "tabular-nums" }}>45 min</div>
                <div className="text-sm leading-relaxed" style={{ fontFamily: "Inter", color: "rgba(250,246,238,0.65)" }}>typical time to draft a follow-up email by hand after a client meeting</div>
              </div>
              <div>
                <div className="text-6xl mb-3 leading-none" style={{ fontFamily: "'Instrument Serif', serif", color: palette.cream, fontVariantNumeric: "tabular-nums" }}>60 sec</div>
                <div className="text-sm leading-relaxed" style={{ fontFamily: "Inter", color: "rgba(250,246,238,0.65)" }}>average to draft the same email with AdvisorNotes — including review</div>
              </div>
              <div>
                <div className="text-6xl mb-3 leading-none" style={{ fontFamily: "'Instrument Serif', serif", color: palette.cream, fontVariantNumeric: "tabular-nums" }}>~5 hrs</div>
                <div className="text-sm leading-relaxed" style={{ fontFamily: "Inter", color: "rgba(250,246,238,0.65)" }}>recovered per advisor per week across the post-meeting workflow</div>
              </div>
            </div>
          </div>
        </FadeSection>

        {/* COMPLIANCE STRIP — kept short */}
        <FadeSection className="py-16">
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-6 max-w-4xl mx-auto">
            <div>
              <SectionLabel>The discipline</SectionLabel>
              <EditorialHeading italic="Built" rest="for the regulator's eye." size="sm" />
            </div>
            <div className="text-[15px] leading-relaxed" style={{ fontFamily: "Inter", color: palette.ash }}>
              Drafts only — nothing auto-sends. No fabrication of facts beyond what you paste. Disclosures preserved on client-facing output. Treated as electronic communications under SEC 17a-4 / FINRA 4511. Your CCO is your CCO; we don't pretend to be.
            </div>
          </div>
        </FadeSection>

        {/* CLOSING CTA */}
        <FadeSection className="py-20 text-center">
          <EditorialHeading italic="Ready" rest="to try it on your last meeting?" size="lg" className="mb-8 max-w-3xl mx-auto" />
          <PillCTA to="/app">Open AdvisorNotes</PillCTA>
        </FadeSection>

        <footer className="py-10 flex justify-between flex-wrap gap-3 text-[11px]" style={{ fontFamily: "Inter", letterSpacing: "0.18em", textTransform: "uppercase", color: palette.dust, borderTop: `1px solid ${palette.borderSubtle}` }}>
          <span>Advisor Stack — Prototype</span>
          <span>Not a substitute for compliance review · Not investment advice</span>
        </footer>
      </main>

      <FloatingMark />
    </div>
  );
}
