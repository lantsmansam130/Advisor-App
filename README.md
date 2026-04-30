# Advisor Stack

A growing suite of compliance-first AI tools built specifically for financial advisors at RIAs and small-to-midsize advisory firms. Each tool solves one focused problem, requires minimal user input (paste-and-click, no CRM/email/calendar connectors), and produces drafts that always require human review before being sent or filed.

**Live site:** [your Netlify URL]
**Status:** Prototype. Not for use with real client data without compliance review.

## The stack

| Status | Tool | What it does |
|---|---|---|
| ✅ Live | **AdvisorNotes** | Turns rough meeting notes into recap emails, CRM entries, suitability memos, IPS updates, discovery summaries, and task lists |
| ✅ Live | **Document Decoder** | Paste a section of an annuity / insurance / trust / benefits document. Get a plain-English breakdown — what it says, what to watch for, what to ask before signing |
| ⏳ Planned | Plain-English Translator | Investment jargon → client-readable language |
| ⏳ Planned | Prospect Pre-Meeting Brief | Talking points and likely concerns before a prospect call |
| ⏳ Planned | Disclosure Drafter | Context-appropriate compliance disclosures (social, podcast, blog, marketing) |
| ⏳ Planned | Referral Thank-You Generator | Personalized thank-you notes for every referral |
| ⏳ Planned | Process Documentation Writer | SOPs from rough fragments |
| ⏳ Planned | ADV / Form CRS Helper | Starter-draft assistant for annual ADV and Form CRS section updates |

## Stack (the technical kind)

- **Frontend:** Vite + React + Tailwind CSS, single-page app with client-side routing via `react-router-dom`
- **Backend:** Single Netlify serverless function at `netlify/functions/generate.js` that proxies the Anthropic API
- **AI:** Claude (Anthropic API), `claude-sonnet-4-5` model
- **Hosting:** Netlify (auto-deploys on push to `main`)

## Routes

| URL | What it shows |
|---|---|
| `/` | Suite homepage with the tools grid |
| `/notes` | AdvisorNotes marketing page (long, multi-section) |
| `/app` | The AdvisorNotes tool itself |
| `/decoder` | The Document Decoder tool |

When new tools ship, they each get their own route (e.g., `/translator`, `/disclosure`).

## File structure

```
src/
  App.jsx                  # Router + the AdvisorNotes ToolPage
  StackHomePage.jsx        # The suite homepage at /
  LandingPage.jsx          # The AdvisorNotes marketing page at /notes
  DecoderPage.jsx          # The Document Decoder tool at /decoder
  main.jsx                 # React entry point
  index.css                # Tailwind imports

netlify/
  functions/
    generate.js            # Single serverless function — handles every tool's prompt

netlify.toml               # Build config + SPA redirect (/* → /index.html)
package.json               # Dependencies including react-router-dom
index.html                 # Entry HTML with browser tab title + meta description
```

## Local development

```bash
npm install
```

Create a `.env` file in the project root:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Then:

```bash
# Install Netlify CLI once (globally)
npm install -g netlify-cli

# Run dev server with serverless functions
netlify dev
```

Open http://localhost:8888

## Deploy

This repo is set up for Netlify auto-deploy. Push to `main` and Netlify rebuilds in ~60 seconds.

### First-time Netlify setup

1. Push this repo to GitHub
2. In Netlify: **Add new site → Import an existing project → GitHub** → select the repo
3. Build settings auto-detect from `netlify.toml`
4. Before first deploy, click **Add environment variables**:
   - Key: `ANTHROPIC_API_KEY`
   - Value: your API key from console.anthropic.com
   - **Mark as secret**, **scope: Functions**
5. **Deploy site**

### Triggering a redeploy after env variable changes

Env variable changes don't take effect on already-deployed code. Trigger a fresh deploy: **Deploys → Trigger deploy → Deploy site**.

## Get an Anthropic API key

1. Sign in at https://console.anthropic.com
2. Go to **API Keys** → **Create Key**
3. Add billing (pay-as-you-go). Each generation costs roughly $0.01–$0.04 depending on the tool. Document Decoder costs slightly more (longer outputs) than AdvisorNotes.

## Adding a new tool

When a new tool moves from "coming soon" to live:

1. **Create the tool's React page** in `src/` (e.g., `src/TranslatorPage.jsx`). Pattern matches `DecoderPage.jsx`.
2. **Add the prompt template** to the `PROMPTS` object in `netlify/functions/generate.js`.
3. **Wire the route** in `src/App.jsx`:
   ```jsx
   import TranslatorPage from "./TranslatorPage.jsx";
   // ...inside <Routes>...
   <Route path="/translator" element={<TranslatorPage />} />
   ```
4. **Flip the tool's `available` flag** to `true` in the `TOOLS` array in `src/StackHomePage.jsx`, and add `href: "/translator"`.
5. Commit. Netlify auto-deploys.

## Suite-wide design system

- **Typography:** Georgia serif for body and headlines, system-ui for labels and UI chrome
- **Color palette:**
  - Background: slate-50 (`#f8fafc`)
  - Text: slate-900 (`#0f172a`)
  - Accent: emerald-800 (`#065f46`) — used for italic wordmark fragments, accents, active borders
  - Compliance amber: `#fef3c7` background, `#fbbf24` border, `#78350f` text
  - Cream parchment: `#fefbf3` for the suite-wide compliance posture section
  - CTA: slate-900 background, hovers to emerald-800
- **Logo mark:** italic Georgia "A" in white, on an emerald-800 square (22×22 SVG)
- **Wordmark:** `Advisor` + italicized emerald `Stack` (or `Notes`, etc., for individual tools)
- **Layout:** `max-w-6xl mx-auto px-6` container, generous whitespace, thin 1px borders, sentence case (never Title Case or ALL CAPS except in tracked-out eyebrow labels)

## Compliance posture (suite-wide)

Every tool in Advisor Stack follows the same four guardrails:

1. **Drafts only, never sends.** Nothing is auto-sent, auto-filed, or auto-shared.
2. **No fabrication of facts.** If the input doesn't support it, the output flags for follow-up.
3. **Disclosure language built in.** Client-facing tools ship with appropriate disclosures pre-loaded.
4. **Subject to your firm's WSP.** All outputs treated as electronic communications under SEC 17a-4 / FINRA 4511.

## Important compliance note

This is a **prototype**. Before any production use with real client data:

- Conduct a vendor due diligence review
- Confirm your firm's WSP allows AI-assisted communications
- Add audit logging, user authentication, and data retention controls per SEC 17a-4 / FINRA 4511
- Consider a Business Associate Agreement / DPA with Anthropic if handling sensitive PII
- Verify Anthropic's data-handling defaults (inputs are not used to train models on the standard API tier)

## Known limitations / planned

- No authentication yet — anyone with a URL can use any tool
- No usage tracking, no rate limiting — public exposure could rack up API costs
- No audit logging
- Still on default `*.netlify.app` URL — custom domain not yet set up
- Per-firm customization (logos, custom disclosures) is on the roadmap
