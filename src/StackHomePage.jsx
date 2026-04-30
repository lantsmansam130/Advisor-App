import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, FileText, BarChart3, Compass, ShieldAlert, Heart, FileCog, FilePen, ArrowUpRight } from "lucide-react";

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
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 0.7s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1)",
      }}
    >
      {children}
    </section>
  );
}

const TOOLS = [
  { id: "notes", name: "AdvisorNotes", available: true, href: "/notes", icon: Mail, description: "Turn rough meeting notes into recap emails, CRM entries, suitability memos, IPS updates, discovery summaries, or task lists." },
  { id: "decoder", name: "Document Decoder", available: true, href: "/decoder", icon: FileText, description: "Paste an annuity contract, insurance policy, or trust section. Get a plain-English breakdown — what it says, what to watch for, what to ask before signing." },
  { id: "lead-analytics", name: "Inbound Lead Analytics", available: false, status: "In development", icon: BarChart3, description: "Connect your CRM. See where your best leads come from, which sources convert, and where to focus your prospecting." },
  { id: "prospect-brief", name: "Prospect Pre-Meeting Brief", available: false, icon: Compass, description: "A one-page brief on talking points and likely concerns before you sit down with a prospect." },
  { id: "disclosure", name: "Disclosure Drafter", available: false, icon: ShieldAlert, description: "Pick a context — social, podcast, blog, marketing — get the right disclosure language to attach." },
  { id: "thank-you", name: "Referral Thank-You Generator", available: false, icon: Heart, description: "A polished, personalized thank-you note for every referral, in 30 seconds." },
  { id: "process", name: "Process Documentation Writer", available: false, icon: FileCog, description: "Describe a process in fragments, get a polished SOP your team can actually follow." },
  { id: "adv", name: "ADV / Form CRS Helper", available: false, icon: FilePen, description: "A starter-draft assistant for annual ADV and Form CRS section updates." },
];

const availableCount = TOOLS.filter((t) => t.available).length;
const comingSoonCount = TOOLS.length - availableCount;

// Kept for backwards-compat with existing imports; renders nothing.
export function AnimatedBackground() {
  return null;
}

