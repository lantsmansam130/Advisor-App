import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, FileText, BarChart3, Compass, ArrowUpRight } from "lucide-react";
import { useAuth } from "./contexts/AuthContext.jsx";

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
];

const availableCount = TOOLS.filter((t) => t.available).length;
const comingSoonCount = TOOLS.length - availableCount;

// AdvisorSuite palette — single source of truth.
// Mirrors Folio's tokens so both products share one visual system.
// Mirrors src/index.css :root variables; keep in sync.
//
// Legacy keys (paper, sand, charcoal, ash, dust, forest, sage, borderSubtle,
// borderMid, borderInk) are aliased to the new tokens so existing files
// resolve without per-file changes. Prefer the new keys in new code.
export const palette = {
  // Surfaces
  surface: "#faf5ee",       // primary page background
  surface2: "#f2eadd",      // recessed surface (e.g., segmented-control track)
  cream: "#faf5ee",         // alias of surface — kept so legacy `palette.cream` works
  paper: "#fbf7f0",         // card/panel surface (slightly lighter than surface)
  white: "#ffffff",         // pure white reserved for emphasized cards
  sand: "#f2eadd",          // alias of surface2

  // Ink ladder
  ink: "#2b231d",           // primary text + dark sidebar background
  charcoal: "#2b231d",      // alias of ink
  ink80: "rgba(43,35,29,0.82)",
  ink60: "rgba(43,35,29,0.62)",
  ink40: "rgba(43,35,29,0.46)",
  ink10: "rgba(43,35,29,0.08)",
  ash: "rgba(43,35,29,0.62)",   // alias of ink60 (legacy "secondary text")
  dust: "rgba(43,35,29,0.46)",  // alias of ink40 (legacy "tertiary text")

  // Accents
  green: "#2f8a5f",
  greenLight: "#e6f1ea",
  greenDark: "#236a49",
  forest: "#2f8a5f",        // alias of green (legacy primary CTA color)
  sage: "#236a49",          // alias of greenDark
  indigo: "#5b6cc9",
  indigoLight: "#ecedfb",
  amber: "#e69b34",
  amberLight: "#fdf2dd",
  red: "#d96c5b",
  redLight: "#fbe8e4",
  blue: "#4f8cc6",
  blueLight: "#e8f2fb",
  terracotta: "#d77a5a",
  terracottaLight: "#fbe7dd",

  // Borders
  border: "rgba(43,35,29,0.10)",
  borderStrong: "rgba(43,35,29,0.18)",
  borderSubtle: "rgba(43,35,29,0.10)",  // alias of border
  borderMid: "rgba(43,35,29,0.18)",     // alias of borderStrong
  borderInk: "rgba(251,247,240,0.10)",  // for use ON dark surfaces (cream-tinted)

  // Shadows (string values — drop straight into a `boxShadow` style)
  shadowSm: "0 2px 6px rgba(43,35,29,0.05)",
  shadowMd: "0 6px 22px rgba(43,35,29,0.07), 0 2px 8px rgba(43,35,29,0.04)",
  shadowLg: "0 22px 60px rgba(43,35,29,0.10), 0 6px 18px rgba(43,35,29,0.05)",
  shadowXl: "0 38px 90px rgba(43,35,29,0.14)",
};

// Kept for backwards-compat with existing imports; renders nothing.
export function AnimatedBackground() {
  return null;
}

// Brand wordmark — small green dot + Fraunces serif "AdvisorStack".
// Used in StackNav and AppShell sidebar (pass `inverted` for the dark sidebar).
export function BrandMark({ inverted = false, size = "md" }) {
  const fontSize = size === "sm" ? "18px" : "22px";
  const dotSize = size === "sm" ? "8px" : "9px";
  return (
    <span className="flex items-center gap-2.5 no-underline">
      <span
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: "50%",
          background: palette.green,
          flexShrink: 0,
        }}
      />
      <span style={{
        fontFamily: "'Fraunces', Georgia, serif",
        fontWeight: 700,
        color: inverted ? palette.paper : palette.ink,
        fontSize,
        letterSpacing: "-0.02em",
        lineHeight: 1,
      }}>
        Advisor<span style={{ fontStyle: "italic" }}>Stack</span>
      </span>
    </span>
  );
}

