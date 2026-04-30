// AuthContext — single source of truth for auth state across the app.
//
// Responsibilities:
//   1. Subscribe to Supabase auth changes and expose:
//        { user, profile, firm, loading, error, configured,
//          emailConfirmed, needsOnboarding,
//          signInWithGoogle, signInWithEmail, signUpWithEmail,
//          requestPasswordReset, updatePassword,
//          resendVerificationEmail, completeOnboarding, signOut }
//      - user    = the auth.users row (Supabase) — id, email, email_confirmed_at, etc.
//      - profile = the public.users row — display_name, role, firm_id, onboarded_at
//      - firm    = the public.firms row joined onto the profile
//   2. On first verified sign-in, call /.netlify/functions/auth-bootstrap
//      to create the firm + profile and write the first audit-log entry.
//      Email/password signups: bootstrap is skipped until the user confirms
//      their email (we read user.email_confirmed_at).
//   3. Expose the auth helper methods listed above.
//
// The browser never writes to firms/users/audit_log directly. The
// service-role key inside Netlify Functions does that.

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { supabase, supabaseConfigured } from "../lib/supabase.js";

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth() must be used inside <AuthProvider>");
  return ctx;
}

async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from("users")
    .select("id, firm_id, email, display_name, role, created_at, onboarded_at, firms(id, name, primary_domain, created_at)")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data; // null if profile doesn't exist yet
}

async function bootstrapProfile(accessToken) {
  const res = await fetch("/.netlify/functions/auth-bootstrap", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let parsed = null;
    try { parsed = JSON.parse(text); } catch { /* not json */ }
    const err = new Error(parsed?.error || text || `auth-bootstrap failed (${res.status})`);
    err.code = parsed?.code;
    err.status = res.status;
    throw err;
  }
  return res.json();
}

async function postCompleteOnboarding(accessToken, skipped) {
  const res = await fetch("/.netlify/functions/auth-complete-onboarding", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ skipped: !!skipped }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `auth-complete-onboarding failed (${res.status})`);
  }
  return res.json();
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProfile = useCallback(async (sess) => {
    if (!sess?.user) {
      setProfile(null);
      return;
    }

    // Don't try to bootstrap or fetch a profile until the email is
    // confirmed. Email/password signups land here without a confirmed
    // email; they should sit on /verify-email until they click the link.
    if (!sess.user.email_confirmed_at) {
      setProfile(null);
      setError("");
      return;
    }

    try {
      let prof = await fetchProfile(sess.user.id);
      if (!prof) {
        // First confirmed sign-in for this user — create firm + profile.
        const { profile: bootstrapped } = await bootstrapProfile(sess.access_token);
        prof = bootstrapped;
      }
      setProfile(prof);
      setError("");
    } catch (e) {
      // Surface but don't blow up — user can retry by reloading.
      setError(e.message || "Could not load profile");
      setProfile(null);
    }
  }, []);

  // Initial session check + subscribe to changes
  useEffect(() => {
    let mounted = true;

    if (!supabaseConfigured) {
      setLoading(false);
      return undefined;
    }

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      await loadProfile(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, sess) => {
      if (!mounted) return;
      setSession(sess);
      if (event === "SIGNED_OUT") {
        setProfile(null);
        setError("");
      } else if (sess) {
        await loadProfile(sess);
      }
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, [loadProfile]);

  const signInWithGoogle = useCallback(async () => {
    if (!supabaseConfigured) {
      setError("Auth is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      return { error: "not_configured" };
    }
    setError("");
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (err) {
      setError(err.message);
      return { error: err.message };
    }
    return {};
  }, []);

  const signInWithEmail = useCallback(async (email, password) => {
    if (!supabaseConfigured) {
      setError("Auth is not configured.");
      return { error: "not_configured" };
    }
    setError("");
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      // Don't push the password-style error into the global banner;
      // pages render it inline next to the form.
      return { error: err.message };
    }
    return {};
  }, []);

  const signUpWithEmail = useCallback(async (email, password, displayName) => {
    if (!supabaseConfigured) {
      return { error: "Auth is not configured." };
    }
    setError("");
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: displayName ? { display_name: displayName, full_name: displayName } : {},
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (err) return { error: err.message };
    // If email confirmation is required (default in Supabase), data.user
    // exists but data.session is null until they click the link.
    return { user: data.user, session: data.session, needsConfirmation: !data.session };
  }, []);

  const requestPasswordReset = useCallback(async (email) => {
    if (!supabaseConfigured) return { error: "Auth is not configured." };
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (err) return { error: err.message };
    return {};
  }, []);

  const updatePassword = useCallback(async (newPassword) => {
    if (!supabaseConfigured) return { error: "Auth is not configured." };
    const { error: err } = await supabase.auth.updateUser({ password: newPassword });
    if (err) return { error: err.message };
    return {};
  }, []);

  const resendVerificationEmail = useCallback(async (email) => {
    if (!supabaseConfigured) return { error: "Auth is not configured." };
    const { error: err } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    if (err) return { error: err.message };
    return {};
  }, []);

  const completeOnboarding = useCallback(async ({ skipped } = {}) => {
    if (!session?.access_token) return { error: "Not signed in." };
    try {
      const { profile: updated } = await postCompleteOnboarding(session.access_token, skipped);
      setProfile(updated);
      return { profile: updated };
    } catch (e) {
      return { error: e.message };
    }
  }, [session]);

  const signOut = useCallback(async () => {
    setError("");
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
  }, []);

  const value = useMemo(() => {
    const user = session?.user || null;
    const emailConfirmed = Boolean(user?.email_confirmed_at);
    const needsOnboarding = Boolean(user && emailConfirmed && profile && !profile.onboarded_at);
    return {
      session,
      user,
      profile,
      firm: profile?.firms || null,
      loading,
      error,
      configured: supabaseConfigured,
      emailConfirmed,
      needsOnboarding,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      requestPasswordReset,
      updatePassword,
      resendVerificationEmail,
      completeOnboarding,
      signOut,
    };
  }, [session, profile, loading, error,
      signInWithGoogle, signInWithEmail, signUpWithEmail,
      requestPasswordReset, updatePassword, resendVerificationEmail,
      completeOnboarding, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
