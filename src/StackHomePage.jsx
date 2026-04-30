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

// Each tool in the stack
const TOOLS = [
  {
    id: "notes",
    name: "AdvisorNotes",
    description: "Turn rough meeting notes into recap emails, CRM entries, suitability memos, IPS updates, discovery summaries, or task lists.",
    available: true,
    href: "/notes",
  },
  {
    id: "translator",
    name: "Plain-English Translator",
    description: "Paste investment jargon, get a client-readable version. For newsletters and tough explanations.",
    available: false,
  },
  {
    id: "prospect-brief",
    name: "Prospect Pre-Meeting Brief",
    description: "A one-page brief on talking points and likely concerns before you sit down with a prospect.",
    available: false,
  },
  {
    id: "decoder",
    name: "Document Decoder",
    description: "Paste an annuity contract, insurance policy, or trust section. Get plain-English back.",
    available: false,
  },
  {
    id: "disclosure",
    name: "Disclosure Drafter",
    description: "Pick a context — social, podcast, blog, marketing — get the right disclosure language to attach.",
    available: false,
  },
  {
    id: "thank-you",
    name: "Referral Thank-You Generator",
    description: "A polished, personalized thank-you note for every referral, in 30 seconds.",
    available: false,
  },
  {
    id: "process",
    name: "Process Documentation Writer",
    description: "Describe a process in fragments, get a polished SOP your team can actually follow.",
    available: false,
  },
  {
    id: "adv",
    name: "ADV / Form CRS Helper",
    description: "A starter-draft assistant for annual ADV and Form CRS section updates.",
    available: false,
  },
];

const availableCount = TOOLS.filter((t) => t.available).length;
const comingSoonCount = TOOLS.length - availableCount;

export default function StackHomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
      <div className="h-0.5 bg-emerald-800" />

      {/* TOP NAV */}
      <nav className="border-b border-slate-200 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <svg width="22" height="22" viewBox="0 0 28 28" className="flex-shrink-0">
              <rect x="0" y="0" width="28" height="28" rx="2" fill="#065f46"/>
              <text x="14" y="20" fontFamily="Georgia, serif" fontSize="18" fontStyle="italic" fill="#f8fafc" textAnchor="middle">A</text>
            </svg>
            <div className="text-xl text-slate-900" style={{ fontFamily: "Georgia, serif" }}>
              Advisor<span className="italic text-emerald-800">Stack</span>
            </div>
          </Link>
          <div className="flex gap-7 items-center" style={{ fontFamily: "system-ui", fontSize: "13px" }}>
            <a href="#tools" className="text-slate-600 hover:text-slate-900 no-underline">Tools</a>
            <a href="#compliance" className="text-slate-600 hover:text-slate-900 no-underline">Compliance</a>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6">

        {/* HERO */}
        <FadeSection className="pt-20 pb-14">
          <div className="text-xs uppercase tracking-[0.22em] text-emerald-800 mb-5" style={{ fontFamily: "system-ui" }}>
            A growing suite of compliance-first AI tools
          </div>
          <h1 className="text-5xl md:text-6xl text-slate-900 leading-tight mb-6 max-w-4xl" style={{ fontFamily: "Georgia, serif", fontWeight: 400, letterSpacing: "-0.02em" }}>
            The AI toolkit, <span className="italic text-emerald-800">built for the way advisors actually work</span>.
          </h1>
          <p className="text-xl text-slate-700 leading-relaxed max-w-2xl mb-7" style={{ fontFamily: "Georgia, serif" }}>
            Eight focused tools that take the friction out of the paperwork, prep work, and back-office writing that fills your day. Every output is yours to review before it goes anywhere.
          </p>
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500 pt-5 border-t border-slate-300 max-w-2xl" style={{ fontFamily: "system-ui" }}>
            Drafts only · Always advisor-reviewed · Never a recommendation
          </div>
        </FadeSection>

        {/* TOOLS GRID */}
        <FadeSection id="tools" className="py-14 border-t border-slate-200 bg-white -mx-6 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-baseline mb-7 flex-wrap gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-slate-500 mb-2" style={{ fontFamily: "system-ui" }}>The stack</div>
                <h2 className="text-3xl text-slate-900 leading-tight" style={{ fontFamily: "Georgia, serif", fontWeight: 400 }}>
                  Eight tools. One discipline.
                </h2>
              </div>
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500" style={{ fontFamily: "system-ui" }}>
                {availableCount} available · {comingSoonCount} coming soon
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {TOOLS.map((tool) => (
                tool.available ? (
                  <Link
                    key={tool.id}
                    to={tool.href}
                    className="bg-white border border-emerald-800 p-6 no-underline hover:bg-emerald-50 transition-colors block"
