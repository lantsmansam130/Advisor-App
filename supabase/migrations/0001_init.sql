-- =====================================================================
-- Advisor Stack — Phase 1 schema
--
-- Tables introduced:
--   firms      — multi-tenant unit; one row per advisory firm
--   users      — application profile (1:1 with auth.users)
--   audit_log  — append-only record of authenticated actions (for SEC
--                17a-4 / FINRA 4511 alignment)
--
-- Multi-tenancy model: every row in users / audit_log carries a firm_id.
-- Row-Level Security is enabled on every table and policies restrict
-- SELECT to rows where firm_id matches the caller's firm.
--
-- INSERT/UPDATE/DELETE on these tables happens through the service-role
-- key inside Netlify Functions (which bypasses RLS). The browser client
-- only ever reads.
--
-- Run this migration in the Supabase dashboard:
--   SQL Editor → New query → paste this file → Run
-- =====================================================================

-- ---------- Extensions ----------
-- gen_random_uuid() lives in pgcrypto on most Supabase projects, but the
-- newer projects expose it via the built-in `uuid` extension. Either
-- works; this guards both ways.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------- firms ----------
CREATE TABLE IF NOT EXISTS public.firms (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  primary_domain  text NOT NULL UNIQUE,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ---------- users ----------
-- One row per application user. The id column references auth.users(id)
-- so Supabase Auth and our profile data stay in 1:1 sync.

DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('admin', 'advisor');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.users (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  firm_id       uuid NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
  email         text NOT NULL,
  display_name  text NOT NULL,
  role          public.user_role NOT NULL DEFAULT 'advisor',
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS users_firm_id_idx ON public.users(firm_id);

-- ---------- audit_log ----------
-- Append-only. Every authenticated action writes one row. user_id is
-- nullable so that auth events that pre-date the user row (e.g. signup
-- itself) can still be recorded without failing the FK.

CREATE TABLE IF NOT EXISTS public.audit_log (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id      uuid NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
  user_id      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action       text NOT NULL,
  target_type  text,
  target_id    text,
  metadata     jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_log_firm_id_idx ON public.audit_log(firm_id);
CREATE INDEX IF NOT EXISTS audit_log_created_at_idx ON public.audit_log(created_at DESC);

-- ---------- Helper: current_firm_id() ----------
-- SECURITY DEFINER function that returns the caller's firm_id. We use this
-- inside RLS policies to avoid recursive lookups (a SELECT on `users`
-- triggering an RLS policy that itself queries `users`).

CREATE OR REPLACE FUNCTION public.current_firm_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT firm_id FROM public.users WHERE id = auth.uid()
$$;

-- ---------- Row-Level Security ----------

ALTER TABLE public.firms     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- firms: users see only their own firm
DROP POLICY IF EXISTS "firms_select_own" ON public.firms;
CREATE POLICY "firms_select_own" ON public.firms
  FOR SELECT TO authenticated
  USING (id = public.current_firm_id());

-- users: users see members of their own firm (including themselves)
DROP POLICY IF EXISTS "users_select_firm" ON public.users;
CREATE POLICY "users_select_firm" ON public.users
  FOR SELECT TO authenticated
  USING (firm_id = public.current_firm_id());

-- audit_log: users see their own firm's audit history
DROP POLICY IF EXISTS "audit_log_select_firm" ON public.audit_log;
CREATE POLICY "audit_log_select_firm" ON public.audit_log
  FOR SELECT TO authenticated
  USING (firm_id = public.current_firm_id());

-- No INSERT/UPDATE/DELETE policies for the authenticated role.
-- Mutations on these tables happen via the service role inside Netlify
-- Functions, which bypasses RLS by design.

-- ---------- Permissions ----------
-- Grant SELECT to authenticated. The default Supabase setup grants this
-- automatically, but explicit is better than implicit for review.
GRANT SELECT ON public.firms     TO authenticated;
GRANT SELECT ON public.users     TO authenticated;
GRANT SELECT ON public.audit_log TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_firm_id() TO authenticated;
