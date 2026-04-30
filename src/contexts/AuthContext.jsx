// AuthContext — single source of truth for auth state across the app.
//
// Responsibilities:
//   1. Subscribe to Supabase auth changes and expose { user, profile, firm, loading }.
//      - user    = the auth.users row (Supabase) — id, email, etc.
//      - profile = the public.users row — display_name, role, firm_id
//      - firm    = the public.firms row joined onto the profile
//   2. On first sign-in, call /.netlify/functions/auth-bootstrap to create
//      the firm + profile and write the first audit-log entry.
//   3. Expose signInWithGoogle() and signOut() helpers.
//
// The browser never writes to firms/users/audit_log directly. The bootstrap
// function uses the service-role key server-side to do that.

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
    .select("id, firm_id, email, display_name, role, created_at, firms(id, name, primary_domain, created_at)")
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
    throw new Error(`auth-bootstrap failed (${res.status}): ${text || "unknown error"}`);
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
    try {
      let prof = await fetchProfile(sess.user.id);
      if (!prof) {
        // First sign-in for this user — create firm + profile via bootstrap.
        const { profile: bootstrapped } = await bootstrapProfile(sess.access_token);
        prof = bootstrapped;
      }
      setProfile(prof);
      setError("");
    } catch (e) {
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
      // SIGNED_IN, TOKEN_REFRESHED, USER_UPDATED — refetch profile.
      // SIGNED_OUT — clear profile.
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
      return;
    }
    setError("");
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (err) setError(err.message);
  }, []);

  const signOut = useCallback(async () => {
    setError("");
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user || null,
      profile,
      firm: profile?.firms || null,
      loading,
      error,
      configured: supabaseConfigured,
      signInWithGoogle,
      signOut,
    }),
    [session, profile, loading, error, signInWithGoogle, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
