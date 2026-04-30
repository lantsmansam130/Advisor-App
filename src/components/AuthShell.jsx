// AuthShell — shared chrome for unauthenticated auth pages
// (/login, /signup, /forgot-password, /reset-password, /verify-email).
// Cream page + wordmark header + centered card + back-to-home link.
// Each page renders its own form/copy as children.

import { Link } from "react-router-dom";
import { palette } from "../StackHomePage.jsx";

export function GoogleG({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 18 18" className={className} aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.17-1.84H9v3.49h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A8.99 8.99 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.97 10.71A5.4 5.4 0 0 1 3.68 9c0-.59.1-1.17.29-1.71V4.96H.96A8.99 8.99 0 0 0 0 9c0 1.45.35 2.83.96 4.04l3.01-2.33z"/>
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.59-2.59C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"/>
    </svg>
  );
}

export function AuthInput({ label, type = "text", value, onChange, autoComplete, required, placeholder, autoFocus, name }) {
  return (
    <label className="block text-left">
      <span className="text-[11px] uppercase block mb-1.5" style={{ fontFamily: "Inter", fontWeight: 500, letterSpacing: "0.18em", color: palette.ash }}>
        {label}
      </span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required={required}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full outline-none transition-colors"
        style={{
          background: palette.cream,
          color: palette.ink,
          border: `1px solid ${palette.borderMid}`,
          borderRadius: "10px",
          padding: "10px 12px",
          fontFamily: "Inter",
          fontSize: "14px",
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = palette.forest; e.currentTarget.style.background = palette.paper; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = palette.borderMid; e.currentTarget.style.background = palette.cream; }}
      />
    </label>
  );
}

export function AuthPrimaryButton({ children, type = "submit", onClick, disabled, loading }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full inline-flex items-center justify-center gap-2 py-3 disabled:opacity-50 transition-all"
      style={{
        background: palette.ink,
        color: palette.cream,
        border: `1px solid ${palette.ink}`,
        borderRadius: "999px",
        fontFamily: "Inter",
        fontWeight: 500,
        fontSize: "13px",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        cursor: disabled || loading ? "not-allowed" : "pointer",
      }}
    >
      {loading ? "Working…" : children}
    </button>
  );
}

export function AuthGhostButton({ children, type = "button", onClick, disabled, loading }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full inline-flex items-center justify-center gap-3 py-3 disabled:opacity-50 transition-all"
      style={{
        background: palette.paper,
        color: palette.ink,
        border: `1px solid ${palette.borderMid}`,
        borderRadius: "999px",
        fontFamily: "Inter",
        fontWeight: 500,
        fontSize: "14px",
        cursor: disabled || loading ? "not-allowed" : "pointer",
      }}
      onMouseEnter={(e) => { if (!e.currentTarget.disabled) { e.currentTarget.style.background = palette.cream; } }}
      onMouseLeave={(e) => { e.currentTarget.style.background = palette.paper; }}
    >
      {children}
    </button>
  );
}

export function AuthDivider({ label = "or" }) {
  return (
    <div className="my-5 flex items-center gap-3">
      <div className="flex-1" style={{ height: 1, background: palette.borderSubtle }} />
      <span className="text-[10px] uppercase" style={{ fontFamily: "Inter", letterSpacing: "0.18em", color: palette.dust }}>
        {label}
      </span>
      <div className="flex-1" style={{ height: 1, background: palette.borderSubtle }} />
    </div>
  );
}

export function AuthError({ children }) {
  if (!children) return null;
  return (
    <p className="mt-4 text-[12px] leading-snug text-left" style={{ fontFamily: "Inter", color: "#B5483B" }}>
      {children}
    </p>
  );
}

export function AuthInfo({ children }) {
  if (!children) return null;
  return (
    <p className="mt-4 text-[12px] leading-snug text-left" style={{ fontFamily: "Inter", color: palette.forest }}>
      {children}
    </p>
  );
}

export default function AuthShell({ eyebrow, headlineItalic, headlineRest, intro, children, footer }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: palette.cream, color: palette.ink }}>
      <header className="px-6 pt-6">
        <Link to="/" className="inline-flex items-center gap-2 no-underline">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: palette.ink }}>
            <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", color: palette.cream, fontSize: "17px", lineHeight: 1, transform: "translateY(-1px)" }}>A</span>
          </div>
          <span style={{ fontFamily: "'Instrument Serif', serif", color: palette.ink, fontSize: "20px", letterSpacing: "-0.01em", lineHeight: 1 }}>
            Advisor<span style={{ fontStyle: "italic" }}>Stack</span>
          </span>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div
            className="px-8 py-9"
            style={{
              background: palette.paper,
              border: `1px solid ${palette.borderSubtle}`,
              borderRadius: "20px",
              boxShadow: "0 1px 2px rgba(15,14,12,0.04), 0 8px 24px -16px rgba(15,14,12,0.12)",
            }}
          >
            {eyebrow && (
              <div className="text-[11px] uppercase mb-4 text-center" style={{ fontFamily: "Inter", fontWeight: 500, letterSpacing: "0.22em", color: palette.ash }}>
                {eyebrow}
              </div>
            )}
            {(headlineItalic || headlineRest) && (
              <h1
                className="text-4xl mb-3 text-center"
                style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.02em", color: palette.ink }}
              >
                {headlineItalic && <span style={{ fontStyle: "italic" }}>{headlineItalic}</span>}
                {headlineItalic && headlineRest && " "}
                {headlineRest}
              </h1>
            )}
            {intro && (
              <p className="text-[14px] leading-relaxed mb-7 max-w-xs mx-auto text-center" style={{ fontFamily: "Inter", color: palette.ash }}>
                {intro}
              </p>
            )}
            {children}
          </div>

          {footer && (
            <div className="mt-6 text-center text-[12px]" style={{ fontFamily: "Inter", color: palette.ash }}>
              {footer}
            </div>
          )}

          <div className="mt-3 text-center text-[11px]" style={{ fontFamily: "Inter", letterSpacing: "0.14em", textTransform: "uppercase", color: palette.dust }}>
            <Link to="/" className="no-underline" style={{ color: palette.ash }}>← Back to home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
