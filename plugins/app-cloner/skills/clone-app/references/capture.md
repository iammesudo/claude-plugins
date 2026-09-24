# Capturing the reference

Goal: `docs/clone/reference/` holds screenshots of everything that matters plus a README with **measured** values. Measured numbers beat memory; screenshots beat descriptions.

## What to capture (checklist)

- Every main screen at desktop size (≈1440×900) and at phone size (390×844) if the app has mobile.
- Every toolbar/menu/flyout **open**, every dialog and each of its tabs.
- States: hover, selected, active/pressed, disabled, empty, loading, error.
- One "busy" screen with real content (not an empty account).
- Tokens: page/panel backgrounds, borders/dividers, text primary/secondary/muted, accent + hover + pressed, success/danger (or up/down), focus ring, shadows, radii, font family and sizes, toolbar/bar heights and widths, icon size and stroke, spacing/gutters.
- Behaviour notes: keyboard shortcuts (from tooltips/help), what happens on resize, what persists across reloads.

## Route 1 — an MCP for the app is connected in this session

Find it: `ToolSearch` with the app name and verbs (`tradingview`, `chart`, `screenshot`, `notion`, `figma get_design_context`…). Typical useful tools: screenshot, get-state, get-settings/theme, list items. Use CSS-variable/DOM reads when the MCP exposes JavaScript evaluation (desktop apps built on Chromium/Electron usually do via CDP): `getComputedStyle(document.documentElement)` and the app's theme variables are the gold standard.

## Route 2 — public website: `scripts/measure.mjs`

```bash
# cloud sessions: Chromium is preinstalled; resolve the global Playwright package
node ${CLAUDE_SKILL_DIR}/scripts/measure.mjs https://example.com docs/clone/reference [--mobile]
```
It saves full-page + viewport screenshots and `tokens.json` (CSS custom properties, the most common background/text/border colours, fonts, font sizes, radii, heights of header/nav/sidebars). Then click through menus and dialogs yourself with a short Playwright script for the "open" states.

If the site needs a login, don't ask for passwords — use Route 4 (the user runs it on their machine) or screenshots.

## Route 3 — the user uploaded screenshots/recordings

Read every image. Estimate tokens by sampling (describe the hex you see; mark `[verify]`). Ask for nothing more — the brief said fully automatic.

## Route 4 — only the user's computer can reach it (hand-off prompt)

Fill this in and give it to the user in one fenced block, with three instructions above it:
1. Open <App> (and anything its MCP needs, e.g. "launch it with the debug-port shortcut") with a real, busy screen showing.
2. Open Claude Code in this repo on that computer (`claude` in a terminal in the project folder), check the MCP with `/mcp`.
3. Paste the prompt.

```
git fetch origin && git checkout <BRANCH> && git pull
Capture a visual reference of <APP> for cloning it into this repo.
Tools: use the <MCP NAME> MCP if it is connected (run its health/status tool first); otherwise take screenshots with the OS screenshot tool and save them into the repo.
1. Screenshots (PNG) into docs/clone/reference/, numbered and named, of:
   <LIST: every main screen; each toolbar menu/flyout open; each dialog + every tab; selected/hover states of <KEY OBJECTS>; empty state; settings>.
2. Exact values: read the app's theme / CSS variables / computed styles (via the MCP's JS/DOM access if available) for backgrounds, panels, borders, text colours, accent, success/danger, crosshair/selection colours, fonts and sizes, toolbar heights/widths, radii. Record where each number came from.
3. Keyboard shortcuts shown in tooltips/menus.
4. Write docs/clone/reference/README.md: a table of screenshots, a measured-values table compared against docs/clone/01-parity-spec.md items tagged [verify] (✅ matches / ❌ use measured), and anything you could not measure.
Commit and push to <BRANCH>.
```

Then keep building from public docs. When the user says it's pushed: `git pull`, read the screenshots, update tokens/layout, note the changes in the spec.

## Route 5 — public docs (always)

WebSearch/WebFetch the help centre, docs, changelog/blog, keyboard-shortcut page. If fetching the site is blocked by the network proxy, rely on search excerpts and say so in the spec (tag unverified values `[verify]`).
