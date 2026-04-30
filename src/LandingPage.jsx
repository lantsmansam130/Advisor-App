import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatedBackground, StackNav } from "./StackHomePage.jsx";

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
    <section ref={ref} id={id} className={className} style={{ ...style, opacity: visible ? 1 : 0, transform: visible ? "translateY(0) scale(1)" : "translateY(40px) scale(0.97)", transition: "opacity 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)" }}>
      {children}
    </section>
  );
}

function PrimaryCTA() {
  return (
    <Link to="/app" className="inline-block px-7 py-3.5 no-underline" style={{ background: "rgba(30,27,75,0.95)", color: "#fff", fontFamily: "system-ui", fontSize: "13px", letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: "12px", boxShadow: "0 8px 24px rgba(30,27,75,0.35)", transition: "transform 0.2s, box-shadow 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(30,27,75,0.45)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(30,27,75,0.35)"; }}>
      Try it now →
    </Link>
  );
}

const glassCard = { background: "rgba(255,255,255,0.55)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.7)", borderRadius: "16px", boxShadow: "0 8px 32px rgba(31,38,135,0.08)" };

export default function LandingPage() {
  return (
    <div className="min-h-screen relative" style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: "#0a0f1f" }}>
      <AnimatedBackground />

      <div className="relative z-10">
        <StackNav tool="AdvisorNotes" />

        <div className="max-w-6xl mx-auto px-6">

          <FadeSection className="pt-20 pb-16">
            <div className="text-xs uppercase tracking-[0.22em] mb-5" style={{ fontFamily: "system-ui", color: "#1e1b4b" }}>
              Advisor Stack · The meeting notes tool
            </div>
            <h1 className="text-5xl md:text-6xl leading-tight mb-6 max-w-4xl" style={{ fontFamily: "Georgia, serif", fontWeight: 400, letterSpacing: "-0.02em", color: "#0a0f1f" }}>
              The post-meeting paperwork, <span className="italic" style={{ color: "#1e1b4b" }}>drafted for you</span>.
            </h1>
            <p className="text-xl leading-relaxed max-w-2xl mb-9" style={{ fontFamily: "Georgia, serif", color: "#1f2937" }}>
              Paste your rough notes. Get a compliant follow-up email, CRM entry, suitability memo, or IPS update — drafted in the seconds it takes to review it. You stay in the chair where the regulator wants you.
            </p>
            <div className="flex gap-4 items-center flex-wrap mb-7">
              <PrimaryCTA />
              <span className="text-sm" style={{ fontFamily: "system-ui", color: "#1e1b4b" }}>No sign-up · Free during preview</span>
            </div>
            <div className="text-xs uppercase tracking-[0.2em] pt-5 max-w-2xl" style={{ fontFamily: "system-ui", color: "#1e1b4b", borderTop: "1px solid rgba(30,27,75,0.2)" }}>
              Drafts only · Always advisor-reviewed · Never a recommendation
            </div>
          </FadeSection>

          <FadeSection className="py-14">
            <div style={{ ...glassCard, padding: "32px" }}>
              <div className="text-xs uppercase tracking-[0.22em] mb-4" style={{ fontFamily: "system-ui", color: "#1e1b4b" }}>The problem</div>
              <h2 className="text-3xl leading-tight mb-7 max-w-2xl" style={{ fontFamily: "Georgia, serif", fontWeight: 400, color: "#0a0f1f" }}>
                Every meeting ends with the same forty-five minutes you don't want to spend.
              </h2>
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl text-base leading-relaxed" style={{ fontFamily: "Georgia, serif", color: "#1f2937" }}>
                <div>The follow-up email. The CRM note. The suitability memo if you discussed a recommendation. The IPS update if anything material changed.</div>
                <div>By the time you sit down to write it, half the detail has faded. You write less than you should — or you write it three days later and feel guilty about it.</div>
              </div>
            </div>
          </FadeSection>

          <FadeSection id="how" className="py-14">
            <div className="text-xs uppercase tracking-[0.22em] mb-4" style={{ fontFamily: "system-ui", color: "#1e1b4b" }}>How it works</div>
            <h2 className="text-3xl leading-tight mb-9" style={{ fontFamily: "Georgia, serif", fontWeight: 400, color: "#0a0f1f" }}>
              Three steps. Under a minute.
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                ["Step one", "Paste your raw notes.", "Shorthand, fragments, \"Robert wants to retire 2027 not 2030\" — whatever you actually scribbled."],
                ["Step two", "Pick what you need drafted.", "Recap email, discovery summary, CRM note, suitability memo, IPS update, or task list. Pick the tone."],
                ["Step three", "Review, edit, send.", "Drafts are formatted for your CRM and pre-loaded with required disclosures. You sign off."],
              ].map(([label, title, body]) => (
                <div key={label} style={{ ...glassCard, padding: "22px" }}>
                  <div className="italic text-sm mb-2" style={{ fontFamily: "Georgia, serif", color: "#1e1b4b" }}>{label}</div>
                  <div className="text-lg mb-2" style={{ fontFamily: "Georgia, serif", color: "#0a0f1f" }}>{title}</div>
                  <div className="text-sm leading-relaxed" style={{ fontFamily: "Georgia, serif", color: "#1f2937" }}>{body}</div>
                </div>
              ))}
            </div>
          </FadeSection>

          <div className="py-10 text-center">
            <PrimaryCTA />
          </div>

          <FadeSection className="py-16">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="text-xs uppercase tracking-[0.22em] mb-3" style={{ fontFamily: "system-ui", color: "#1e1b4b" }}>Why it's worth a minute</div>
              <h2 className="text-3xl leading-tight" style={{ fontFamily: "Georgia, serif", fontWeight: 400, color: "#0a0f1f" }}>
                The math on post-meeting paperwork.
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div style={{ ...glassCard, padding: "26px", textAlign: "center" }}>
                <div className="text-6xl mb-3 leading-none" style={{ fontFamily: "Georgia, serif", color: "#1e1b4b", fontVariantNumeric: "tabular-nums" }}>
                  <CountUp target={45} suffix=" min" />
                </div>
                <div className="text-sm leading-relaxed max-w-[14rem] mx-auto" style={{ fontFamily: "Georgia, serif", color: "#1f2937" }}>
                  average time to draft a follow-up email by hand after a typical client meeting
                </div>
              </div>
              <div style={{ ...glassCard, padding: "26px", textAlign: "center" }}>
                <div className="text-6xl mb-3 leading-none" style={{ fontFamily: "Georgia, serif", color: "#1e1b4b", fontVariantNumeric: "tabular-nums" }}>
                  <CountUp target={60} suffix=" sec" />
                </div>
                <div className="text-sm leading-relaxed max-w-[14rem] mx-auto" style={{ fontFamily: "Georgia, serif", color: "#1f2937" }}>
                  average time to draft the same email with AdvisorNotes — including review
                </div>
              </div>
              <div style={{ ...glassCard, padding: "26px", textAlign: "center" }}>
                <div className="text-6xl mb-3 leading-none" style={{ fontFamily: "Georgia, serif", color: "#1e1b4b", fontVariantNumeric: "tabular-nums" }}>
                  <CountUp target={6} />
                </div>
                <div className="text-sm leading-relaxed max-w-[14rem] mx-auto" style={{ fontFamily: "Georgia, serif", color: "#1f2937" }}>
                  output formats — from client recaps to internal task lists
                </div>
              </div>
            </div>
          </FadeSection>

          <FadeSection className="py-14 text-center">
            <h2 className="text-3xl mb-6" style={{ fontFamily: "Georgia, serif", fontWeight: 400, color: "#0a0f1f" }}>
              Ready to try it on your last meeting?
            </h2>
            <PrimaryCTA />
          </FadeSection>

          <FadeSection id="faq" className="py-14">
            <div style={{ ...glassCard, padding: "32px" }}>
              <div className="text-xs uppercase tracking-[0.22em] mb-4" style={{ fontFamily: "system-ui", color: "#1e1b4b" }}>Questions you'll want answered</div>
              <h2 className="text-3xl leading-tight mb-9" style={{ fontFamily: "Georgia, serif", fontWeight: 400, color: "#0a0f1f" }}>
                Before you paste a real client's notes.
              </h2>
              <div className="flex flex-col gap-6 max-w-4xl">
                {[
                  ["Where does my data go?", "Your notes are sent to Anthropic's Claude API to generate the draft, then discarded. We don't store them. We don't train on them. We don't see them."],
                  ["Is this approved by my firm's compliance department?", "No tool can answer that for you. Bring it to your CCO. We'll provide whatever vendor due diligence documentation you need."],
                  ["Does this satisfy SEC 17a-4 retention?", "Not by itself. AdvisorNotes generates drafts. Your firm's books-and-records system is where retention happens. Copy the output into your existing archived channel."],
                  ["Can I customize the disclosure language for my firm?", "Not yet — every client recap currently ships with a standard disclosure. Per-firm customization is on the roadmap."],
                ].map(([q, a]) => (
                  <div key={q} className="pt-5" style={{ borderTop: "1px solid rgba(30,27,75,0.15)" }}>
                    <div className="text-lg mb-2" style={{ fontFamily: "Georgia, serif", color: "#0a0f1f" }}>{q}</div>
                    <div className="text-[15px] leading-relaxed" style={{ fontFamily: "Georgia, serif", color: "#1f2937" }}>{a}</div>
                  </div>
                ))}
              </div>
            </div>
          </FadeSection>

          <footer className="py-8 text-xs uppercase tracking-[0.2em] flex justify-between flex-wrap gap-3" style={{ fontFamily: "system-ui", color: "#1e1b4b", borderTop: "1px solid rgba(30,27,75,0.15)" }}>
            <span>Advisor Stack — Prototype</span>
            <span>Not a substitute for compliance review · Not investment advice</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
