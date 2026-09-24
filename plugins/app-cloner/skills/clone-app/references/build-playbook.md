# Build playbook (Next.js + Tailwind + shadcn/ui + Supabase + Vercel)

## Scaffolding a new app (only when the brief says "new")

```bash
npx create-next-app@latest <name> --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
cd <name> && npx shadcn@latest init -d && npm i @supabase/supabase-js zustand lucide-react sonner
```
- `src/lib/db.ts`: one server-only Supabase client from `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`; `isMissingTable(error)` helper so screens can say "run supabase/00N first".
- `supabase/001_<prefix>_*.sql`, numbered, every object prefixed (shared databases), `enable row level security` with no policies (server-only access).
- `.env.example` documenting every variable; never commit `.env.local`.

## Architecture rules that made the TradingView clone feel right

1. **The main surface is created once.** Canvas/chart/editor/map widgets are imperative: create them in one `useEffect([], …)`, keep them in a controller class, update in place. Never tear down and rebuild on a React render. Never pass inline callbacks or new arrays as effect deps of the widget — that re-runs the effect on every render (this was the "view resets when I click Long/Short" bug).
2. **State lives in a small store** (zustand) the controller subscribes to directly (`store.subscribe` with selectors), so React re-renders can't reach the widget. Fast-changing values (cursor position, live prices) get their own tiny stores so only the component that shows them re-renders.
3. **Only user actions move the view.** Live updates use incremental updates (e.g. `series.update`), history loads restore the visible range after prepending, and nothing calls "fit to content" except first load.
4. **Overlays that must stick to the content** (drawings, annotations, selections) render inside the widget's own render loop (e.g. lightweight-charts series primitives, canvas layers), store coordinates in data space (time/price, row/col), never pixels, and share one geometry function for painting and hit-testing.
5. **One pointer state machine** for create / select / drag handle / move / clone (Ctrl-drag) / erase, with generous hit tolerance (≥6px mouse, ≥14px touch). When it takes a gesture it stops the event from reaching the widget; otherwise it lets it through so pan/zoom keep working. Delete/Backspace, Esc, right-click menu, floating toolbar, settings dialog, undo/redo via store snapshots.
6. **App shell = the reference's chrome.** Put the persistent main surface in the route-group layout so it never unmounts; other pages become side panels or full-screen sheets over it (deep links still work). Mobile gets the reference's mobile pattern (bottom tabs, bottom sheets).
7. **Theme tokens** as hex CSS variables on `:root` mapped into shadcn's variables, and mirrored in a TS `theme.ts` for canvas libraries (they can't parse `oklch`). Use the measured values from `docs/clone/reference/README.md`.
8. **Business logic = pure TS engine + self-check.** No I/O inside; functions take state and return/record changes and user-facing notices. `scripts/check-<name>.mts` asserts every acceptance test from the logic spec (`node --no-warnings=MODULE_TYPELESS_PACKAGE_JSON scripts/check-<name>.mts`, added to package.json as `check:<name>`). Run it before every commit.
9. **Persistence with one atomic write path**: a Postgres function (`<prefix>_commit(id, expected_version, changes jsonb)`) doing all inserts/updates in one transaction with an optimistic `version`; client-generated ids for idempotency; server-side ledger/sanity checks; 409 → reload latest state. If the tables are missing (or no DB configured), fall back to localStorage and show a one-line banner telling the user which SQL file to run.
10. **External data via your own API routes** (`/api/...`) so keys stay server-side and you can fall back between providers; client polls or streams from them. Pin Vercel regions if a provider geo-blocks.

## Per-phase definition of done

- [ ] `npx tsc --noEmit` clean · `npx eslint src scripts` clean · all `npm run check:*` pass
- [ ] `npx next build` passes at least at the end (catches server/client boundary mistakes)
- [ ] Browser run (desktop + phone) with screenshots you looked at; the user's original complaints re-tested with assertions
- [ ] No dev bypass, `.env.local`, generated `AGENTS.md`/`CLAUDE.md` or test artefacts staged
- [ ] Commit message says what changed and why; push to the working branch

## Lessons from past clones

- Read the reference's measured tokens before styling; our first guess (#131722 "classic" TradingView) was wrong — the measured current theme was #0F0F0F with #2E2E2E gutters.
- Check field names of existing APIs before wiring (the journal API returned snake_case; a camelCase read silently showed nothing).
- Settings stored as percents must be divided by 100 before use (a fee bug overstated costs 100×).
- `pkill -f <pattern>` can kill your own shell if the pattern appears in the command line — target PIDs explicitly.
- Background agents can be stopped by the user's interrupt; check their output exists before relying on it.
