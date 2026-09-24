# iammesudo's Claude Code plugins

## app-cloner

Clone any app's look, feel and features into a **Next.js + Tailwind + shadcn/ui + Supabase** build — the same process that turned Trade Desk into a TradingView clone:

1. **Interview** — asks everything it needs once (what to clone, how it can see the original, what must really work, what to skip).
2. **Capture** — uses the best route available: an app MCP (like `tradingview-mcp`), a public URL (screenshots + real colours/fonts/sizes via `measure.mjs`), your screenshots, or a ready-to-paste prompt you run on your own PC.
3. **Specs** — parallel agents write the parity spec, the business-logic spec (with SQL and numeric tests) and an audit of what you already have.
4. **Build** — phase by phase, with typecheck, lint, self-checks, browser tests and a commit + push after each phase.
5. **QA** — side-by-side browser audit against the reference, then fixes.

It runs fully automatically after the interview.

### Install (once)

In Claude Code (terminal on your PC, or any session):

```
/plugin marketplace add iammesudo/claude-plugins
/plugin install app-cloner@iammesudo-plugins
```

Then restart Claude Code (or start a new session).

### Use

```
/app-cloner:clone-app Clone Notion's page editor into this repo
```

or just say "clone <app> into this project" — the skill triggers on "clone / replicate / make it exactly like …".

### Always available in a repo's cloud sessions

Add to that repo's `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "iammesudo-plugins": { "source": { "source": "github", "repo": "iammesudo/claude-plugins" } }
  },
  "enabledPlugins": { "app-cloner@iammesudo-plugins": true }
}
```

### What's inside

```
plugins/app-cloner/
  .claude-plugin/plugin.json
  skills/clone-app/SKILL.md            the process
  skills/clone-app/references/         intake questions, capture routes + hand-off prompt,
                                       spec templates, build playbook (lessons learned)
  skills/clone-app/scripts/measure.mjs screenshot a URL and extract real design tokens
  agents/clone-researcher.md           parity spec
  agents/clone-logic-specialist.md     business-logic spec + SQL + acceptance tests
  agents/clone-auditor.md              browser QA and scored parity audit
```

Updating: edit files here, bump `version` in `plugins/app-cloner/.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json`, push, then `/plugin marketplace update iammesudo-plugins`.
