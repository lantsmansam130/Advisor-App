// AuthShell — shared chrome for unauthenticated auth pages
// (/login, /signup, /forgot-password, /reset-password, /verify-email).
//
// Folio auth-card pattern (port of folio-ref/login.html):
//   - Cream surface page with a translucent sticky brand bar at the top
//   - White card centered, 440px max-width, 48px padding, 28px radius
//   - Centered Fraunces 600 title (sentence-case, NOT italic+upright pair)
//   - Centered green-dot wordmark above the title
//   - Sentence-case form labels (Inter 600 13.5px), green focus glow
//   - Primary CTA: full-width green pill with green-tinted shadow

import { Link } from "react-router-dom";
import { palette, BrandMark } from "../StackHomePage.jsx";

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
      <span style={{
        display: "block",
        fontFamily: "'Inter', sans-serif",
        fontSize: "13.5px",
        fontWeight: 600,
        color: palette.ink80,
        marginBottom: "7px",
      }}>
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
        className="w-full outline-none transition-all"
        style={{
          background: palette.surface,
          color: palette.ink,
          border: `1.5px solid ${palette.border}`,
          borderRadius: "10px",
          padding: "12px 14px",
          fontFamily: "'Inter', sans-serif",
          fontSize: "14px",
          fontWeight: 500,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = palette.green;
          e.currentTarget.style.background = palette.paper;
          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(47,138,95,0.10)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = palette.border;
          e.currentTarget.style.background = palette.surface;
          e.currentTarget.style.boxShadow = "none";
        }}
      />
    </label>
  );
}

export function AuthPrimaryButton({ children, type = "submit", onClick, disabled, loading }) {
  const isDisabled = disabled || loading;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className="w-full inline-flex items-center justify-center gap-2 transition-all"
      style={{
        background: palette.green,
        color: "#fff",
        border: `1.5px solid ${palette.green}`,
        borderRadius: "999px",
        padding: "13px 18px",
        fontFamily: "'Inter', sans-serif",
        fontWeight: 600,
        fontSize: "14.5px",
        letterSpacing: "-0.005em",
        boxShadow: "0 4px 14px rgba(47,138,95,0.22)",
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: isDisabled ? 0.55 : 1,
      }}
      onMouseEnter={(e) => {
        if (e.currentTarget.disabled) return;
        e.currentTarget.style.background = palette.greenDark;
        e.currentTarget.style.borderColor = palette.greenDark;
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = "0 8px 22px rgba(47,138,95,0.32)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = palette.green;
        e.currentTarget.style.borderColor = palette.green;
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 14px rgba(47,138,95,0.22)";
      }}
    >
      {loading ? "Working…" : children}
    </button>
  );
}

export function AuthGhostButton({ children, type = "button", onClick, disabled, loading }) {
  const isDisabled = disabled || loading;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className="w-full inline-flex items-center justify-center gap-3 transition-all"
      style={{
        background: palette.paper,
        color: palette.ink,
        border: `1.5px solid ${palette.borderStrong}`,
        borderRadius: "999px",
        padding: "12px 18px",
        fontFamily: "'Inter', sans-serif",
        fontWeight: 600,
        fontSize: "14.5px",
        letterSpacing: "-0.005em",
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: isDisabled ? 0.55 : 1,
      }}
      onMouseEnter={(e) => {
        if (e.currentTarget.disabled) return;
        e.currentTarget.style.borderColor = palette.ink;
        e.currentTarget.style.background = palette.surface;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = palette.borderStrong;
        e.currentTarget.style.background = palette.paper;
      }}
    >
      {children}
    </button>
  );
}

export function AuthDivider({ label = "or" }) {
  return (
    <div className="my-5 flex items-center gap-3">
      <div className="flex-1" style={{ height: 1, background: palette.border }} />
      <span style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: palette.ink40,
      }}>
        {label}
      </span>
      <div className="flex-1" style={{ height: 1, background: palette.border }} />
    </div>
  );
}

export function AuthError({ children }) {
  if (!children) return null;
  return (
    <p
      className="mt-4 text-left"
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: "12.5px",
        lineHeight: 1.5,
        color: palette.red,
      }}
    >
      {children}
    </p>
  );
}

export function AuthInfo({ children }) {
  if (!children) return null;
  return (
    <div
      className="mt-4 px-4 py-3 text-left"
      style={{
        background: palette.greenLight,
        border: `1px solid rgba(47,138,95,0.18)`,
        borderRadius: "12px",
        fontFamily: "'Inter', sans-serif",
        fontSize: "13px",
        lineHeight: 1.55,
        color: palette.greenDark,
      }}
    >
      {children}
    </div>
  );
}

export default function AuthShell({ eyebrow, headlineItalic, headlineRest, intro, children, footer }) {
  // For backwards-compat with the old italic+upright pairing API:
  // we now render the headline as a single Fraunces 600 string.
  // If a caller passes both `headlineItalic` and `headlineRest`, we join
  // them with a space and treat the whole thing as the title.
  const titleText = [headlineItalic, headlineRest].filter(Boolean).join(" ");

  return (
    <div className="min-h-screen flex flex-col" style={{ background: palette.surface, color: palette.ink }}>
      {/* Sticky translucent brand bar */}
      <header
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
        {/* TODO: swap to AdvisorSuite portal URL when portal launches */}
        <Link to="/" className="no-underline">
          <BrandMark />
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full" style={{ maxWidth: "440px" }}>
          <div
            style={{
              background: "#fff",
              border: `1px solid ${palette.border}`,
              borderRadius: "28px",
              padding: "48px",
              boxShadow: palette.shadowLg,
            }}
          >
            {/* Centered green-dot wordmark above the title */}
            <div className="flex justify-center mb-5">
              <BrandMark size="sm" />
            </div>

            {eyebrow && (
              <div
                className="text-center"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "11.5px",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: palette.green,
                  marginBottom: "10px",
                }}
              >
                {eyebrow}
              </div>
            )}

            {titleText && (
              <h1
                className="text-center"
                style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontWeight: 600,
                  fontSize: "26px",
                  letterSpacing: "-0.012em",
                  lineHeight: 1.2,
                  color: palette.ink,
                  marginBottom: "8px",
                }}
              >
                {titleText}
              </h1>
            )}

            {intro && (
              <p
                className="text-center mx-auto"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  lineHeight: 1.55,
                  color: palette.ink60,
                  marginBottom: "28px",
                  maxWidth: "320px",
                }}
              >
                {intro}
              </p>
            )}

            {children}
          </div>

          {footer && (
            <div
              className="mt-6 text-center"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "13px",
                color: palette.ink60,
              }}
            >
              {footer}
            </div>
          )}

          <div
            className="mt-3 text-center"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "11.5px",
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: palette.ink40,
            }}
          >
            <Link to="/" className="no-underline" style={{ color: "inherit" }}>← Back to home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
