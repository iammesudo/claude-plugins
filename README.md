# iammesudo's Claude Code plugins

## app-cloner

Clone any app's look, feel and features into a **Next.js + Tailwind + shadcn/ui + Supabase** build — the same process that turned Trade Desk into a TradingView clone:

1. **Interview** — asks everything it needs once (what to clone, how it can see the original, what must really work, what to skip).
2. **Capture** — uses the best route available: an app MCP (like `tradingview-mcp`), a public URL (screenshots + real colours/fonts/sizes via `measure.mjs`), your screenshots, or a ready-to-paste prompt you run on your own PC.
3. **Specs** — parallel agents write the parity spec, the business-logic spec (with SQL and numeric tests) and an audit of what you already have.
4. **Build** — phase by phase, with typecheck, lint, self-checks, browser tests and a commit + push after each phase.
5. **QA** — side-by-side browser audit against the reference, then fixes.

It runs fully automatically after the interview.

### Install (once per computer)

Installing is account-wide, not per project: it's saved in your user settings (`C:\Users\<you>\.claude\` on Windows, `~/.claude/` on Mac/Linux) and then works in **every** project. So you can run it from any folder.

1. Open a terminal in any folder and start Claude Code: `claude`
2. Inside Claude Code:
   ```
   /plugin marketplace add iammesudo/claude-plugins
   /plugin install app-cloner@iammesudo-plugins
   ```
3. `/exit`, then start `claude` again so the plugin loads. Check with `/plugin` → it should list `app-cloner` as enabled.

**"Not found" or an authentication error in step 2?** This repo is private, so your computer's git must be logged in to GitHub: run `gh auth login` (or set up Git Credential Manager), then retry. Or make the repo public (Settings → General → Danger Zone → Change visibility) — it contains no secrets.

> Installing inside a Claude Code **cloud** session only lasts for that session. For cloud sessions, use the `.claude/settings.json` snippet below in the repo you work on.

### Use

Open Claude Code **in the folder of the project the clone should be built in** — an existing repo to extend, or a new empty folder for a brand-new app. That's where it writes `docs/clone/…` and the code. Then say:

```
clone Notion's page editor into this project
```

or run `/app-cloner:clone-app <what to clone>`. It triggers on "clone / replicate / make it exactly like …".

What happens next:
- It asks its questions once (2–3 rounds), then runs fully automatically.
- If the original can only be reached on your computer (a desktop app, a logged-in account, a local MCP like `tradingview-mcp`), it gives you a prompt to paste into Claude Code on that computer; it keeps building meanwhile and uses your screenshots when you've pushed them.
- It commits and pushes after every phase and ends with a summary of what matches, what was skipped, and anything you must do (e.g. run a SQL file in Supabase).

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