// StackNav — sticky translucent cream nav with backdrop-blur (Folio pattern).
// Sits flush at the top of marketing pages. NOT a floating dark pill anymore.
export function StackNav({ tool }) {
  const { user } = useAuth();
  return (
    <nav
      className="sticky top-0 z-50 px-6 md:px-8"
      style={{
        height: "68px",
        background: "rgba(250,245,238,0.85)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: `1px solid ${palette.border}`,
        display: "flex",
        alignItems: "center",
      }}
    >
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between gap-4">
        {/* TODO: swap to AdvisorSuite portal URL when portal launches */}
        <Link to="/" className="no-underline flex items-center gap-3 min-w-0">
          <BrandMark />
          {tool && (
            <span
              className="hidden sm:inline-flex items-center gap-2.5 truncate"
              style={{ fontFamily: "Inter", fontSize: "14px", color: palette.ink60 }}
            >
              <span style={{ color: palette.ink40 }}>/</span>
              <span className="truncate">{tool}</span>
            </span>
          )}
        </Link>

        <div className="flex items-center gap-2 flex-shrink-0">
          {user ? (
            <PillCTA to="/dashboard" variant="primary" small>
              Dashboard
            </PillCTA>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center px-3 py-2 no-underline transition-colors"
                style={{
                  color: palette.ink60,
                  fontFamily: "Inter",
                  fontWeight: 500,
                  fontSize: "14.5px",
                  borderRadius: "10px",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = palette.ink; e.currentTarget.style.background = palette.ink10; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = palette.ink60; e.currentTarget.style.background = "transparent"; }}
              >
                Advisor login
              </Link>
              <PillCTA to="/signup" variant="primary" small>
                Start free
              </PillCTA>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// FloatingMark — circular green-dotted "A" anchor in the bottom-right corner.
// Bounces back to home (eventually the AdvisorSuite portal).
export function FloatingMark() {
  return (
    /* TODO: swap to AdvisorSuite portal URL when portal launches */
    <Link
      to="/"
      className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full flex items-center justify-center no-underline transition-transform"
      style={{
        background: palette.ink,
        boxShadow: palette.shadowMd,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      <span style={{
        fontFamily: "'Fraunces', Georgia, serif",
        fontWeight: 700,
        fontStyle: "italic",
        color: palette.paper,
        fontSize: "22px",
        lineHeight: 1,
        transform: "translateY(-1px)",
      }}>A</span>
    </Link>
  );
}

// PillCTA — Folio button language. Variants:
//   "primary" → filled green pill, white text, soft green shadow (DEFAULT)
//   "ghost"   → transparent, ink-80 text, border-strong border
//   "outline" → white bg, ink text, border-strong border
//
// Backwards-compat: `dark={true}` (legacy) still works → maps to "outline".
// `small` keeps the smaller marketing-page sizing.
export function PillCTA({ to, children, variant, dark = false, small = false, type, onClick }) {
  // Resolve variant (variant prop wins; legacy `dark` falls through)
  const v = variant || (dark ? "outline" : "primary");

  const base = {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    fontSize: small ? "13.5px" : "14.5px",
    letterSpacing: "-0.005em",
    borderRadius: "999px",
    border: "1.5px solid transparent",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
    cursor: "pointer",
    textDecoration: "none",
  };

  const styles = {
    primary: {
      ...base,
      background: palette.green,
      color: "#fff",
      borderColor: palette.green,
      boxShadow: "0 4px 14px rgba(47,138,95,0.22)",
    },
    ghost: {
      ...base,
      background: "transparent",
      color: palette.ink80,
      borderColor: palette.borderStrong,
    },
    outline: {
      ...base,
      background: palette.paper,
      color: palette.ink,
      borderColor: palette.borderStrong,
    },
  };

  const hover = {
    primary: (e) => { e.currentTarget.style.background = palette.greenDark; e.currentTarget.style.borderColor = palette.greenDark; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 22px rgba(47,138,95,0.32)"; },
    ghost:   (e) => { e.currentTarget.style.color = palette.ink; e.currentTarget.style.borderColor = palette.ink; e.currentTarget.style.background = palette.paper; },
    outline: (e) => { e.currentTarget.style.borderColor = palette.ink; e.currentTarget.style.background = palette.ink; e.currentTarget.style.color = palette.paper; },
  };
  const unhover = {
    primary: (e) => { e.currentTarget.style.background = palette.green; e.currentTarget.style.borderColor = palette.green; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(47,138,95,0.22)"; },
    ghost:   (e) => { e.currentTarget.style.color = palette.ink80; e.currentTarget.style.borderColor = palette.borderStrong; e.currentTarget.style.background = "transparent"; },
    outline: (e) => { e.currentTarget.style.borderColor = palette.borderStrong; e.currentTarget.style.background = palette.paper; e.currentTarget.style.color = palette.ink; },
  };

  const className = `inline-flex items-center justify-center gap-2 ${small ? "px-5 py-2.5" : "px-7 py-3.5"}`;

  // Render as Link if `to` provided, else as button
  if (to) {
    return (
      <Link
        to={to}
        className={`${className} no-underline`}
        style={styles[v]}
        onMouseEnter={hover[v]}
        onMouseLeave={unhover[v]}
      >
        {children} <span style={{ marginLeft: 2 }}>→</span>
      </Link>
    );
  }
  return (
    <button
      type={type || "button"}
      onClick={onClick}
      className={className}
      style={styles[v]}
      onMouseEnter={hover[v]}
      onMouseLeave={unhover[v]}
    >
      {children} <span style={{ marginLeft: 2 }}>→</span>
    </button>
  );
}

// SectionLabel — Folio-style green pill chip eyebrow ("S-EYE" in their CSS).
// Replaces the legacy ash-colored tracked-uppercase text.
export function SectionLabel({ children }) {
  return (
    <span
      className="inline-flex items-center"
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: "12px",
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: palette.greenDark,
        background: palette.greenLight,
        padding: "5px 14px",
        borderRadius: "100px",
        marginBottom: "16px",
      }}
    >
      {children}
    </span>
  );
}

// EditorialHeading — Folio hero pattern: regular Fraunces 500 + italic word
// rendered in green at weight 600, with `opsz: 144` for a tighter optical size.
// `italic` is the green-italicized lead word; `rest` is the rest of the headline.
// `italicColor` lets dark sections override (e.g., a lighter accent on dark bg).
export function EditorialHeading({ italic, rest, size = "lg", className = "", color, italicColor }) {
  const sizes = {
    xl: "text-5xl md:text-7xl",
    lg: "text-4xl md:text-6xl",
    md: "text-3xl md:text-5xl",
    sm: "text-2xl md:text-4xl",
  };
  return (
    <h2
      className={`${sizes[size]} ${className}`}
      style={{
        fontFamily: "'Fraunces', Georgia, serif",
        fontWeight: 500,
        lineHeight: 1.08,
        letterSpacing: "-0.018em",
        color: color || palette.ink,
        fontVariationSettings: '"opsz" 96',
      }}
    >
      <span style={{
        fontStyle: "italic",
        fontWeight: 600,
        color: italicColor || palette.green,
        fontVariationSettings: '"opsz" 144',
      }}>{italic}</span>{" "}{rest}
    </h2>
  );
}

// Cream card on surface background — Folio's standard panel surface.
// Legacy export name `darkCard` retained for backwards-compat with imports.
export const darkCard = {
  background: palette.paper,
  border: `1px solid ${palette.border}`,
  borderRadius: "20px",
  boxShadow: palette.shadowSm,
};

// Deep ink section — warm charcoal for the dark feature block rhythm.
export const inkBlock = {
  background: "linear-gradient(160deg, #3d342d 0%, #2b231d 100%)",
  borderRadius: "28px",
  color: palette.paper,
};

// Indigo gradient feature block (legacy name) — now uses the same warm
// dark gradient as Folio's CTA blocks.
export const indigoBlock = {
  background: "linear-gradient(160deg, #3d342d 0%, #2b231d 100%)",
  borderRadius: "28px",
};

// Sky badge (legacy name) — now Folio's green-light pill chip.
// Prefer <SectionLabel> for new code; this object is kept for direct-spread uses.
export const skyBadge = {
  background: palette.greenLight,
  color: palette.greenDark,
  fontFamily: "'Inter', sans-serif",
  fontWeight: 600,
  fontSize: "12px",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  borderRadius: "100px",
  padding: "5px 14px",
  display: "inline-block",
};

export default function StackHomePage() {
  return (
    <div className="min-h-screen" style={{ background: palette.cream, color: palette.ink }}>
      <StackNav />

      <main className="max-w-6xl mx-auto px-6">

        {/* HERO */}
        <FadeSection className="pt-24 md:pt-32 pb-20 text-center">
          <div className="mb-7 flex justify-center">
            <span style={skyBadge}>Compliance-first AI for advisors</span>
          </div>
          <EditorialHeading italic="Less" rest={<>paperwork.<br/><span style={{ fontStyle: "italic" }}>More</span> advising.</>} size="xl" className="mb-6 max-w-4xl mx-auto" />
          <p className="max-w-xl mx-auto mb-10 text-lg" style={{ fontFamily: "Inter", color: palette.ash, lineHeight: 1.55 }}>
            A growing suite of focused AI tools that handle the writing, prep, and follow-up that fill an advisor's day — drafted in the time it takes to review them.
          </p>
          <div className="flex gap-3 items-center justify-center flex-wrap">
            <PillCTA to="/notes">Try AdvisorNotes</PillCTA>
            <PillCTA to="/decoder" dark>Decode a document</PillCTA>
          </div>
          <div className="mt-12 flex justify-center gap-8 flex-wrap text-[11px]" style={{ fontFamily: "Inter", letterSpacing: "0.18em", textTransform: "uppercase", color: palette.dust }}>
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
              <EditorialHeading italic="Two" rest="live. Two on the way." size="md" />
            </div>
            <div className="text-[11px] uppercase" style={{ fontFamily: "Inter", letterSpacing: "0.18em", color: palette.ash }}>
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
                    style={{ ...darkCard, padding: "26px", transition: "transform 0.3s, box-shadow 0.3s, border-color 0.3s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = palette.borderMid; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 2px 4px rgba(15,14,12,0.06), 0 16px 32px -16px rgba(15,14,12,0.18)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = palette.borderSubtle; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 2px rgba(15,14,12,0.04), 0 8px 24px -16px rgba(15,14,12,0.12)"; }}
                  >
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(31,58,46,0.06)" }}>
                        <Icon className="w-4 h-4" style={{ color: palette.forest }} strokeWidth={1.6} />
                      </div>
                      <ArrowUpRight className="w-4 h-4" style={{ color: palette.ash }} strokeWidth={1.6} />
                    </div>
                    <div className="text-2xl mb-2" style={{ fontFamily: "'Fraunces', Georgia, serif", color: palette.ink, letterSpacing: "-0.01em" }}>
                      {tool.name === "AdvisorNotes" ? <>Advisor<span style={{ fontStyle: "italic" }}>Notes</span></> : tool.name}
                    </div>
                    <div className="text-[14px] leading-relaxed" style={{ fontFamily: "Inter", color: palette.ash }}>{tool.description}</div>
                  </Link>
                );
              }
              return (
                <div key={tool.id} style={{ ...darkCard, padding: "26px", opacity: 0.7 }}>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(15,14,12,0.04)" }}>
                      <Icon className="w-4 h-4" style={{ color: palette.dust }} strokeWidth={1.6} />
                    </div>
                    <span className="text-[10px] uppercase" style={{ fontFamily: "Inter", letterSpacing: "0.18em", color: palette.dust }}>
                      {tool.status || "Coming soon"}
                    </span>
                  </div>
                  <div className="text-2xl mb-2" style={{ fontFamily: "'Fraunces', Georgia, serif", color: palette.ink, letterSpacing: "-0.01em", opacity: 0.85 }}>{tool.name}</div>
                  <div className="text-[14px] leading-relaxed" style={{ fontFamily: "Inter", color: palette.ash }}>{tool.description}</div>
                </div>
              );
            })}
          </div>
        </FadeSection>

        {/* INK FEATURE BLOCK — SAVINGS (warm charcoal, contrasts the cream) */}
        <FadeSection id="savings" className="py-16">
          <div style={{ ...inkBlock, padding: "56px 40px" }}>
            <div className="text-[11px] uppercase mb-4" style={{ fontFamily: "Inter", fontWeight: 500, letterSpacing: "0.22em", color: "rgba(250,246,238,0.55)" }}>
              What it gives back
            </div>
            <EditorialHeading italic="Hours" rest="back. Real money saved." size="md" className="mb-12 max-w-2xl" color={palette.cream} />
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl">
              <div>
                <div className="text-6xl mb-3 leading-none" style={{ fontFamily: "'Fraunces', Georgia, serif", color: palette.cream, fontVariantNumeric: "tabular-nums" }}>~5 hrs</div>
                <div className="text-sm leading-relaxed" style={{ fontFamily: "Inter", color: "rgba(250,246,238,0.65)" }}>saved per week on post-meeting paperwork</div>
              </div>
              <div>
                <div className="text-6xl mb-3 leading-none" style={{ fontFamily: "'Fraunces', Georgia, serif", color: palette.cream, fontVariantNumeric: "tabular-nums" }}>~$15k</div>
                <div className="text-sm leading-relaxed" style={{ fontFamily: "Inter", color: "rgba(250,246,238,0.65)" }}>in advisor time recaptured per year, per seat</div>
              </div>
              <div>
                <div className="text-6xl mb-3 leading-none" style={{ fontFamily: "'Fraunces', Georgia, serif", color: palette.cream, fontVariantNumeric: "tabular-nums" }}>$0</div>
                <div className="text-sm leading-relaxed" style={{ fontFamily: "Inter", color: "rgba(250,246,238,0.65)" }}>extra spent on writing tools, transcription, or paraplanner overflow</div>
              </div>
            </div>
            <div className="mt-10 max-w-2xl text-xs" style={{ fontFamily: "Inter", color: "rgba(250,246,238,0.45)", fontStyle: "italic" }}>
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
                <div className="text-3xl mb-4 leading-none" style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic", color: palette.dust, fontVariantNumeric: "tabular-nums" }}>{num}</div>
                <div className="text-xl mb-2" style={{ fontFamily: "'Fraunces', Georgia, serif", color: palette.ink, letterSpacing: "-0.01em" }}>{title}</div>
                <div className="text-[14px] leading-relaxed" style={{ fontFamily: "Inter", color: palette.ash }}>{body}</div>
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
                  <div className="text-lg mb-1.5" style={{ fontFamily: "'Fraunces', Georgia, serif", color: palette.ink }}>{title}</div>
                  <div className="text-[14px] leading-relaxed" style={{ fontFamily: "Inter", color: palette.ash }}>{body}</div>
                </div>
              ))}
            </div>
          </div>
        </FadeSection>

        {/* COMPLIANCE — FOREST */}
        <FadeSection id="compliance" className="py-16">
          <div style={{ ...indigoBlock, padding: "56px 40px", color: palette.cream }}>
            <div className="text-[11px] uppercase mb-4" style={{ fontFamily: "Inter", fontWeight: 500, letterSpacing: "0.22em", color: "rgba(250,246,238,0.6)" }}>
              A shared discipline
            </div>
            <EditorialHeading italic="One" rest="discipline. Every tool." size="md" className="mb-10 max-w-2xl" color={palette.cream} />
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-8 max-w-5xl">
              {[
                ["Drafts only, never sends", "Nothing is auto-sent, auto-filed, or auto-shared. Every output requires your review before it leaves the page."],
                ["No fabrication of facts", "If your input doesn't say it, the output flags for follow-up. We don't invent details."],
                ["Disclosure language built in", "Client-facing tools ship with appropriate disclosures pre-loaded."],
                ["Subject to your firm's WSP", "All outputs are electronic communications under SEC 17a-4 and FINRA 4511. Run them through your supervisory process."],
              ].map(([label, body]) => (
                <div key={label}>
                  <div className="text-[11px] uppercase mb-2" style={{ fontFamily: "Inter", letterSpacing: "0.18em", color: "rgba(250,246,238,0.7)" }}>{label}</div>
                  <div className="text-[15px] leading-relaxed" style={{ fontFamily: "Inter", color: "rgba(250,246,238,0.85)" }}>{body}</div>
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

        <footer className="py-10 flex justify-between flex-wrap gap-3 text-[11px]" style={{ fontFamily: "Inter", letterSpacing: "0.18em", textTransform: "uppercase", color: palette.dust, borderTop: `1px solid ${palette.borderSubtle}` }}>
          <span>Advisor Stack — Prototype</span>
          <span>Not a substitute for compliance review · Not investment advice</span>
        </footer>
      </main>

      <FloatingMark />
    </div>
  );
}
