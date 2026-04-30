# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install                      # Install deps
npm run build                    # Vite production build → dist/
npm run preview                  # Preview the prod build locally

netlify dev                      # Run with serverless functions (port 8888)
                                 # Requires: ANTHROPIC_API_KEY in .env, netlify-cli installed globally
```

There is no test suite, linter, or typechecker configured. The only quality gate before merging is `npm run build` succeeding.

## Deploys

Netlify auto-deploys every push to `main` (~60s). There is no staging branch — `main` is live. `netlify.toml` defines the build command, the `netlify/functions/` path, and a SPA catch-all redirect (`/* → /index.html`).

## Architecture

**One serverless backend, many tools.** The entire backend is a single Netlify function at `netlify/functions/generate.js`. Every tool's frontend POSTs to `/.netlify/functions/generate` with `{ notes, tone, outputType }`. The function dispatches on `outputType` into a `PROMPTS` object (one entry per tool/output type), then calls Anthropic's API. **To add a new tool's behavior, add a new key to `PROMPTS` — do not create a new function file.**

The function caps inputs differently per tool (`document_decoder` gets 15000 chars / 3000 max output tokens; everything else 8000 / 2000) and uses model `claude-sonnet-4-5`.

**Routing is client-side, in `src/App.jsx`.** Four routes today:

| URL | Component | File |
|---|---|---|
| `/` | `StackHomePage` (suite home) | `src/StackHomePage.jsx` |
| `/notes` | `LandingPage` (AdvisorNotes marketing) | `src/LandingPage.jsx` |
| `/app` | `ToolPage` (the AdvisorNotes tool) | `src/App.jsx` |
| `/decoder` | `DecoderPage` | `src/DecoderPage.jsx` |

When a planned tool ships, it gets its own route + page component. The suite homepage's `TOOLS` array (top of `StackHomePage.jsx`) drives the grid — flip `available: true` and add `href` to surface a tool there.

**`StackHomePage.jsx` is the design-system module.** Beyond rendering `/`, it exports the shared visual primitives that every page imports:

- `StackNav` — floating dark pill nav (top of every page)
- `FloatingMark` — circular "A" logo fixed bottom-right
- `PillCTA` — white pill button (primary) or outlined (`dark={true}`)
- `EditorialHeading` — Instrument Serif italic + upright pair (`<EditorialHeading italic="Drafted" rest="in seconds." />`)
- `SectionLabel` — tracked-out uppercase eyebrow
- `darkCard`, `indigoBlock`, `skyBadge` — style objects for the three card/section flavors

`AnimatedBackground` is also exported but is a no-op stub (kept for backwards-compat with any leftover imports). Do not bring back the particle/gradient background — the design has moved to flat black + indigo gradient feature blocks.

**Design system (Origin-inspired, dark editorial):**

- Background: pure black (`#000`) everywhere
- Display type: Instrument Serif (italic word + upright word in headings)
- Body type: Inter
- Both fonts loaded via Google Fonts in `index.html` (do not bundle)
- Primary CTA: white rounded-full pill, all-caps tracked Inter, arrow → suffix
- Cards: subtle dark (`rgba(255,255,255,0.025)` on `rgba(255,255,255,0.07)` border)
- Feature blocks: indigo→violet gradient (`#0f0a3d → #5b4fe5`)
- Section rhythm: black → indigo gradient → black → dark card → indigo gradient → closing CTA

When adding a new page, import `StackNav`, `FloatingMark`, and the heading/CTA primitives from `StackHomePage.jsx` — don't reimplement them.

## Compliance posture (shapes prompts and copy)

Every tool follows four guardrails baked into both the UI and the `PROMPTS`:
1. Drafts only — never auto-send
2. No fabrication of facts beyond the input
3. Disclosure language pre-loaded for client-facing outputs
4. Outputs are treated as electronic communications under SEC 17a-4 / FINRA 4511

When editing prompts in `generate.js`, preserve the `DO NOT` recommendation/solicitation guards and the closing disclosure line that each prompt ends with.

## Adding a new tool (full path)

1. Add a `PROMPTS[<id>]` entry in `netlify/functions/generate.js`
2. Create `src/<Tool>Page.jsx` — pattern-match `DecoderPage.jsx` (it's the simplest)
3. Add `<Route>` in `src/App.jsx`
4. In the `TOOLS` array in `src/StackHomePage.jsx`, set `available: true` and add `href`
5. Push to `main` — Netlify deploys
