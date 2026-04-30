-- =====================================================================
-- Advisor Stack — Phase 2: Auth expansion + onboarding shell
--
-- Adds:
--   users.onboarded_at — null until the user finishes (or skips) the
--                        first-run integration prompt. Drives the
--                        /onboarding redirect on the dashboard route.
--
-- We deliberately do NOT add an email_verified_at column. Supabase
-- already tracks verification on auth.users.email_confirmed_at; reading
-- from there avoids drift. The auth-bootstrap function checks that
-- column before creating the firm/users rows so unverified email/password
-- signups don't pollute the firms table.
--
-- Run this migration in the Supabase dashboard:
--   SQL Editor → New query → paste this file → Run
-- =====================================================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS onboarded_at timestamptz;

-- Backfill: any existing users (pre-Phase 2) are treated as already
-- onboarded so they don't get bounced into the new flow on next login.
UPDATE public.users
   SET onboarded_at = created_at
 WHERE onboarded_at IS NULL;
