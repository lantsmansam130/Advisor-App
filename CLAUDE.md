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

**One serverless backend, two request shapes.** The entire backend is a single Netlify function at `netlify/functions/generate.js`. It handles two distinct flows:

1. **Multi-turn streaming chat** (`outputType: "advisor_chat"`) — used by AdvisorNotes. Body is `{ outputType, messages: [{role, content}, ...] }`. The function builds a request to `claude-sonnet-4-6` with a large pre-baked system prompt (`ADVISOR_SYSTEM_PROMPT`, prompt-cached via `cache_control`), enables `stream: true`, and pipes Anthropic's SSE response straight through to the client. The frontend parses `content_block_delta` events and streams the text into a chat bubble.
2. **One-shot draft generation** (every other `outputType`) — used by Document Decoder and the legacy form-based prompts. Body is `{ notes, tone, outputType }`. The function dispatches into the `PROMPTS` object (one entry per output type), calls Anthropic non-streaming, returns `{ text }`.

**To add a new one-shot tool, add a new key to `PROMPTS`.** To add a new chat behavior or system prompt, fork on `outputType` near the top of the handler — don't create a new function file. Keep `ADVISOR_SYSTEM_PROMPT` stable so its cache prefix stays valid; if you change it, the first request after deploy pays the full input cost again.

The function caps inputs per tool (`document_decoder` gets 15000 chars / 3000 max output tokens; chat caps each message at 16000 chars and trims to the last 30 turns; legacy one-shot tools cap at 8000 / 2000). One-shot tools currently use `claude-sonnet-4-5`; chat uses `claude-sonnet-4-6`.

**Routing is client-side, in `src/App.jsx`.** Four routes today:

| URL | Component | File |
|---|---|---|
| `/` | `StackHomePage` (suite home) | `src/StackHomePage.jsx` |
| `/notes` | `LandingPage` (AdvisorNotes marketing) | `src/LandingPage.jsx` |
| `/app` | `AdvisorChatPage` (the AdvisorNotes chat) | `src/AdvisorChatPage.jsx` |
| `/decoder` | `DecoderPage` | `src/DecoderPage.jsx` |

**`AdvisorChatPage` is a full chat UI:** left sidebar with new-chat button, curated example prompts, and recent-chat history (persisted to localStorage at key `advisornotes.chats.v1`, capped at 50 chats); main pane with empty-state example-prompt cards or the streaming message thread; composer with auto-grow textarea (Enter sends, Shift+Enter newline). The SSE parser is in the same file (`streamChatResponse`) — it reads `content_block_delta` text deltas and ignores other event types.

When a planned tool ships, it gets its own route + page component. The suite homepage's `TOOLS` array (top of `StackHomePage.jsx`) drives the grid — flip `available: true` and add `href` to surface a tool there.

**`StackHomePage.jsx` is the design-system module.** Beyond rendering `/`, it exports the shared visual primitives that every page imports:

- `StackNav` — floating dark pill nav (top of every page)
- `FloatingMark` — circular "A" logo fixed bottom-right
- `PillCTA` — filled dark pill (primary) or outlined ghost (`dark={true}`)
- `EditorialHeading` — Instrument Serif italic + upright pair (`<EditorialHeading italic="Drafted" rest="in seconds." />`); accepts a `color` prop for inverted use on dark feature blocks
- `SectionLabel` — tracked-out uppercase eyebrow
- `palette` — single source of truth for all colors (`palette.cream`, `palette.ink`, `palette.charcoal`, `palette.forest`, etc.). Import this in any new page rather than hardcoding hex values.
- `darkCard`, `inkBlock`, `indigoBlock`, `skyBadge` — style objects for the four card/section flavors. Names are legacy — see "Design system" below for what they actually look like now.

`AnimatedBackground` is also exported but is a no-op stub (kept for backwards-compat with any leftover imports). Do not bring back the particle/gradient background.

**Design system (warm editorial — financial advisory brand):**

- Background: warm off-white (`#FAF6EE`) — explicitly NOT pure black, NOT pure white, slightly less yellow than a classic cream
- Cards: white (`#FFFFFF`) on cream, with subtle warm border (`rgba(15,14,12,0.06)`) and a faint shadow
- Two distinct contrast moods, used as full-bleed feature blocks to break up the cream:
  - `inkBlock` — warm charcoal (`#1A1815`, NOT pure black) with cream type, used once per page for a "darker chapter" mood
  - `indigoBlock` — deep forest green gradient (`#16271F → #2D5142`) with cream type, used once per page as the deepest accent
- Eyebrow badge: muted sage (`rgba(31,58,46,0.08)` on forest text) — `skyBadge` is the export name even though it's no longer sky blue
- Display type: Instrument Serif (italic word + upright word pairing in headings)
- Body type: Inter
- Both fonts loaded via Google Fonts in `index.html` (do not bundle)
- Primary CTA: filled ink-black rounded-full pill with cream text, all-caps tracked Inter, arrow → suffix
- Section rhythm aim: alternate cream sections with one **inkBlock** and one **indigoBlock** per page so the eye gets variation. Don't stack two contrast blocks back-to-back; let cream breathe between them.
- The `/notes` page leads with a styled chat preview (rendered mock UI in a window-chrome frame) instead of plain centered text — show the product, don't just describe it.

The palette is intentionally warm and editorial (think high-end financial advisory firm, not fintech dashboard). When extending, pull colors from the exported `palette` object — don't hand-pick hex values that drift from the system.

When adding a new page, import `StackNav`, `FloatingMark`, `palette`, and the heading/CTA primitives from `StackHomePage.jsx` — don't reimplement them.

**Document upload (DecoderPage):** Uses `pdfjs-dist` for in-browser PDF text extraction (no backend cost, no server processing). The lib + worker are dynamically imported so the 1MB+ chunk only loads when a user actually drops a file. Plain `.txt` / `.md` files use `file.text()`. Scanned PDFs without a text layer aren't supported (no OCR yet) — the UI tells the user to paste instead.

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
