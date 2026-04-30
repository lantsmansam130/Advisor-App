// netlify/functions/auth-bootstrap.js
//
// Called on first sign-in to create (or join) a firm and create the user's
// public.users profile. Uses the Supabase service-role key — bypasses RLS
// so we can insert into firms/users/audit_log on behalf of a user who
// doesn't yet have a profile to be authorized against.
//
// Auth model: caller passes their Supabase JWT in Authorization: Bearer <jwt>.
// We verify the JWT via supabase.auth.getUser(jwt). If valid, we:
//   1. Look up an existing public.users row by id. If found, return it.
//   2. Otherwise, parse the email domain. If a firm already exists with
//      that primary_domain, link the user to it as 'advisor'. If not,
//      create the firm and the user becomes its 'admin'.
//   3. Write a 'user_signup' row to audit_log.
//   4. Return the joined profile.
//
// The browser receives back { profile } where profile.firms is the firm.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function deriveFirmName(user, domain) {
  const md = user.user_metadata || {};
  if (md.firm_name && typeof md.firm_name === "string") return md.firm_name;
  // Fall back to a Title-Cased domain stem (e.g. "northbridge.com" → "Northbridge")
  const stem = domain.split(".")[0] || domain;
  return stem.charAt(0).toUpperCase() + stem.slice(1);
}

function deriveDisplayName(user) {
  const md = user.user_metadata || {};
  return (
    md.full_name ||
    md.name ||
    [md.given_name, md.family_name].filter(Boolean).join(" ") ||
    (user.email ? user.email.split("@")[0] : "Advisor")
  );
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

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Verify JWT and identify the caller
  const { data: userData, error: userErr } = await admin.auth.getUser(jwt);
  if (userErr || !userData?.user) {
    return jsonResponse({ error: "Invalid or expired session" }, 401);
  }
  const u = userData.user;
  const email = (u.email || "").toLowerCase();
  if (!email || !email.includes("@")) {
    return jsonResponse({ error: "Account has no email — cannot bootstrap firm membership" }, 400);
  }

  // Already bootstrapped? Return the existing joined profile.
  const { data: existing, error: existingErr } = await admin
    .from("users")
    .select("id, firm_id, email, display_name, role, created_at, firms(id, name, primary_domain, created_at)")
    .eq("id", u.id)
    .maybeSingle();
  if (existingErr) {
    return jsonResponse({ error: `Profile lookup failed: ${existingErr.message}` }, 500);
  }
  if (existing) {
    return jsonResponse({ profile: existing, bootstrapped: false });
  }

  // First-time bootstrap path
  const domain = email.split("@")[1];

  // Find or create the firm
  const { data: firmExisting, error: firmLookupErr } = await admin
    .from("firms")
    .select("id, name, primary_domain, created_at")
    .eq("primary_domain", domain)
    .maybeSingle();
  if (firmLookupErr) {
    return jsonResponse({ error: `Firm lookup failed: ${firmLookupErr.message}` }, 500);
  }

  let firm = firmExisting;
  let role = "advisor";
  let createdFirm = false;

  if (!firm) {
    const { data: firmInserted, error: firmInsertErr } = await admin
      .from("firms")
      .insert({ name: deriveFirmName(u, domain), primary_domain: domain })
      .select()
      .single();
    if (firmInsertErr) {
      return jsonResponse({ error: `Firm create failed: ${firmInsertErr.message}` }, 500);
    }
    firm = firmInserted;
    role = "admin"; // first user from a new domain becomes the firm admin
    createdFirm = true;
  }

  // Create the user profile
  const { data: userInserted, error: userInsertErr } = await admin
    .from("users")
    .insert({
      id: u.id,
      firm_id: firm.id,
      email,
      display_name: deriveDisplayName(u),
      role,
    })
    .select("id, firm_id, email, display_name, role, created_at, firms(id, name, primary_domain, created_at)")
    .single();
  if (userInsertErr) {
    return jsonResponse({ error: `User profile create failed: ${userInsertErr.message}` }, 500);
  }

  // Audit log entry — the very first one for this user
  await admin.from("audit_log").insert({
    firm_id: firm.id,
    user_id: u.id,
    action: "user_signup",
    target_type: "user",
    target_id: u.id,
    metadata: {
      email,
      role,
      created_firm: createdFirm,
      provider: u.app_metadata?.provider || "unknown",
    },
  });

  return jsonResponse({ profile: userInserted, bootstrapped: true, createdFirm });
};
