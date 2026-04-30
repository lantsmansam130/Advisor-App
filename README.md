# Advisor Stack

A growing suite of compliance-first AI tools built specifically for financial advisors at RIAs and small-to-midsize advisory firms. Drafts only, always advisor-reviewed, never a recommendation.

**Status:** Prototype, evolving toward an authenticated platform with Google integrations. Not for use with real client data without compliance review.

---

## What's live today

| Status | Tool | What it does |
|---|---|---|
| ✅ Live | **AdvisorNotes** (`/app`) | A streaming chatbot tailored to RIA workflows. Drafts recap emails, CRM entries, suitability memos, IPS updates, discovery summaries, and task lists. Per-chat settings (tone / length / audience / custom firm disclosure). File upload (PDF + .txt/.md, drag-and-drop). Quick-action chips on each draft (Shorter / Warmer / More formal / Convert to CRM note / Add full disclosure). Regenerate. Type-aware artifact rendering — emails render as Gmail-style cards with a real subject row. |
| ✅ Live | **Document Decoder** (`/decoder`) | Upload a PDF (or paste text) of an annuity contract, insurance policy, trust document, or benefits package. Get a structured plain-English breakdown rendered as three sectioned cards: *what it says*, *watch for*, *questions to ask*. PDF text extraction happens in-browser via `pdfjs-dist` — no server-side processing. |
| ⏳ In development | Inbound Lead Analytics | CRM-connected analytics on lead sources and conversion. |
| ⏳ Planned | Prospect Pre-Meeting Brief | A one-page brief on talking points and likely concerns before a prospect meeting. |

---

## Routes

| URL | Auth | What it shows |
|---|---|---|
| `/` | public | Suite homepage with the tools grid |
| `/notes` | public | AdvisorNotes marketing page (with an embedded chat preview) |
| `/app` | public | The AdvisorNotes chat tool |
| `/decoder` | public | Document Decoder |
| `/login` | public | Google sign-in |
| `/dashboard` | **authenticated** | Personal dashboard (Phase 1 ships an empty shell + tool tiles; Phase 2 fills in calendar widgets) |

---

## Tech stack

- **Frontend:** Vite + React + Tailwind CSS, single-page app, client-side routing via `react-router-dom`. Markdown rendering via `react-markdown` + `remark-gfm`. PDF text extraction via `pdfjs-dist` (worker chunk lazy-loaded).
- **Backend:** Netlify Functions. Two functions today:
  - `netlify/functions/generate.js` — proxies the Anthropic API (chat streaming + one-shot prompts).
  - `netlify/functions/auth-bootstrap.js` — first-sign-in firm creation / firm join + first audit-log entry. Uses the Supabase service-role key.
- **Auth + database:** Supabase (Postgres + Auth + Row-Level Security). Google OAuth as the only sign-in method.
- **AI:** Claude via the Anthropic API. `claude-sonnet-4-6` for chat (latency-sensitive); `claude-sonnet-4-5` for the legacy one-shot prompts.
- **Hosting:** Netlify. Auto-deploys every push to `main`.

---

## Environment variables

All env vars are configured in **Netlify → Site settings → Environment variables**. Variables prefixed with `VITE_` are read by Vite at build time and inlined into the browser bundle (safe for that, but only ever publishable values). Unprefixed variables are read at runtime by Netlify Functions only and are never shipped to the browser.

| Variable | Used by | Secret? | What it is |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | `generate.js` | **Yes** | API key from console.anthropic.com. Required for all AI generation. |
| `VITE_SUPABASE_URL` | browser (via `src/lib/supabase.js`) | No | Supabase project URL, e.g. `https://abcd1234.supabase.co`. |
| `VITE_SUPABASE_ANON_KEY` | browser (via `src/lib/supabase.js`) | No | Supabase anon/public key. Safe to expose; RLS is what protects data. |
| `SUPABASE_URL` | `auth-bootstrap.js` (and future functions) | No | Same value as `VITE_SUPABASE_URL`. Read at runtime by Netlify Functions. |
| `SUPABASE_SERVICE_ROLE_KEY` | `auth-bootstrap.js` (and future functions) | **Yes** | Service-role key from Supabase. Bypasses RLS — never expose to the browser. |

