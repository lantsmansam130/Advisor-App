// AppShell — layout chrome for every authenticated page (AdvisorSuite/Folio language).
//
// Folio dashboard pattern:
//   - DARK sidebar (220px, `palette.ink` background) on the left, fixed.
//     Brand wordmark up top with a green dot. Nav buttons use opacity-white
//     text; active item highlights with cream text + green accent on the icon.
//     User menu lives at the bottom of the sidebar (avatar + name + sign-out).
//   - LIGHT cream main column on the right with a 60px sticky topbar.
//     Topbar shows just the page title in Fraunces serif (no "Workspace / X"
//     breadcrumb anymore — the active sidebar item already tells the user
//     where they are).

import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, MessageSquare, FileText, Plug, LogOut,
  ChevronUp,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { palette, BrandMark } from "../StackHomePage.jsx";
import { roleLabel } from "../lib/roleLabel.js";

const SIDEBAR_W = 220;

const NAV_SECTIONS = [
  {
    label: "Workspace",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Tools",
    items: [
      { to: "/app",     label: "AdvisorNotes",     icon: MessageSquare },
      { to: "/decoder", label: "Document Decoder", icon: FileText },
    ],
  },
  {
    label: "Account",
    items: [
      { to: "/settings/integrations", label: "Integrations", icon: Plug },
    ],
  },
];

function SidebarNavItem({ to, label, icon: Icon }) {
  return (
    <NavLink to={to} className="block no-underline">
      {({ isActive }) => (
        <div
          className="flex items-center gap-2.5 px-2.5 py-2 mb-px transition-all"
          style={{
            borderRadius: "10px",
            background: isActive ? "rgba(255,255,255,0.11)" : "transparent",
            color: isActive ? palette.paper : "rgba(255,255,255,0.5)",
          }}
          onMouseEnter={(e) => {
            if (!isActive) {
              e.currentTarget.style.background = "rgba(255,255,255,0.07)";
              e.currentTarget.style.color = "rgba(255,255,255,0.8)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive) {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "rgba(255,255,255,0.5)";
            }
          }}
        >
          <Icon
            className="w-4 h-4 flex-shrink-0"
            strokeWidth={1.6}
            style={{ color: isActive ? palette.green : "currentColor" }}
          />
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "13px",
            fontWeight: isActive ? 600 : 500,
            letterSpacing: "-0.005em",
          }}>
            {label}
          </span>
        </div>
      )}
    </NavLink>
  );
}

function SidebarUserMenu() {
  const { profile, firm, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const initials = (profile?.display_name || "?")
    .split(" ").map((s) => s[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

  return (
    <div ref={ref} className="relative">
      {open && (
        <div
          className="absolute bottom-full left-0 right-0 mb-2 py-1.5"
          style={{
            background: palette.paper,
            border: `1px solid ${palette.border}`,
            borderRadius: "12px",
            boxShadow: palette.shadowMd,
          }}
        >
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors"
            style={{
              color: palette.ink,
              fontFamily: "'Inter', sans-serif",
              fontSize: "13px",
              fontWeight: 500,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = palette.surface; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <LogOut className="w-3.5 h-3.5" strokeWidth={1.7} />
            Sign out
          </button>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2.5 px-2 py-2 transition-colors"
        style={{ borderRadius: "10px" }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: palette.indigo,
            color: "#fff",
            fontFamily: "'Fraunces', Georgia, serif",
            fontWeight: 600,
            fontSize: "13px",
          }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="truncate" style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "12.5px",
            fontWeight: 600,
            color: "rgba(255,255,255,0.85)",
            lineHeight: 1.3,
          }}>
            {profile?.display_name || "Advisor"}
          </div>
          <div className="truncate" style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "10.5px",
            color: "rgba(255,255,255,0.4)",
            lineHeight: 1.3,
            marginTop: "1px",
          }}>
            {firm?.name ? `${firm.name} · ${roleLabel(profile?.role)}` : profile?.email}
          </div>
        </div>
        <ChevronUp
          className="w-3.5 h-3.5 flex-shrink-0"
          strokeWidth={1.6}
          style={{
            color: "rgba(255,255,255,0.4)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.15s",
          }}
        />
      </button>
    </div>
  );
}

export default function AppShell({ children, breadcrumb, breadcrumbSub }) {
  const location = useLocation();

  // Default page title — best-effort from the route. Pages can override.
  const title = breadcrumb || (() => {
    const seg = location.pathname.split("/").filter(Boolean);
    if (seg.length === 0) return "Dashboard";
    const first = seg[seg.length - 1];
    return first.charAt(0).toUpperCase() + first.slice(1);
  })();

  return (
    <div className="min-h-screen flex" style={{ background: palette.surface, color: palette.ink }}>
      {/* Sidebar — DARK (Folio dashboard pattern) */}
      <aside
        className="hidden md:flex flex-col flex-shrink-0 fixed top-0 left-0 bottom-0 z-30"
        style={{
          width: `${SIDEBAR_W}px`,
          background: palette.ink,
        }}
      >
        {/* Brand */}
        <div
          className="flex items-center gap-2.5 px-5 pt-5 pb-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <Link to="/dashboard" className="no-underline">
            <BrandMark inverted size="sm" />
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto">
          {NAV_SECTIONS.map((section, i) => (
            <div key={section.label} className={i === 0 ? "" : "mt-4"}>
              <div
                className="px-2.5 pb-1.5"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.25)",
                }}
              >
                {section.label}
              </div>
              {section.items.map((item) => (
                <SidebarNavItem key={item.to} {...item} />
              ))}
            </div>
          ))}
        </nav>

        {/* Compliance footer */}
        <div
          className="px-5 py-3"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "10.5px",
            lineHeight: 1.4,
            letterSpacing: "0.02em",
            color: "rgba(255,255,255,0.30)",
          }}
        >
          Drafts only · Always advisor-reviewed · Never a recommendation
        </div>

        {/* User menu */}
        <div
          className="px-3 py-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          <SidebarUserMenu />
        </div>
      </aside>

      {/* Main column */}
      <div
        className="flex-1 flex flex-col min-w-0"
        style={{ marginLeft: `${SIDEBAR_W}px` }}
      >
        {/* Topbar — 60px, cream, sticky, page title in Fraunces */}
        <header
          className="sticky top-0 z-20 flex items-center px-7"
          style={{
            height: "60px",
            background: palette.paper,
            borderBottom: `1px solid ${palette.border}`,
          }}
        >
          <div className="min-w-0">
            <div className="flex items-baseline gap-3">
              <h1
                className="truncate"
                style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontWeight: 600,
                  fontSize: "17px",
                  letterSpacing: "-0.01em",
                  color: palette.ink,
                  lineHeight: 1.1,
                }}
              >
                {title}
              </h1>
              {breadcrumbSub && (
                <span style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "13px",
                  color: palette.ink60,
                }}>
                  {breadcrumbSub}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
