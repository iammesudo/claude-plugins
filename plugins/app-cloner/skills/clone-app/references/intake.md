# Intake interview

Ask once, up front, with AskUserQuestion (≤4 questions per call, 2–3 calls). Put the recommended option first with "(Recommended)". Skip any question the repo or the user's message already answers. Users can always type "Other".

## Call 1 — what and from where

1. **Which app are we cloning, and which part?** (header: "Target")
   Options adapted to the message, e.g. "The whole app", "Only the main screen (e.g. chart / editor / board)", "Specific features — I'll list them".
2. **How can I see the original?** (header: "Reference", multiSelect)
   - "Its website — I'll give the URL" (recommended for web apps)
   - "It's on my computer (desktop app / logged-in / local MCP) — give me a prompt to run there"
   - "I'll upload screenshots or a screen recording"
   - "An MCP / connector that's connected here"
3. **New app or add to this repo?** (header: "Project") — only if the working directory is ambiguous.
   - "Extend this repo (Recommended)" / "New Next.js app in a new folder"
4. **Who is it for?** (header: "Audience")
   - "Just me, private (Recommended)" — allows copying the reference name in UI
   - "Public / portfolio" — neutral name and logo, no trademarks

## Call 2 — behaviour and data

5. **What must work for real (not just look right)?** (header: "Must work", multiSelect) — derive options from the app, e.g. for a trading app: "Live data", "Drawing tools", "Paper trading / simulated money", "Backtest / replay"; for Notion: "Editing blocks", "Sharing", "Database views", "Offline".
6. **Where should data be saved?** (header: "Data")
   - "Supabase, synced across devices (Recommended)" / "Browser only for now" / "No saving needed"
7. **Devices?** (header: "Devices") — "Desktop + phone (Recommended)" / "Desktop only" / "Phone first"
8. **Anything to leave out?** (header: "Skip", multiSelect) — offer the reference's big optional areas (e.g. "Social/community", "Alerts/notifications", "Multi-window layouts", "Payments"). Everything not picked is in scope as P0/P1.

## Call 3 — only if needed

- Login/auth model (existing PIN/password, Supabase Auth, none)
- Real third-party APIs and keys (market data, maps, payments) — which the user has
- Deadline/size preference: "Must-haves only" vs "As close to 100% as possible"

## Write the brief

`docs/clone/00-brief.md`:

```markdown
# Clone brief — <App> → <this project>
Date · Branch · Stack: Next.js + Tailwind + shadcn/ui + Supabase + Vercel
## Target
## Reference sources (and what is blocked)
## Must work for real
## Data & devices
## Out of scope (explicit)
## Audience / branding rule
## Owner's complaints or goals, in their words
```