**Setting them in Netlify:**
1. Site settings → Environment variables → Add a variable
2. For each variable, set scopes — `Builds` for `VITE_*` (so Vite can inline them), `Functions` for everything else, or `Builds & Functions` for both
3. Trigger a redeploy after adding/changing env vars (env changes don't affect already-deployed code)

For local development, copy `.env.example` to `.env` (gitignored) and fill in the same values.

---

## First-time setup

### 1. Anthropic API key

1. Sign in at https://console.anthropic.com
2. **API Keys → Create Key**, copy the value
3. Add billing (pay-as-you-go). Each AdvisorNotes turn costs roughly $0.005–$0.03 depending on conversation length and prompt-cache hit rate; Document Decoder runs slightly higher per call.
4. Set `ANTHROPIC_API_KEY` in Netlify (scope: Functions).

### 2. Supabase project (Phase 1 — needed for `/login` and `/dashboard`)

1. Sign up at https://supabase.com
2. **New project** — choose a name and region. Save the database password somewhere safe.
3. Once provisioned, go to **Project Settings → API** and copy:
   - **Project URL** → set as both `VITE_SUPABASE_URL` (scope: Builds) and `SUPABASE_URL` (scope: Functions)
   - **anon public** key → `VITE_SUPABASE_ANON_KEY` (scope: Builds)
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (scope: Functions; mark as secret)
4. **Enable Google as an auth provider:**
   - **Authentication → Providers → Google → enable**
   - You'll need a Google OAuth client ID and secret. Quick path: go to https://console.cloud.google.com → create a project (or reuse one) → **APIs & Services → Credentials → Create Credentials → OAuth client ID → Web application**. The redirect URI Supabase needs is shown in the Supabase dashboard — copy it into Google Cloud's "Authorized redirect URIs."
   - Copy the resulting client ID and secret back into Supabase.
5. **Run the schema migration:**
   - Open the SQL editor in Supabase
   - Paste the contents of `supabase/migrations/0001_init.sql`
   - Run it. This creates the `firms`, `users`, and `audit_log` tables, the `current_firm_id()` helper, and Row-Level Security policies.
6. **Trigger a redeploy in Netlify** so the build picks up the new `VITE_*` env vars.

### 3. Verify

- Visit `/` — public site loads, the floating dark nav shows a "Sign in" link on the right.
- Click **Sign in** → `/login` → **Continue with Google** → consent → land back on `/dashboard`.
- In Supabase: `auth.users` has one row, `public.users` has one row, `public.firms` has one row matching your email's domain, and `public.audit_log` has one `user_signup` row.

---

## Local development

You can edit through the GitHub web editor and push to `main` (Netlify auto-deploys in ~60s). If you want a local dev environment:

```bash
npm install
```

Create a `.env` file in the project root with the same variables listed above (excluding the `VITE_` prefix isn't necessary for `vite dev` — it reads `.env` directly). Then:

```bash
# Frontend only (no serverless functions)
npm run dev

# Frontend + functions, mirroring production
npm install -g netlify-cli
netlify dev   # http://localhost:8888
```

---

## Deploy

Netlify auto-deploys every push to `main`. There is no staging branch.

`netlify.toml` defines:
- Build command: `npm run build`
- Publish directory: `dist/`
- Functions directory: `netlify/functions/`
- SPA catch-all redirect (`/* → /index.html`) so client-side routes resolve correctly

After changing environment variables, trigger a fresh deploy: **Deploys → Trigger deploy → Deploy site**. Env changes don't apply to already-deployed code.

---

## Adding a new tool

1. Add a `PROMPTS[<id>]` entry in `netlify/functions/generate.js` (for one-shot tools) or fork on `outputType` near the top of the handler (for chat-shaped tools).
2. Create `src/<Tool>Page.jsx` — pattern-match `DecoderPage.jsx` (one-shot) or `AdvisorChatPage.jsx` (chat).
3. Add a `<Route>` in `src/App.jsx`.
4. In the `TOOLS` array in `src/StackHomePage.jsx`, set `available: true` and add `href`.
5. Push to `main`. Netlify deploys.

See `CLAUDE.md` for the design system, the artifact-rendering contract, and per-feature implementation notes.

---

## Compliance posture

Every tool follows four guardrails baked into both prompts and UI:

1. **Drafts only** — never auto-sends, auto-files, or auto-shares.
2. **No fabrication** — output flags missing info instead of inventing it.
3. **Disclosure language preserved** — client-facing output ships with the standard disclosure (or the firm's custom one, if set in chat settings).
4. **Treated as electronic communications** under SEC 17a-4 / FINRA 4511 — runs through your firm's WSP and supervisory process.

### Important compliance note

This is a **prototype**. Before any production use with real client data:

- Conduct a vendor due diligence review
- Confirm your firm's WSP allows AI-assisted communications
- Add audit logging review, user authentication checks, and data retention controls per SEC 17a-4 / FINRA 4511 (the `audit_log` table is the foundation; admin UI for it ships in a later phase)
- Consider a Business Associate Agreement / DPA with Anthropic if handling sensitive PII
- Verify Anthropic's data-handling defaults (inputs are not used to train models on the standard API tier)

---

## Known limitations

- Authentication is now in place, but rate limiting and per-firm cost ceilings are not.
- Audit-log review UI is not yet built — query `public.audit_log` in Supabase directly for now.
- No background sync — Phase 2+ Google integrations will sync on-demand only.
- Custom domains are not yet set up; the site runs on the default `*.netlify.app` URL.
- Per-firm customization (logos, custom disclosures) is partial — chat settings let advisors set a custom disclosure, but firm-wide branding is on the roadmap.
