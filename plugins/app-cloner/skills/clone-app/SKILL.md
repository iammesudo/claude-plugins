---
name: clone-app
description: Clone an existing app's look, feel and features (TradingView, Notion, Linear, a banking app, any website or desktop app) into a Next.js + Supabase build, end to end. Interviews the user first, captures the reference app (app MCP, live URL, uploaded screenshots, or a hand-off prompt the user runs on their own PC), writes parity specs, audits what already exists, builds in phases with tests and commits, and QA-checks the result side by side against the reference. Use when the user says "clone", "copy", "replicate", "make it look/work exactly like X", "same as X", or "X clone".
---

# Clone an app

You are running a proven, fully automatic cloning process. It was first used to turn a small trading app into a pixel-and-behaviour match of TradingView (full-screen chart, drawing tools, bar replay, paper trading) — follow the same shape.

**The user chose "fully automatic":** ask everything you need **once, up front** (Phase 0), then run to the end without stopping for approval. Only stop again if you are truly blocked (e.g. the reference can only be captured on the user's own computer — Phase 2B), and even then keep building everything that doesn't depend on it.

**Stack is fixed:** Next.js (App Router, TypeScript) + Tailwind CSS + shadcn/ui + Supabase (service-role key server-side only, RLS on) + Vercel. If the target repo already uses this stack, extend it; if it's empty, scaffold it (see `references/build-playbook.md`).

Supporting files (read them when you reach that phase, not before):
- `${CLAUDE_SKILL_DIR}/references/intake.md` — the interview
- `${CLAUDE_SKILL_DIR}/references/capture.md` — how to capture the reference, incl. the hand-off prompt
- `${CLAUDE_SKILL_DIR}/references/spec-templates.md` — parity spec, logic spec and audit layouts
- `${CLAUDE_SKILL_DIR}/references/build-playbook.md` — architecture rules and hard-won lessons
- `${CLAUDE_SKILL_DIR}/scripts/measure.mjs` — Playwright script that screenshots a URL and extracts real colours, fonts and sizes

Agents bundled with this plugin (spawn them with the Agent tool, in the background, in parallel where independent):
- `clone-researcher` — lists every feature and UI detail of the reference and writes the parity spec
- `clone-logic-specialist` — writes requirements + exact logic for the hard business features (money, scheduling, sync, games…), with numeric acceptance tests
- `clone-auditor` — runs the app in a browser and scores it against the reference; finds root causes

---

## Phase 0 — Interview (the only time you ask)

Read `references/intake.md` and ask with **AskUserQuestion** (max 4 questions per call; use 2–3 calls). Pre-fill smart defaults and mark one option "(Recommended)". Never ask what you can find out yourself (repo contents, stack, connected MCPs). Then write the answers to `docs/clone/00-brief.md` and commit it — this brief is the contract every later phase and agent reads.

## Phase 1 — Recon (no questions)

1. Look at the working directory: existing app? which routes/features? (`git log --oneline | head`, `package.json`, `src/app/**`). Decide: **extend** or **scaffold**.
2. Find the best capture route, in this order (details in `references/capture.md`):
   1. **An MCP for the reference app is connected here** → use it. Search deferred tools with ToolSearch using the app's name and obvious verbs (e.g. `tradingview`, `chart_get_state`, `notion`, `figma`). Also `ListMcpResourcesTool`.
   2. **The app is a public website** → `scripts/measure.mjs` with Playwright (Chromium is usually preinstalled; never run `playwright install` in cloud sessions — use the existing browser path).
   3. **The user uploaded screenshots / recordings** → use them; ask nothing more.
   4. **The reference only exists on the user's computer** (desktop app, logged-in account, local MCP) → Phase 2B hand-off.
   5. Always add **public docs research** (WebSearch/WebFetch the app's help centre, docs, changelog) — it's what fills the feature list.
3. Note what's blocked and why in the brief.

## Phase 2 — Capture the reference

**2A (you can reach it):** capture into `docs/clone/reference/`: screenshots of every main screen, every menu/flyout, every dialog tab, selected/hover/active states, empty states, mobile width; plus `docs/clone/reference/README.md` with a **measured tokens table** (background, panels, borders, text primary/secondary, accent, up/down or success/danger, fonts, radii, bar/toolbar heights, icon sizes, spacing) and "where each number came from". Measured values beat guesses; mark any guess `[verify]`.

**2B (only the user's machine can reach it):** generate the hand-off prompt from `references/capture.md`, filled in for this app, and give it to the user in a fenced block with 3-line instructions (open the app, open Claude Code in the repo on that machine, paste). It must end with "commit and push to `<branch>`". **Don't wait idle**: continue Phases 3–5 from public docs, then when the user says it's pushed, `git pull`, read every screenshot (you can view images) and re-tune tokens/layout.

## Phase 3 — Specs (parallel agents)

Spawn in the background, in one message:
- `clone-researcher` → `docs/clone/01-parity-spec.md` (layout map, tokens, every feature with P0/P1/P2, interactions, shortcuts, a gap table vs the current app, target architecture).
- `clone-logic-specialist` → `docs/clone/02-logic-spec.md` — only if the brief lists hard logic (money, balances, bookings, scheduling, permissions, realtime, games, replay/backtest…). Must include data model SQL (`supabase/NNN_<prefix>_*.sql`, RLS on) and numeric acceptance tests.
- `clone-auditor` → `docs/clone/03-baseline-audit.md` — only when extending an existing app: current parity score and root causes.

Give each agent: the brief path, the reference folder, the repo path, the exact output path, "don't modify app code, don't commit", and a ≤300-word hand-back format. While they run, read the code you'll change. When they return: read the specs yourself (don't just trust the summaries), reconcile with the measured reference (measured wins), commit the docs.

Scope rule: build **P0 fully**, P1 only when cheap or explicitly requested, never P2 unless asked. Respect everything the brief says to skip.

## Phase 4 — Build (phased, each phase shippable)

Follow `references/build-playbook.md`. Typical phases:
1. **Shell & tokens** — the reference's layout, theme tokens as CSS variables (hex, not oklch, if a canvas/chart library reads them), navigation model, mobile layout.
2. **Core surface** — the main screen and its interactions (editor, chart, board, feed…), built for stability (create once, update in place).
3. **Features** — P0 feature list, one group at a time.
4. **Logic** — engine as pure TS modules + a self-check script (`npm run check:<name>`) asserting every acceptance test from the logic spec; persistence through Supabase with atomic writes; offline/local fallback when tables aren't there yet.

After **every** phase: `npx tsc --noEmit`, `npx eslint`, the self-checks, and a browser run (see "Testing" below) with screenshots you actually look at; fix, then commit with a clear message and push. Never leave the branch broken.

## Phase 5 — Side-by-side QA

Spawn `clone-auditor` (or do it yourself if small): desktop 1440×900 + phone 390×844, every P0 flow, console errors, colours sampled vs the tokens table, screenshots next to the reference ones. Fix every high-severity finding, re-test, commit.

## Phase 6 — Hand-over

Reply with: what now matches (per original complaint/goal), what's intentionally skipped, anything the user must do (run SQL files in order, env vars, deploy), and the PR/branch link. Don't create a PR unless asked; offer it in one line.

---

## Testing in a browser (cloud or local)

- Auth walls: add a **temporary, local-only bypass** (env flag like `DEV_BYPASS=1` checked in the proxy/auth helper, plus synthetic data where external APIs are unreachable). Keep it in a patch script in your scratchpad, apply for testing, and **revert it before every commit** (`git checkout -- <files>`; then `grep -rn "DEV BYPASS" src` must be empty). Never commit it, never commit `.env.local`.
- Use `waitUntil: "load"` plus a fixed wait, not `networkidle` (live feeds never go idle).
- Test the user's actual complaints first, with assertions (e.g. "visible range identical after action X").
- Delete generated `AGENTS.md` / `CLAUDE.md` files that frameworks drop into the repo during dev.

## Ground rules

- Clone **look, layout, behaviour and features** with your own code. Don't copy the reference's source code, proprietary assets, logos or trademarks into the build; use a neutral name/logo unless the brief says it's a private personal tool. Icons: use lucide (thin stroke) or simple custom SVGs in the same style.
- Never rewrite history on shared branches; commit per phase; follow the repo's branch instructions.
- If an agent was stopped or failed, don't silently relaunch it — do the work yourself or tell the user.
