import { useEffect, useRef, useState } from "react";
import { StackNav, FloatingMark, PillCTA, SectionLabel, EditorialHeading, darkCard, indigoBlock, skyBadge } from "./StackHomePage.jsx";

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

function CountUp({ target, suffix = "", duration = 1200 }) {
  const ref = useRef(null);
  const [val, setVal] = useState(0);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setStarted(true)),
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      setVal(Math.round(target * t));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, target, duration]);
  return <span ref={ref}>{val}{suffix}</span>;
}

function FadeSection({ children, className = "", style = {}, id }) {
  const [ref, visible] = useFadeIn();
  return (
    <section ref={ref} id={id} className={className} style={{ ...style, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)", transition: "opacity 0.7s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1)" }}>
      {children}
    </section>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "#000", color: "#fff" }}>
      <StackNav tool="AdvisorNotes" />

      <main className="max-w-6xl mx-auto px-6">

        {/* HERO */}
        <FadeSection className="pt-24 md:pt-32 pb-20 text-center">
          <div className="mb-7 flex justify-center">
            <span style={skyBadge}>The meeting notes tool</span>
          </div>
          <EditorialHeading italic="Drafted" rest={<>in seconds.<br/>Reviewed <span style={{ fontStyle: "italic" }}>by</span> you.</>} size="xl" className="mb-6 max-w-4xl mx-auto" />
          <p className="max-w-xl mx-auto mb-10 text-lg" style={{ fontFamily: "Inter", color: "rgba(255,255,255,0.65)", lineHeight: 1.55 }}>
            Paste your rough notes. Get a compliant follow-up email, CRM entry, suitability memo, or IPS update — drafted in the seconds it takes to review it.
          </p>
          <div className="flex gap-3 items-center justify-center flex-wrap">
            <PillCTA to="/app">Try it now</PillCTA>
            <span className="text-sm" style={{ fontFamily: "Inter", color: "rgba(255,255,255,0.5)" }}>No sign-up · Free during preview</span>
          </div>
          <div className="mt-12 flex justify-center gap-8 flex-wrap text-[11px]" style={{ fontFamily: "Inter", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
            <span>Drafts only</span>
            <span>Always advisor-reviewed</span>
            <span>Never a recommendation</span>
          </div>
        </FadeSection>

        {/* THE PROBLEM — INDIGO */}
        <FadeSection className="py-16">
          <div style={{ ...indigoBlock, padding: "56px 40px" }}>
            <SectionLabel>The problem</SectionLabel>
            <EditorialHeading italic="Forty-five" rest="minutes you'll never get back." size="md" className="mb-10 max-w-3xl" />
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl text-[15px] leading-relaxed" style={{ fontFamily: "Inter", color: "rgba(255,255,255,0.85)" }}>
              <div>The follow-up email. The CRM note. The suitability memo if you discussed a recommendation. The IPS update if anything material changed.</div>
              <div>By the time you sit down to write it, half the detail has faded. You write less than you should — or you write it three days later and feel guilty about it.</div>
            </div>
          </div>
        </FadeSection>

        {/* HOW IT WORKS */}
        <FadeSection id="how" className="py-16">
          <div className="text-center mb-12">
            <SectionLabel>How it works</SectionLabel>
            <EditorialHeading italic="Three" rest="steps. Sixty seconds." size="md" className="max-w-3xl mx-auto" />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              ["01", "Paste your raw notes.", "Shorthand, fragments, \"Robert wants to retire 2027 not 2030\" — whatever you actually scribbled."],
              ["02", "Pick what you need drafted.", "Recap email, discovery summary, CRM note, suitability memo, IPS update, or task list. Pick the tone."],
              ["03", "Review, edit, send.", "Drafts are formatted for your CRM and pre-loaded with required disclosures. You sign off."],
            ].map(([num, title, body]) => (
              <div key={num} style={{ ...darkCard, padding: "28px" }}>
                <div className="text-3xl mb-4 leading-none" style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", color: "rgba(255,255,255,0.55)", fontVariantNumeric: "tabular-nums" }}>{num}</div>
                <div className="text-xl mb-2" style={{ fontFamily: "'Instrument Serif', serif", color: "#fff", letterSpacing: "-0.01em" }}>{title}</div>
                <div className="text-[14px] leading-relaxed" style={{ fontFamily: "Inter", color: "rgba(255,255,255,0.6)" }}>{body}</div>
              </div>
            ))}
          </div>
        </FadeSection>

        {/* MID CTA */}
        <FadeSection className="py-12 text-center">
          <PillCTA to="/app">Try it on your last meeting</PillCTA>
        </FadeSection>

        {/* THE MATH */}
        <FadeSection className="py-16">
          <div className="text-center mb-12">
            <SectionLabel>Why it's worth a minute</SectionLabel>
            <EditorialHeading italic="Run" rest="the numbers." size="md" />
          </div>
          <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            <div style={{ ...darkCard, padding: "32px", textAlign: "center" }}>
              <div className="text-7xl mb-4 leading-none" style={{ fontFamily: "'Instrument Serif', serif", color: "#fff", fontVariantNumeric: "tabular-nums" }}>
                <CountUp target={45} suffix=" min" />
              </div>
              <div className="text-sm leading-relaxed max-w-[16rem] mx-auto" style={{ fontFamily: "Inter", color: "rgba(255,255,255,0.6)" }}>
                average time to draft a follow-up email by hand after a typical client meeting
              </div>
            </div>
            <div style={{ ...darkCard, padding: "32px", textAlign: "center" }}>
              <div className="text-7xl mb-4 leading-none" style={{ fontFamily: "'Instrument Serif', serif", color: "#fff", fontVariantNumeric: "tabular-nums" }}>
                <CountUp target={60} suffix=" sec" />
              </div>
              <div className="text-sm leading-relaxed max-w-[16rem] mx-auto" style={{ fontFamily: "Inter", color: "rgba(255,255,255,0.6)" }}>
                average time to draft the same email with AdvisorNotes — including review
              </div>
            </div>
            <div style={{ ...darkCard, padding: "32px", textAlign: "center" }}>
              <div className="text-7xl mb-4 leading-none" style={{ fontFamily: "'Instrument Serif', serif", color: "#fff", fontVariantNumeric: "tabular-nums" }}>
                <CountUp target={6} />
              </div>
              <div className="text-sm leading-relaxed max-w-[16rem] mx-auto" style={{ fontFamily: "Inter", color: "rgba(255,255,255,0.6)" }}>
                output formats — from client recaps to internal task lists
              </div>
            </div>
          </div>
        </FadeSection>

        {/* FAQ */}
        <FadeSection id="faq" className="py-16">
          <div style={{ ...darkCard, padding: "48px 40px" }}>
            <SectionLabel>Questions you'll want answered</SectionLabel>
            <EditorialHeading italic="Before" rest="you paste a real client's notes." size="md" className="mb-10 max-w-3xl" />
            <div className="flex flex-col gap-6 max-w-4xl">
              {[
                ["Where does my data go?", "Your notes are sent to Anthropic's Claude API to generate the draft, then discarded. We don't store them. We don't train on them. We don't see them."],
                ["Is this approved by my firm's compliance department?", "No tool can answer that for you. Bring it to your CCO. We'll provide whatever vendor due diligence documentation you need."],
                ["Does this satisfy SEC 17a-4 retention?", "Not by itself. AdvisorNotes generates drafts. Your firm's books-and-records system is where retention happens. Copy the output into your existing archived channel."],
                ["Can I customize the disclosure language for my firm?", "Not yet — every client recap currently ships with a standard disclosure. Per-firm customization is on the roadmap."],
              ].map(([q, a]) => (
                <div key={q} className="pt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="text-xl mb-2" style={{ fontFamily: "'Instrument Serif', serif", color: "#fff" }}>{q}</div>
                  <div className="text-[15px] leading-relaxed" style={{ fontFamily: "Inter", color: "rgba(255,255,255,0.65)" }}>{a}</div>
                </div>
              ))}
            </div>
          </div>
        </FadeSection>

        {/* CLOSING CTA */}
        <FadeSection className="py-20 text-center">
          <EditorialHeading italic="Ready" rest="to try it on your last meeting?" size="lg" className="mb-8 max-w-3xl mx-auto" />
          <PillCTA to="/app">Try it now</PillCTA>
        </FadeSection>

        <footer className="py-10 flex justify-between flex-wrap gap-3 text-[11px]" style={{ fontFamily: "Inter", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <span>Advisor Stack — Prototype</span>
          <span>Not a substitute for compliance review · Not investment advice</span>
        </footer>
      </main>

      <FloatingMark />
    </div>
  );
}