export function StackNav({ tool }) {
  return (
    <nav className="sticky top-4 z-50 mx-4 mt-4">
      <div
        className="max-w-6xl mx-auto px-4 py-2.5 flex justify-between items-center"
        style={{
          background: "rgba(15,15,17,0.72)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "999px",
        }}
      >
        <Link to="/" className="flex items-center gap-2.5 no-underline pl-1">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#fff" }}>
            <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", color: "#000", fontSize: "17px", lineHeight: 1, transform: "translateY(-1px)" }}>A</span>
          </div>
          <span style={{ fontFamily: "'Instrument Serif', serif", color: "#fff", fontSize: "20px", letterSpacing: "-0.01em", lineHeight: 1 }}>
            Advisor<span style={{ fontStyle: "italic" }}>Stack</span>
          </span>
          {tool && (
            <>
              <span className="opacity-30 mx-1" style={{ fontFamily: "'Instrument Serif', serif", fontSize: "18px" }}>/</span>
              <span style={{ fontFamily: "Inter", fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>{tool}</span>
            </>
          )}
        </Link>
        {tool ? (
          <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 no-underline" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Inter", fontWeight: 500, fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            ← All tools
          </Link>
        ) : (
          <Link to="/notes" className="inline-flex items-center gap-2 px-5 py-2.5 no-underline" style={{ background: "#fff", color: "#000", borderRadius: "999px", fontFamily: "Inter", fontWeight: 500, fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            Get started <span style={{ marginLeft: 2 }}>→</span>
          </Link>
        )}
      </div>
    </nav>
  );
}

export function FloatingMark() {
  return (
    <Link
      to="/"
      className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full flex items-center justify-center no-underline"
      style={{ background: "#000", border: "1px solid rgba(255,255,255,0.18)", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}
    >
      <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", color: "#fff", fontSize: "24px", lineHeight: 1, transform: "translateY(-1px)" }}>A</span>
    </Link>
  );
}

export function PillCTA({ to, children, dark = false, small = false }) {
  const base = {
    fontFamily: "Inter",
    fontWeight: 500,
    fontSize: small ? "11px" : "12px",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    borderRadius: "999px",
    transition: "transform 0.2s, box-shadow 0.2s",
  };
  const style = dark
    ? { ...base, background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.25)" }
    : { ...base, background: "#fff", color: "#000", border: "1px solid #fff" };
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2 no-underline ${small ? "px-5 py-2.5" : "px-7 py-3.5"}`}
      style={style}
    >
      {children} <span>→</span>
    </Link>
  );
}

export function SectionLabel({ children }) {
  return (
    <div
      className="text-[11px] uppercase mb-4"
      style={{ fontFamily: "Inter", fontWeight: 500, letterSpacing: "0.22em", color: "rgba(255,255,255,0.5)" }}
    >
      {children}
    </div>
  );
}

export function EditorialHeading({ italic, rest, size = "lg", className = "" }) {
  const sizes = {
    xl: "text-5xl md:text-7xl",
    lg: "text-4xl md:text-6xl",
    md: "text-3xl md:text-5xl",
    sm: "text-2xl md:text-4xl",
  };
  return (
    <h2
      className={`${sizes[size]} ${className}`}
      style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, lineHeight: 1.05, letterSpacing: "-0.02em", color: "#fff" }}
    >
      <span style={{ fontStyle: "italic" }}>{italic}</span> {rest}
    </h2>
  );
}

export const darkCard = {
  background: "rgba(255,255,255,0.025)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: "20px",
};

export const indigoBlock = {
  background: "linear-gradient(180deg, #0f0a3d 0%, #2e1faa 45%, #5b4fe5 100%)",
  borderRadius: "28px",
};

export const skyBadge = {
  background: "rgba(186,230,253,0.95)",
  color: "#0c4a6e",
  fontFamily: "Inter",
  fontWeight: 500,
  fontSize: "11px",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  borderRadius: "999px",
  padding: "8px 18px",
  display: "inline-block",
};

export default function StackHomePage() {
  return (
    <div className="min-h-screen" style={{ background: "#000", color: "#fff" }}>
      <StackNav />

      <main className="max-w-6xl mx-auto px-6">

        {/* HERO */}
        <FadeSection className="pt-24 md:pt-32 pb-20 text-center">
          <div className="mb-7 flex justify-center">
            <span style={skyBadge}>Compliance-first AI for advisors</span>
          </div>
          <EditorialHeading italic="Less" rest={<>paperwork.<br/><span style={{ fontStyle: "italic" }}>More</span> advising.</>} size="xl" className="mb-6 max-w-4xl mx-auto" />
          <p className="max-w-xl mx-auto mb-10 text-lg" style={{ fontFamily: "Inter", color: "rgba(255,255,255,0.65)", lineHeight: 1.55 }}>
            A growing suite of focused AI tools that handle the writing, prep, and follow-up that fill an advisor's day — drafted in the time it takes to review them.
          </p>
          <div className="flex gap-3 items-center justify-center flex-wrap">
            <PillCTA to="/notes">Try AdvisorNotes</PillCTA>
            <PillCTA to="/decoder" dark>Decode a document</PillCTA>
          </div>
          <div className="mt-12 flex justify-center gap-8 flex-wrap text-[11px]" style={{ fontFamily: "Inter", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
            <span>Drafts only</span>
            <span>Always advisor-reviewed</span>
            <span>Never a recommendation</span>
          </div>
        </FadeSection>

        {/* TOOLS GRID */}
        <FadeSection id="tools" className="py-16">
          <div className="flex justify-between items-end mb-10 flex-wrap gap-4">
            <div>
              <SectionLabel>The stack</SectionLabel>
              <EditorialHeading italic="Eight" rest="tools. One discipline." size="md" />
            </div>
            <div className="text-[11px] uppercase" style={{ fontFamily: "Inter", letterSpacing: "0.18em", color: "rgba(255,255,255,0.5)" }}>
              {availableCount} available · {comingSoonCount} coming soon
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              if (tool.available) {
                return (
                  <Link
                    key={tool.id}
                    to={tool.href}
                    className="block no-underline group"
                    style={{ ...darkCard, padding: "26px", transition: "background 0.3s, transform 0.3s, border-color 0.3s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.025)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <Icon className="w-4 h-4" style={{ color: "#fff" }} strokeWidth={1.6} />
                      </div>
                      <ArrowUpRight className="w-4 h-4" style={{ color: "rgba(255,255,255,0.5)" }} strokeWidth={1.6} />
                    </div>
                    <div className="text-2xl mb-2" style={{ fontFamily: "'Instrument Serif', serif", color: "#fff", letterSpacing: "-0.01em" }}>
                      {tool.name === "AdvisorNotes" ? <>Advisor<span style={{ fontStyle: "italic" }}>Notes</span></> : tool.name}
                    </div>
                    <div className="text-[14px] leading-relaxed" style={{ fontFamily: "Inter", color: "rgba(255,255,255,0.6)" }}>{tool.description}</div>
                  </Link>
                );
              }
              return (
                <div key={tool.id} style={{ ...darkCard, padding: "26px", opacity: 0.55 }}>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <Icon className="w-4 h-4" style={{ color: "rgba(255,255,255,0.5)" }} strokeWidth={1.6} />
                    </div>
                    <span className="text-[10px] uppercase" style={{ fontFamily: "Inter", letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)" }}>
                      {tool.status || "Coming soon"}
                    </span>
                  </div>
                  <div className="text-2xl mb-2" style={{ fontFamily: "'Instrument Serif', serif", color: "rgba(255,255,255,0.85)", letterSpacing: "-0.01em" }}>{tool.name}</div>
                  <div className="text-[14px] leading-relaxed" style={{ fontFamily: "Inter", color: "rgba(255,255,255,0.45)" }}>{tool.description}</div>
                </div>
              );
            })}
          </div>
        </FadeSection>

        {/* INDIGO FEATURE BLOCK — SAVINGS */}
        <FadeSection id="savings" className="py-16">
          <div style={{ ...indigoBlock, padding: "56px 40px" }}>
            <SectionLabel>What it gives back</SectionLabel>
            <EditorialHeading italic="Hours" rest="back. Real money saved." size="md" className="mb-12 max-w-2xl" />
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl">
              <div>
                <div className="text-6xl mb-3 leading-none" style={{ fontFamily: "'Instrument Serif', serif", color: "#fff", fontVariantNumeric: "tabular-nums" }}>~5 hrs</div>
                <div className="text-sm leading-relaxed" style={{ fontFamily: "Inter", color: "rgba(255,255,255,0.75)" }}>saved per week on post-meeting paperwork</div>
              </div>
              <div>
                <div className="text-6xl mb-3 leading-none" style={{ fontFamily: "'Instrument Serif', serif", color: "#fff", fontVariantNumeric: "tabular-nums" }}>~$15k</div>
                <div className="text-sm leading-relaxed" style={{ fontFamily: "Inter", color: "rgba(255,255,255,0.75)" }}>in advisor time recaptured per year, per seat</div>
              </div>
              <div>
                <div className="text-6xl mb-3 leading-none" style={{ fontFamily: "'Instrument Serif', serif", color: "#fff", fontVariantNumeric: "tabular-nums" }}>$0</div>
                <div className="text-sm leading-relaxed" style={{ fontFamily: "Inter", color: "rgba(255,255,255,0.75)" }}>extra spent on writing tools, transcription, or paraplanner overflow</div>
              </div>
            </div>
            <div className="mt-10 max-w-2xl text-xs" style={{ fontFamily: "Inter", color: "rgba(255,255,255,0.5)", fontStyle: "italic" }}>
              Estimates based on a 30-meeting/month practice at $200/hr advisor time. Your mileage will vary.
            </div>
          </div>
        </FadeSection>

        {/* TRENDS */}
        <FadeSection id="trends" className="py-16">
          <div className="text-center mb-12">
            <SectionLabel>Where AI is going</SectionLabel>
            <EditorialHeading italic="Four" rest="shifts at the advisor's desk." size="md" className="max-w-3xl mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              ["01", "Note-taking is the first domino.", "Meeting recaps and CRM entries are where every practice starts."],
              ["02", "Compliance is the new differentiator.", "Generic AI tools won't survive an examiner's scrutiny."],
              ["03", "Human-in-the-loop is non-negotiable.", "AI assists. The advisor decides. Always."],
              ["04", "Your own data is the next frontier.", "The real value sits in your CRM, your meetings, your book."],
            ].map(([num, title, body]) => (
              <div key={num} style={{ ...darkCard, padding: "28px" }}>
                <div className="text-3xl mb-4 leading-none" style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", color: "rgba(255,255,255,0.55)", fontVariantNumeric: "tabular-nums" }}>{num}</div>
                <div className="text-xl mb-2" style={{ fontFamily: "'Instrument Serif', serif", color: "#fff", letterSpacing: "-0.01em" }}>{title}</div>
                <div className="text-[14px] leading-relaxed" style={{ fontFamily: "Inter", color: "rgba(255,255,255,0.6)" }}>{body}</div>
              </div>
            ))}
          </div>
        </FadeSection>

        {/* STAKES */}
        <FadeSection id="stakes" className="py-16">
          <div style={{ ...darkCard, padding: "48px 40px" }}>
            <SectionLabel>Why we're built different</SectionLabel>
            <EditorialHeading italic="Compliance" rest="is not a feature update." size="md" className="mb-10 max-w-2xl" />
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-8 max-w-4xl">
              {[
                ["Compliance-first prompts", "No fabrication. No recommendations. Disclosures preserved."],
                ["Drafts only, you sign off", "Nothing auto-sends. Your name stays on the work."],
                ["Built for 17a-4 / 4511", "Outputs flow into your books and records, not around them."],
                ["Honest about limits", "We're not your CCO. We don't pretend to be."],
              ].map(([title, body]) => (
                <div key={title}>
                  <div className="text-lg mb-1.5" style={{ fontFamily: "'Instrument Serif', serif", color: "#fff" }}>{title}</div>
                  <div className="text-[14px] leading-relaxed" style={{ fontFamily: "Inter", color: "rgba(255,255,255,0.6)" }}>{body}</div>
                </div>
              ))}
            </div>
          </div>
        </FadeSection>

        {/* COMPLIANCE — INDIGO */}
        <FadeSection id="compliance" className="py-16">
          <div style={{ ...indigoBlock, padding: "56px 40px" }}>
            <SectionLabel>A shared discipline</SectionLabel>
            <EditorialHeading italic="One" rest="discipline. Every tool." size="md" className="mb-10 max-w-2xl" />
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-8 max-w-5xl">
              {[
                ["Drafts only, never sends", "Nothing is auto-sent, auto-filed, or auto-shared. Every output requires your review before it leaves the page."],
                ["No fabrication of facts", "If your input doesn't say it, the output flags for follow-up. We don't invent details."],
                ["Disclosure language built in", "Client-facing tools ship with appropriate disclosures pre-loaded."],
                ["Subject to your firm's WSP", "All outputs are electronic communications under SEC 17a-4 and FINRA 4511. Run them through your supervisory process."],
              ].map(([label, body]) => (
                <div key={label}>
                  <div className="text-[11px] uppercase mb-2" style={{ fontFamily: "Inter", letterSpacing: "0.18em", color: "rgba(255,255,255,0.7)" }}>{label}</div>
                  <div className="text-[15px] leading-relaxed" style={{ fontFamily: "Inter", color: "rgba(255,255,255,0.85)" }}>{body}</div>
                </div>
              ))}
            </div>
          </div>
        </FadeSection>

        {/* CLOSING CTA */}
        <FadeSection className="py-20 text-center">
          <EditorialHeading italic="Ready" rest="to start drafting?" size="lg" className="mb-8" />
          <PillCTA to="/notes">Try it now</PillCTA>
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
