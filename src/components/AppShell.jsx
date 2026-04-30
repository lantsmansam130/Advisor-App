// AppShell — layout chrome for every authenticated page.
// Persistent left sidebar (240px) + top bar with breadcrumb + user dropdown.
// Light, calm professional-services dashboard feel — extends the existing
// Advisor Stack design system (warm cream bg, Instrument Serif italic display,
// forest green accent, white surfaces with subtle borders).

import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, MessageSquare, FileText, Plug, LogOut,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { palette } from "../StackHomePage.jsx";
import { roleLabel } from "../lib/roleLabel.js";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app", label: "AdvisorNotes", icon: MessageSquare },
  { to: "/decoder", label: "Document Decoder", icon: FileText },
  { to: "/settings/integrations", label: "Integrations", icon: Plug },
];

function SidebarNavItem({ to, label, icon: Icon, disabled, comingSoon }) {
  const inner = (active) => (
    <div
      className="flex items-center gap-2.5 px-3 py-2 mx-2 mb-0.5 transition-colors"
      style={{
        borderRadius: "10px",
        background: active ? palette.cream : "transparent",
        color: active ? palette.forest : (disabled ? palette.dust : palette.ink),
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.55 : 1,
      }}
    >
      <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.6} />
      <span className="text-[14px] flex-1" style={{ fontFamily: "Inter", fontWeight: active ? 500 : 400 }}>
        {label}
      </span>
      {comingSoon && (
        <span className="text-[9px] uppercase" style={{ fontFamily: "Inter", letterSpacing: "0.16em", color: palette.dust }}>
          Soon
        </span>
      )}
    </div>
  );

  if (disabled) {
    return inner(false);
  }
  return (
    <NavLink to={to} className="block no-underline">
      {({ isActive }) => inner(isActive)}
    </NavLink>
  );
}

function UserMenu() {
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
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-2 py-1.5 transition-colors"
        style={{ borderRadius: "999px" }}
        onMouseEnter={(e) => { e.currentTarget.style.background = palette.cream; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[11px]"
          style={{ background: palette.ink, color: palette.cream, fontFamily: "Inter", fontWeight: 500, letterSpacing: "0.05em" }}
        >
          {initials}
        </div>
        <span className="text-[13px] hidden md:inline" style={{ fontFamily: "Inter", color: palette.ink, fontWeight: 500 }}>
          {profile?.display_name || "Advisor"}
        </span>
        <ChevronDown className="w-3.5 h-3.5" style={{ color: palette.ash }} />
      </button>
      {open && (
        <div
          className="absolute right-0 mt-2 w-64 z-30 py-2"
          style={{
            background: palette.paper,
            border: `1px solid ${palette.borderSubtle}`,
            borderRadius: "12px",
            boxShadow: "0 8px 24px -8px rgba(15,14,12,0.18)",
          }}
        >
          <div className="px-3 py-2 mb-1">
            <div className="text-[14px]" style={{ fontFamily: "Inter", color: palette.ink, fontWeight: 500 }}>
              {profile?.display_name}
            </div>
            <div className="text-[12px] truncate" style={{ fontFamily: "Inter", color: palette.ash }}>
              {profile?.email}
            </div>
            {firm?.name && (
              <div className="mt-1 text-[10px] uppercase" style={{ fontFamily: "Inter", letterSpacing: "0.18em", color: palette.dust }}>
                {firm.name} · {roleLabel(profile?.role)}
              </div>
            )}
          </div>
          <div style={{ borderTop: `1px solid ${palette.borderSubtle}` }} />
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 px-3 py-2 mt-1 text-left transition-colors"
            style={{ color: palette.ink, fontFamily: "Inter", fontSize: "13px" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = palette.cream; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <LogOut className="w-3.5 h-3.5" style={{ color: palette.ash }} strokeWidth={1.6} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export default function AppShell({ children, breadcrumb }) {
  const location = useLocation();

  // Default breadcrumb: best-effort from the route name.
  const inferred = breadcrumb || (() => {
    const seg = location.pathname.split("/").filter(Boolean);
    if (seg.length === 0) return "Dashboard";
    return seg[0].charAt(0).toUpperCase() + seg[0].slice(1);
  })();

  return (
    <div className="min-h-screen flex" style={{ background: palette.cream, color: palette.ink }}>
      {/* Sidebar */}
      <aside
        className="hidden md:flex flex-col flex-shrink-0"
        style={{
          width: "240px",
          background: palette.paper,
          borderRight: `1px solid ${palette.borderSubtle}`,
        }}
      >
        <div className="px-4 pt-5 pb-3">
          <Link to="/dashboard" className="flex items-center gap-2 no-underline">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: palette.ink }}>
              <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", color: palette.cream, fontSize: "17px", lineHeight: 1, transform: "translateY(-1px)" }}>A</span>
            </div>
            <span style={{ fontFamily: "'Instrument Serif', serif", color: palette.ink, fontSize: "20px", letterSpacing: "-0.01em", lineHeight: 1 }}>
              Advisor<span style={{ fontStyle: "italic" }}>Stack</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 mt-2">
          <div className="text-[10px] uppercase mb-1 px-5" style={{ fontFamily: "Inter", fontWeight: 500, letterSpacing: "0.2em", color: palette.dust }}>
            Workspace
          </div>
          {NAV.slice(0, 1).map((item) => <SidebarNavItem key={item.to} {...item} />)}
          <div className="text-[10px] uppercase mb-1 mt-4 px-5" style={{ fontFamily: "Inter", fontWeight: 500, letterSpacing: "0.2em", color: palette.dust }}>
            Tools
          </div>
          {NAV.slice(1, 3).map((item) => <SidebarNavItem key={item.to} {...item} />)}
          <div className="text-[10px] uppercase mb-1 mt-4 px-5" style={{ fontFamily: "Inter", fontWeight: 500, letterSpacing: "0.2em", color: palette.dust }}>
            Account
          </div>
          {NAV.slice(3).map((item) => <SidebarNavItem key={item.to} {...item} />)}
        </nav>

        <div className="px-5 py-4 text-[10px] leading-snug" style={{ fontFamily: "Inter", letterSpacing: "0.06em", color: palette.dust, borderTop: `1px solid ${palette.borderSubtle}` }}>
          Drafts only · Always advisor-reviewed · Never a recommendation
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header
          className="flex items-center justify-between px-6 py-3"
          style={{ background: palette.paper, borderBottom: `1px solid ${palette.borderSubtle}` }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Link to="/dashboard" className="text-[12px] no-underline" style={{ fontFamily: "Inter", color: palette.ash }}>
              Workspace
            </Link>
            <span style={{ color: palette.dust }}>/</span>
            <span className="text-[12px] truncate" style={{ fontFamily: "Inter", color: palette.ink, fontWeight: 500 }}>
              {inferred}
            </span>
          </div>
          <UserMenu />
        </header>

        {/* Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
