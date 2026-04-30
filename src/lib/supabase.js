// Browser-side Supabase client. Reads VITE_-prefixed env vars baked in at
// build time by Vite. The anon key is safe to ship to the browser; Row-Level
// Security on the database is what protects multi-tenant data.

import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Don't throw — keep public marketing pages renderable even if Supabase
  // hasn't been configured yet. AuthContext will surface a clear error
  // when a user tries to sign in.
  // eslint-disable-next-line no-console
  console.warn(
    "[Advisor Stack] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set. Auth flows will fail until configured."
  );
}

export const supabase = createClient(url || "https://invalid.supabase.co", anonKey || "missing", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true, // pick up the session from the OAuth callback hash
  },
});

export const supabaseConfigured = Boolean(url && anonKey);
