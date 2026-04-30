// netlify/functions/auth-complete-onboarding.js
//
// Marks a user as having completed (or skipped) the first-run onboarding
// flow by setting public.users.onboarded_at = now(). Writes an audit row.
//
// Browser cannot UPDATE public.users directly (no RLS UPDATE policy by
// design — all writes go through service-role functions). The browser
// POSTs here with its JWT; we verify, set the timestamp, audit, and
// return the updated profile.
//
// Body: { skipped: boolean }  — distinguishes "Skip for now" vs.
//                                "Continue" (after potentially having
//                                connected an integration). Phase 2
//                                only audits the choice; the integration
//                                connect itself is wired up in Phase 3+.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export default async (req) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return jsonResponse({ error: "Server is missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY env vars" }, 500);
  }

  const authHeader = req.headers.get("authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return jsonResponse({ error: "Missing Authorization: Bearer <jwt>" }, 401);
  }
  const jwt = authHeader.slice(7).trim();

  let body = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const skipped = Boolean(body.skipped);

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userErr } = await admin.auth.getUser(jwt);
  if (userErr || !userData?.user) {
    return jsonResponse({ error: "Invalid or expired session" }, 401);
  }
  const u = userData.user;

  const { data: existing, error: existingErr } = await admin
    .from("users")
    .select("id, firm_id, onboarded_at")
    .eq("id", u.id)
    .maybeSingle();
  if (existingErr || !existing) {
    return jsonResponse({ error: existingErr?.message || "Profile not found — sign in again." }, 404);
  }

  // Idempotent: if already onboarded, just return the profile.
  if (existing.onboarded_at) {
    const { data: prof } = await admin
      .from("users")
      .select("id, firm_id, email, display_name, role, created_at, onboarded_at, firms(id, name, primary_domain, created_at)")
      .eq("id", u.id)
      .single();
    return jsonResponse({ profile: prof, alreadyOnboarded: true });
  }

  const { data: updated, error: updateErr } = await admin
    .from("users")
    .update({ onboarded_at: new Date().toISOString() })
    .eq("id", u.id)
    .select("id, firm_id, email, display_name, role, created_at, onboarded_at, firms(id, name, primary_domain, created_at)")
    .single();
  if (updateErr) {
    return jsonResponse({ error: `Onboarding update failed: ${updateErr.message}` }, 500);
  }

  await admin.from("audit_log").insert({
    firm_id: existing.firm_id,
    user_id: u.id,
    action: "onboarding_completed",
    target_type: "user",
    target_id: u.id,
    metadata: { skipped },
  });

  return jsonResponse({ profile: updated, alreadyOnboarded: false });
};
