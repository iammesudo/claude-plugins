# Spec templates

## 01 — Parity spec (`docs/clone/01-parity-spec.md`, by clone-researcher)

```markdown
# 01 — <App> parity for <Project>
Status · Sources note (what was measured vs researched; [verify] = unconfirmed value)
Priority legend: P0 needed now · P1 next · P2 later · Skip

## 0. Why the current app falls short (root causes from code) — only when extending
| # | Symptom | Root cause (file:line) |

## 1. Layout & chrome
1.1 Region map (ASCII diagram with sizes)
1.2 … one subsection per toolbar/panel/menu: control | reference behaviour | our requirement | Pri
1.x Navigation model: where every existing page of our app lives inside the new chrome
1.y Keyboard shortcuts table

## 2. Visual tokens
Token | value | used for | source   (hex/rgba; fonts; sizes; radii; motion)
Acceptance: side-by-side screenshot matches background, text, accent, borders, icon weight.

## 3. Core interactions (the main surface): exact behaviours + invariants to test
## 4…N. One section per feature group: behaviours, states, edge cases, P0 acceptance criteria
## N+1. Gap table: feature | reference | ours today | Pri
## N+2. Target architecture (modules, state store, data layer)
## Sources
```

## 02 — Logic spec (`docs/clone/02-logic-spec.md`, by clone-logic-specialist)

```markdown
# 02 — <Feature> logic
## 0. Decisions at a glance (D1…Dn, each with why)
## 1. Concepts & rules (units, rounding, limits)
## 2. Operations (inputs, validation, errors with exact messages)
## 3. Engine: pure functions in pseudocode — the ONE place state changes; ordering/tie-break rules
## 4. UI surface (what numbers show where, live updates, toasts)
## 5. Account/state management (reset, archive, delete)
## 6. Persistence: tables (SQL file path), atomic write strategy (versioning), offline fallback
## 7. API routes table: method | path | body | response | errors
## 8. Acceptance tests with exact numbers (AT-01…), to be asserted by scripts/check-<name>.mts
## 9. Out of scope
```

## 03 — Audit (`docs/qa/<n>-<app>-parity-audit.md`, by clone-auditor)

```markdown
# Parity audit — <date>, commit <sha>
## Scorecard: area | reference | ours | score 0–5 | evidence (screenshot file)
## Bugs: # | severity | repro | expected | actual | root cause file:line | suggested fix
## Colour check: token | reference | ours (sampled) | ✅/❌
## Prioritised fix list
```
