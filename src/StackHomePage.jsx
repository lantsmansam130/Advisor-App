import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, FileText, BarChart3, Compass, ShieldAlert, Heart, FileCog, FilePen } from "lucide-react";

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

function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const onScroll = () => setY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return y;
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
        transform: visible ? "translateY(0) scale(1)" : "translateY(40px) scale(0.97)",
        transition: "opacity 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)",
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

export function AnimatedBackground() {
  const canvasRef = useRef(null);
  const scrollY = useScrollY();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const N = 60;
    const parts = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.6 + 0.4,
    }));
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      parts.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(30, 27, 75, 0.35)";
        ctx.fill();
      });
      for (let i = 0; i < parts.length; i++) {
        for (let j = i + 1; j < parts.length; j++) {
          const dx = parts[i].x - parts[j].x;
          const dy = parts[i].y - parts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            ctx.beginPath();
            ctx.moveTo(parts[i].x, parts[i].y);
            ctx.lineTo(parts[j].x, parts[j].y);
            ctx.strokeStyle = `rgba(30, 27, 75, ${0.18 * (1 - d / 110)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-0" style={{ background: "linear-gradient(135deg, #d4e4ff 0%, #e8d4f5 35%, #ffd4e8 65%, #d4f0e0 100%)" }} />
      <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: "linear-gradient(rgba(30,27,75,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(30,27,75,0.06) 1px, transparent 1px)", backgroundSize: "48px 48px", backgroundPosition: `0 ${scrollY * 0.3}px` }} />
      <div className="fixed pointer-events-none z-0" style={{ top: "10%", left: "-5%", width: "32rem", height: "32rem", background: "rgba(110, 231, 183, 0.45)", borderRadius: "50%", filter: "blur(60px)", transform: `translate(${scrollY * 0.1}px, ${scrollY * -0.2}px)` }} />
      <div className="fixed pointer-events-none z-0" style={{ top: "30%", right: "-8%", width: "28rem", height: "28rem", background: "rgba(165, 180, 252, 0.55)", borderRadius: "50%", filter: "blur(60px)", transform: `translate(${scrollY * -0.15}px, ${scrollY * 0.1}px)` }} />
      <div className="fixed pointer-events-none z-0" style={{ bottom: "10%", left: "30%", width: "30rem", height: "30rem", background: "rgba(252, 165, 165, 0.4)", borderRadius: "50%", filter: "blur(60px)", transform: `translate(${scrollY * 0.2}px, ${scrollY * -0.1}px)` }} />
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
    </>
  );
}

export function StackNav({ tool }) {
  return (
    <nav className="mx-6 mt-6">
      <div className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center" style={{ background: "rgba(255,255,255,0.55)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.7)", borderRadius: "16px", boxShadow: "0 8px 32px rgba(31,38,135,0.08)" }}>
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: "rgba(30,27,75,0.95)", boxShadow: "0 2px 10px rgba(30,27,75,0.35)" }}>
            <span style={{ fontFamily: "Georgia, serif", fontStyle: "italic", color: "#fff", fontSize: "16px" }}>A</span>
          </div>
          <div className="text-xl" style={{ fontFamily: "Georgia, serif", color: "#0a0f1f" }}>
            Advisor<span className="italic" style={{ color: "#1e1b4b" }}>Stack</span>
          </div>
          {tool && (
            <>
              <span style={{ color: "#94a3b8", margin: "0 6px", fontFamily: "Georgia, serif" }}>/</span>
              <span style={{ fontFamily: "Georgia, serif", color: "#1f2937", fontSize: "15px" }}>{tool}</span>
            </>
          )}
        </Link>
        <div className="flex gap-7 items-center" style={{ fontFamily: "system-ui", fontSize: "13px", color: "#1f2937" }}>
          {tool ? (
            <Link to="/" className="hover:opacity-70 no-underline" style={{ color: "#1f2937" }}>← All tools</Link>
          ) : (
            <>
              <a href="#tools" className="hover:opacity-70 no-underline" style={{ color: "#1f2937" }}>Tools</a>
              <a href="#compliance" className="hover:opacity-70 no-underline" style={{ color: "#1f2937" }}>Compliance</a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default function StackHomePage() {
  return (
    <div className="min-h-screen relative" style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: "#0a0f1f" }}>
      <AnimatedBackground />

      <div className="relative z-10">
        <StackNav />

        <div className="max-w-6xl mx-auto px-6">

          <FadeSection className="pt-20 pb-14">
            <div className="text-xs uppercase tracking-[0.22em] mb-5" style={{ fontFamily: "system-ui", color: "#1e1b4b" }}>
              A growing suite of compliance-first AI tools
            </div>
            <h1 className="text-5xl md:text-6xl leading-tight mb-6 max-w-4xl" style={{ fontFamily: "Georgia, serif", fontWeight: 400, letterSpacing: "-0.02em", color: "#0a0f1f" }}>
              The AI toolkit, <span className="italic" style={{ color: "#1e1b4b" }}>built for the way advisors actually work</span>.
            </h1>
            <p className="text-xl leading-relaxed max-w-2xl mb-7" style={{ fontFamily: "Georgia, serif", color: "#1f2937" }}>
              A growing set of focused tools that take the friction out of the paperwork, prep work, and back-office writing that fills your day. Every output is yours to review before it goes anywhere.
            </p>
            <div className="text-xs uppercase tracking-[0.2em] pt-5 max-w-2xl" style={{ fontFamily: "system-ui", color: "#1e1b4b", borderTop: "1px solid rgba(30,27,75,0.2)" }}>
              Drafts only · Always advisor-reviewed · Never a recommendation
            </div>
          </FadeSection>

          <FadeSection id="tools" className="py-14">
            <div className="flex justify-between items-baseline mb-7 flex-wrap gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] mb-2" style={{ fontFamily: "system-ui", color: "#1e1b4b" }}>The stack</div>
                <h2 className="text-3xl leading-tight" style={{ fontFamily: "Georgia, serif", fontWeight: 400, color: "#0a0f1f" }}>
                  Eight tools. One discipline.
                </h2>
              </div>
              <div className="text-xs uppercase tracking-[0.18em]" style={{ fontFamily: "system-ui", color: "#1e1b4b" }}>
                {availableCount} available · {comingSoonCount} coming soon
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {TOOLS.map((tool) => {
                const Icon = tool.icon;
                if (tool.available) {
                  return (
                    <Link key={tool.id} to={tool.href} className="block no-underline group" style={{
                      background: "rgba(255,255,255,0.55)",
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                      border: "1px solid rgba(30,27,75,0.4)",
                      borderRadius: "16px",
                      padding: "22px",
                      boxShadow: "0 8px 32px rgba(31,38,135,0.1)",
                      transition: "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px) scale(1.01)"; e.currentTarget.style.boxShadow = "0 16px 48px rgba(31,38,135,0.18)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0) scale(1)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(31,38,135,0.1)"; }}
                    >
                      <div className="flex items-center justify-between mb-3.5">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(30,27,75,0.12)" }}>
                          <Icon className="w-4.5 h-4.5" style={{ color: "#1e1b4b" }} strokeWidth={1.8} />
                        </div>
                        <div className="text-xs uppercase tracking-[0.18em]" style={{ fontFamily: "system-ui", color: "#1e1b4b" }}>Available now →</div>
                      </div>
                      <div className="text-2xl mb-2" style={{ fontFamily: "Georgia, serif", color: "#0a0f1f" }}>
                        {tool.name === "AdvisorNotes" ? <>Advisor<span className="italic" style={{ color: "#1e1b4b" }}>Notes</span></> : tool.name}
                      </div>
                      <div className="text-sm leading-relaxed" style={{ fontFamily: "Georgia, serif", color: "#1f2937" }}>{tool.description}</div>
                    </Link>
                  );
                }
                return (
                  <div key={tool.id} style={{
                    background: "rgba(255,255,255,0.32)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    border: "1px solid rgba(255,255,255,0.5)",
                    borderRadius: "16px",
                    padding: "22px",
                    boxShadow: "0 8px 32px rgba(31,38,135,0.06)",
                    opacity: 0.78,
                  }}>
                    <div className="flex items-center justify-between mb-3.5">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(71,85,105,0.12)" }}>
                        <Icon className="w-4.5 h-4.5" style={{ color: "#475569" }} strokeWidth={1.8} />
                      </div>
                      <div className="text-xs uppercase tracking-[0.18em]" style={{ fontFamily: "system-ui", color: "#475569" }}>
                        {tool.status || "Coming soon"}
                      </div>
                    </div>
                    <div className="text-2xl mb-2" style={{ fontFamily: "Georgia, serif", color: "#1e293b" }}>{tool.name}</div>
                    <div className="text-sm leading-relaxed" style={{ fontFamily: "Georgia, serif", color: "#475569" }}>{tool.description}</div>
                  </div>
                );
              })}
            </div>
          </FadeSection>

          <FadeSection id="compliance" className="py-14">
            <div style={{
              background: "rgba(254,251,243,0.55)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(232,220,192,0.7)",
              borderRadius: "16px",
              padding: "32px",
              boxShadow: "0 8px 32px rgba(31,38,135,0.08)",
            }}>
              <div className="text-xs uppercase tracking-[0.22em] mb-4" style={{ fontFamily: "system-ui", color: "#1e1b4b" }}>A shared discipline</div>
              <h2 className="text-3xl leading-tight mb-7 max-w-2xl" style={{ fontFamily: "Georgia, serif", fontWeight: 400, color: "#0a0f1f" }}>
                Every tool in the stack follows the same compliance posture.
              </h2>
              <div className="grid md:grid-cols-2 gap-9 max-w-5xl text-[15px] leading-relaxed" style={{ fontFamily: "Georgia, serif" }}>
                {[
                  ["Drafts only, never sends", "Nothing is auto-sent, auto-filed, or auto-shared. Every output requires your review before it leaves the page."],
                  ["No fabrication of facts", "If your input doesn't say it, the output flags for follow-up. We don't invent details."],
                  ["Disclosure language built in", "Client-facing tools ship with appropriate disclosures pre-loaded."],
                  ["Subject to your firm's WSP", "All outputs are electronic communications under SEC 17a-4 and FINRA 4511. Run them through your supervisory process."],
                ].map(([label, body]) => (
                  <div key={label}>
                    <div className="text-xs uppercase tracking-[0.15em] mb-2" style={{ fontFamily: "system-ui", color: "#1e1b4b" }}>{label}</div>
                    <div style={{ color: "#1f2937" }}>{body}</div>
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
