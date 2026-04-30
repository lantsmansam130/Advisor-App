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
- `PillCTA` — filled dark pill (primary) or outlined ghost (`dark={true}`)
- `EditorialHeading` — Instrument Serif italic + upright pair (`<EditorialHeading italic="Drafted" rest="in seconds." />`); accepts a `color` prop for inverted use on dark feature blocks
- `SectionLabel` — tracked-out uppercase eyebrow
- `palette` — single source of truth for all colors (`palette.cream`, `palette.ink`, `palette.forest`, etc.). Import this in any new page rather than hardcoding hex values.
- `darkCard`, `indigoBlock`, `skyBadge` — style objects for the three card/section flavors. Names are legacy — see "Design system" below for what they actually look like now.

`AnimatedBackground` is also exported but is a no-op stub (kept for backwards-compat with any leftover imports). Do not bring back the particle/gradient background.

**Design system (warm editorial — financial advisory brand):**

- Background: warm cream (`#F7F3EC`) everywhere — explicitly NOT pure black, NOT pure white
- Cards: white (`#FFFFFF`) on cream, with subtle warm border (`rgba(15,14,12,0.06)`) and a faint shadow
- Feature/contrast blocks: deep forest green gradient (`#16271F → #2D5142`), with cream-colored text inside — `indigoBlock` is the export name even though it's now green
- Eyebrow badge: muted sage (`rgba(31,58,46,0.08)` on forest text) — `skyBadge` is the export name even though it's no longer sky blue
- Display type: Instrument Serif (italic word + upright word pairing in headings)
- Body type: Inter
- Both fonts loaded via Google Fonts in `index.html` (do not bundle)
- Primary CTA: filled ink-black rounded-full pill with cream text, all-caps tracked Inter, arrow → suffix
- Section rhythm: cream → forest gradient → cream → white card → forest gradient → closing CTA on cream

The palette is intentionally warm and editorial (think high-end financial advisory firm, not fintech dashboard). When extending, pull colors from the exported `palette` object — don't hand-pick hex values that drift from the system.

When adding a new page, import `StackNav`, `FloatingMark`, `palette`, and the heading/CTA primitives from `StackHomePage.jsx` — don't reimplement them.

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
