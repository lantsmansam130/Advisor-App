import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

// Reusable hook: fades a section in when it scrolls into view
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

// Reusable: count-up number when scrolled into view
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

// Section wrapper that auto-applies fade-in
function FadeSection({ children, className = "", style = {}, id }) {
  const [ref, visible] = useFadeIn();
  return (
    <section
      ref={ref}
      id={id}
      className={className}
      style={{
        ...style,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.7s ease, transform 0.7s ease",
      }}
    >
      {children}
    </section>
  );
}

// Big slate-900 CTA — used in hero, mid-page, and closer
function PrimaryCTA() {
  return (
    <Link
      to="/app"
      className="inline-block px-7 py-3.5 bg-slate-900 text-slate-50 hover:bg-emerald-800 transition-colors no-underline"
      style={{ fontFamily: "system-ui", fontSize: "13px", letterSpacing: "0.1em", textTransform: "uppercase" }}
    >
      Try it now →
    </Link>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
      <div className="h-0.5 bg-emerald-800" />

      {/* TOP NAV with CTA #1 */}
      <nav className="border-b border-slate-200 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <svg width="22" height="22" viewBox="0 0 28 28" className="flex-shrink-0">
              <rect x="0" y="0" width="28" height="28" rx="2" fill="#065f46"/>
              <text x="14" y="20" fontFamily="Georgia, serif" fontSize="18" fontStyle="italic" fill="#f8fafc" textAnchor="middle">A</text>
            </svg>
            <div className="text-xl text-slate-900" style={{ fontFamily: "Georgia, serif" }}>
              Advisor<span className="italic text-emerald-800">Notes</span>
            </div>
          </Link>
          <div className="flex gap-7 items-center" style={{ fontFamily: "system-ui", fontSize: "13px" }}>
            <a href="#how" className="text-slate-600 hover:text-slate-900 no-underline">How it works</a>
            <a href="#compliance" className="text-slate-600 hover:text-slate-900 no-underline">Compliance</a>
            <a href="#faq" className="text-slate-600 hover:text-slate-900 no-underline">FAQ</a>
            <Link to="/app" className="px-4 py-2 bg-emerald-800 text-slate-50 hover:bg-emerald-900 transition-colors no-underline" style={{ fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Try the tool →
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6">

        {/* HERO with CTA #2 */}
        <FadeSection className="pt-20 pb-16">
          <div className="text-xs uppercase tracking-[0.22em] text-emerald-800 mb-5" style={{ fontFamily: "system-ui" }}>
            Compliance-first AI · Built for RIAs
          </div>
          <h1 className="text-5xl md:text-6xl text-slate-900 leading-tight mb-6 max-w-4xl" style={{ fontFamily: "Georgia, serif", fontWeight: 400, letterSpacing: "-0.02em" }}>
            The post-meeting paperwork, <span className="italic text-emerald-800">drafted for you</span>.
          </h1>
          <p className="text-xl text-slate-700 leading-relaxed max-w-2xl mb-9" style={{ fontFamily: "Georgia, serif" }}>
            Paste your rough notes. Get a compliant follow-up email, CRM entry, suitability memo, or IPS update — drafted in the seconds it takes to review it. You stay in the chair where the regulator wants you.
          </p>
          <div className="flex gap-4 items-center flex-wrap mb-7">
            <PrimaryCTA />
            {/* TODO: change "Free during preview" when you start charging */}
            <span className="text-sm text-slate-500" style={{ fontFamily: "system-ui" }}>No sign-up · Free during preview</span>
          </div>
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500 pt-5 border-t border-slate-300 max-w-2xl" style={{ fontFamily: "system-ui" }}>
            Drafts only · Always advisor-reviewed · Never a recommendation
          </div>
        </FadeSection>

        {/* PROBLEM */}
        <FadeSection className="py-14 border-t border-slate-200 bg-white -mx-6 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-xs uppercase tracking-[0.22em] text-slate-500 mb-4" style={{ fontFamily: "system-ui" }}>The problem</div>
            <h2 className="text-3xl text-slate-900 leading-tight mb-7 max-w-2xl" style={{ fontFamily: "Georgia, serif", fontWeight: 400 }}>
              Every meeting ends with the same forty-five minutes you don't want to spend.
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl text-base text-slate-700 leading-relaxed" style={{ fontFamily: "Georgia, serif" }}>
              <div>The follow-up email. The CRM note. The suitability memo if you discussed a recommendation. The IPS update if anything material changed.</div>
              <div>By the time you sit down to write it, half the detail has faded. You write less than you should — or you write it three days later and feel guilty about it.</div>
            </div>
          </div>
        </FadeSection>

        {/* HOW IT WORKS */}
        <FadeSection id="how" className="py-14 border-t border-slate-200">
          <div className="text-xs uppercase tracking-[0.22em] text-slate-500 mb-4" style={{ fontFamily: "system-ui" }}>How it works</div>
          <h2 className="text-3xl text-slate-900 leading-tight mb-9" style={{ fontFamily: "Georgia, serif", fontWeight: 400 }}>
            Three steps. Under a minute.
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              ["Step one", "Paste your raw notes.", "Shorthand, fragments, \"Robert wants to retire 2027 not 2030\" — whatever you actually scribbled."],
              ["Step two", "Pick what you need drafted.", "Recap email, discovery summary, CRM note, suitability memo, IPS update, or task list. Pick the tone."],
              ["Step three", "Review, edit, send.", "Drafts are formatted for your CRM and pre-loaded with required disclosures. You sign off."],
            ].map(([label, title, body]) => (
              <div key={label} className="border-t border-emerald-800 pt-4">
                <div className="italic text-sm text-emerald-800 mb-2" style={{ fontFamily: "Georgia, serif" }}>{label}</div>
                <div className="text-lg text-slate-900 mb-2" style={{ fontFamily: "Georgia, serif" }}>{title}</div>
                <div className="text-sm text-slate-600 leading-relaxed" style={{ fontFamily: "Georgia, serif" }}>{body}</div>
              </div>
            ))}
          </div>
        </FadeSection>

        {/* WHAT IT DRAFTS — staggered cards */}
        <FadeSection className="py-14 border-t border-slate-200 bg-white -mx-6 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-xs uppercase tracking-[0.22em] text-slate-500 mb-4" style={{ fontFamily: "system-ui" }}>What it drafts</div>
            <h2 className="text-3xl text-slate-900 leading-tight mb-9 max-w-2xl" style={{ fontFamily: "Georgia, serif", fontWeight: 400 }}>
              Six outputs. Each one written for the place it's going.
            </h2>
            <StaggeredGrid />
          </div>
        </FadeSection>

        {/* CTA #3 — mid-page */}
        <div className="py-14 text-center border-t border-slate-200">
          <PrimaryCTA />
        </div>

        {/* COMPLIANCE — cream parchment */}
        <FadeSection id="compliance" className="py-14 -mx-6 px-6 border-t border-amber-200" style={{ background: "#fefbf3" }}>
          <div className="max-w-6xl mx-auto">
            <div className="text-xs uppercase tracking-[0.22em] text-emerald-800 mb-4" style={{ fontFamily: "system-ui" }}>Compliance posture</div>
            <h2 className="text-3xl text-slate-900 leading-tight mb-7 max-w-2xl" style={{ fontFamily: "Georgia, serif", fontWeight: 400 }}>
              We built this assuming the SEC will read every output.
            </h2>
            <div className="grid md:grid-cols-2 gap-9 max-w-5xl text-[15px] leading-relaxed" style={{ fontFamily: "Georgia, serif" }}>
              {[
                ["Drafts only, never sends", "Nothing is auto-sent, auto-filed, or auto-shared. Every output requires your review and your signature before it leaves the page."],
                ["No fabrication of facts", "If your notes don't say it, the draft says \"needs follow-up.\" We don't invent allocation percentages, risk metrics, or client details."],
                ["Disclosure language built in", "Client recap emails ship with the standard \"informational only, not investment advice\" disclosure pre-loaded. You can't forget it."],
                ["Subject to your firm's WSP", "Outputs are electronic communications under SEC 17a-4 and FINRA 4511. Run them through your normal supervisory process."],
              ].map(([label, body]) => (
                <div key={label}>
                  <div className="text-xs uppercase tracking-[0.15em] text-emerald-800 mb-2" style={{ fontFamily: "system-ui" }}>{label}</div>
                  <div className="text-slate-700">{body}</div>
                </div>
              ))}
            </div>
          </div>
        </FadeSection>

        {/* STATS — count-up. TODO: replace 45 and 60 with real measured values */}
        <FadeSection className="py-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs uppercase tracking-[0.22em] text-emerald-800 mb-3" style={{ fontFamily: "system-ui" }}>Why it's worth a minute</div>
            <h2 className="text-3xl text-slate-900 leading-tight" style={{ fontFamily: "Georgia, serif", fontWeight: 400 }}>
              The math on post-meeting paperwork.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            <div className="text-center border-t border-emerald-800 pt-6">
              {/* TODO: replace 45 with real measured value */}
              <div className="text-6xl text-emerald-800 mb-3 leading-none" style={{ fontFamily: "Georgia, serif", fontVariantNumeric: "tabular-nums" }}>
                <CountUp target={45} suffix=" min" />
              </div>
              <div className="text-sm text-slate-600 leading-relaxed max-w-[14rem] mx-auto" style={{ fontFamily: "Georgia, serif" }}>
                average time to draft a follow-up email by hand after a typical client meeting
              </div>
            </div>
            <div className="text-center border-t border-emerald-800 pt-6">
              {/* TODO: replace 60 with real measured value */}
              <div className="text-6xl text-emerald-800 mb-3 leading-none" style={{ fontFamily: "Georgia, serif", fontVariantNumeric: "tabular-nums" }}>
                <CountUp target={60} suffix=" sec" />
              </div>
              <div className="text-sm text-slate-600 leading-relaxed max-w-[14rem] mx-auto" style={{ fontFamily: "Georgia, serif" }}>
                average time to draft the same email with AdvisorNotes — including review
              </div>
            </div>
            <div className="text-center border-t border-emerald-800 pt-6">
              <div className="text-6xl text-emerald-800 mb-3 leading-none" style={{ fontFamily: "Georgia, serif", fontVariantNumeric: "tabular-nums" }}>
                <CountUp target={6} />
              </div>
              <div className="text-sm text-slate-
