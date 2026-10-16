# Budgeting app engineering guide

This file is the authority for humans and coding agents in this repository. Read it before changing code.

Also read:

1. `PRODUCT.md` for confirmed behavior and open product questions
2. `docs/ORGANIZATION.md` before moving or adding files
3. `docs/TECHNICAL.md` before touching storage, dates, auth, or the API
4. `docs/SKILLS.md` before visual work
5. `DESIGN.md` before any visual change

`.cursor/rules/project-conventions.mdc` describes the old split. Those trees now live in `legacy/frontend/` and `legacy/backend/`. When that rule conflicts with this guide, follow this guide.

## Priorities

1. Correctness and money integrity.
2. Security.
3. Clear structure.
4. Accessibility.
5. Measured performance.

Trace a change from the screen through the API, the server boundary, the pure rule, storage, and the result the person sees. Fix the cause. Keep the app working. Leave unrelated code alone.

Do not commit, deploy, or delete user data unless Mike asks.

## Target layout

A structure agent is moving the app to one package. Write new work in this shape:

```text
/
  package.json          # one package. npm run dev:all starts Vite and the API together
  vite.config.ts        # proxies /api to the local API
  index.html
  src/                  # React client
    features/<feature>/ # page, components, hooks, api, schema, rules, tests
    components/ui/      # shared primitives only
  server/               # Express. Thin routes. Domain rules live outside routes.
  data/                 # user data on disk. Never delete it in routine work.
  scripts/check-file-lines.mjs
  docs/
```

The one-package tree is `src/`, `server/`, and `data/`. The previous split is parked in `legacy/` and is not the app to extend. Do not invent a third layout, a second client, or a second server.

## Legacy layout being replaced

| Area | Where it lives today |
| --- | --- |
| Pages | `legacy/frontend/src/pages/`: Home, Dashboard, Transactions, Categories, Recurring, Breakdown, Settings |
| Client API and types | `legacy/frontend/src/api/index.ts`, `legacy/frontend/src/types/index.ts` |
| Category icon ids | `legacy/frontend/src/utils/categoryIcons.ts` (`getIconById`) |
| Signed-in user and theme | `legacy/frontend/src/context/UserContext.tsx`, `legacy/frontend/src/context/ThemeContext.tsx` |
| Routes | `legacy/backend/routes/`: users, categories, transactions, recurring, export, auth |
| JSON storage | `legacy/backend/utils/db.js`, files under `legacy/backend/data/` |
| PIN token | `legacy/backend/auth/pinToken.js`, `legacy/backend/middleware/pinAuth.js` |
| Recurring processor | `legacy/backend/utils/recurringProcessor.js` |
| Request schemas | `legacy/backend/validation/schemas.js` |
| Dev command | root `npm run dev:all` starts Vite and the API together |

Live user data is `data/` at the repo root. The previous copy is `legacy/backend/data/`. Do not delete either tree in routine work.

## Feature skeleton

Build a feature when the behavior needs each part. Skip empty folders.

```text
feature/
  FeaturePage.tsx
  components/
  hooks/
  api/
  feature.schema.ts
  feature.rules.ts
  feature.test.ts
```

Map current pages onto features with the same names: `home`, `dashboard`, `transactions`, `categories`, `recurring`, `breakdown`, `settings`. Auth stays on the server. The existing Dashboard page is the month overview. Which screen owns the new budget status is not specified beyond that overview.

`src/components/ui/` holds shared primitives only. A component used by one feature stays in that feature.

## Dependencies

Dependencies point inward.

- UI and routes call services.
- Services call pure rules and a storage adapter.
- Pure domain rules must not import React, Express, or the database driver.

One file, one job. Name functions in plain English. Pass data in. Do not add `utils`, `helpers`, `common`, or catch-all `types` folders. A barrel file is only for a real public API that does not hide the owner or create a cycle.

## File size

Hand-written source files aim for 150 lines and stop at 200. This applies to `.ts`, `.tsx`, `.js`, and `.mjs` files you write or materially change.

`npm run check:lines` runs `scripts/check-file-lines.mjs` and enforces the stop. Generated output, lockfiles, and data fixtures are excluded.

An existing file that is already over the stop is a migration target. Keep a small fix small. Extract one cohesive responsibility when you are already changing that area. Do not split a file into meaningless pieces to satisfy the number.

## TypeScript

Strict TypeScript. No `any`. Start untrusted data as `unknown` and narrow it. Validate at the server boundary. A TypeScript type does not check a request, a file, or a database row. UI validation is not security.

Type exported functions, props, and API payloads. Let obvious locals infer. Use `import type` for type-only imports. Handle closed unions exhaustively.

The parked server validates with Zod in `legacy/backend/validation/schemas.js`. The live server keeps one runtime validator at the boundary.

## Dates

Store dates as `YYYY-MM-DD` strings.

Display a stored date with noon attached so a timezone does not shift the calendar day:

```typescript
new Date("2026-01-27T12:00:00").toLocaleDateString()
```

Filter by splitting the string. The transaction list query sends `month` as 0–11, matching `Date.getMonth()`, and `year` as the local calendar year:

```javascript
const [tYear, tMonth] = t.date.split("-").map(Number);
return (tMonth - 1) === month && tYear === year;
```

The client sends that local month and year. Do not derive the month from `new Date("YYYY-MM-DD")`.

The legacy recurring processor and the legacy month-export filter still construct `Date` from a date-only string. When you touch those paths, keep the calendar day stable and follow the split-string rule for month filters.

`YYYY-MM-DD` strings sort lexicographically. Same-day order uses `createdAt`.

## Money

Budget status, the major spender, and month totals are pure rules with tests. The screen and the server must call the same rule. Preserve the stored amount meaning during the SQLite move. The current JSON field is a JSON number. See `PRODUCT.md` for what is still undecided.

## Category icons

Store an icon id string. The current ids are Lucide ids rendered by `getIconById()`. Emoji are not icon ids. The icon library for the visual rehaul is not chosen. See `DESIGN.md`.

## Client

Keep rendering pure. Put event work in handlers. Derive cheap values during render. Keep server data, form state, URL state, and transient UI state distinct.

Keep HTTP in the feature `api/` module. Check the status before parsing. Show loading, empty, error, and success states.

iPhone Safari must keep a stable page width. A focused control must not zoom the page and change the layout width. Use at least 16px text on form controls. A long description must stay in its own space so the amount remains on screen.

Preserve semantic HTML, labels, keyboard use, and visible focus. Insights that name spending must be controls that open the underlying transactions, including on a phone.

`VITE_` values are public. Never put a PIN, token, or secret there.

## Server

Routes authenticate, authorize the user and the resource, validate params, query, and body, call a service, and map the result to HTTP. Domain rules stay out of route files. Do not pass Express objects into pure rules.

The API stays user-scoped. A token names one user. That user may read and write only their own categories, transactions, recurring items, and export.

The PIN stays on the server. Store only the hash. Responses omit `pinHash`. Never log a PIN, pin hash, token, or `PIN_AUTH_SECRET`.

Give the client a safe error message. Log an operational reason with a request id when you have one.

## Storage

`docs/TECHNICAL.md` is the storage contract. The target database is SQLite, migrated from the current JSON files, with the same date rules. PostgreSQL and Prisma are out of scope for this app.

## Comments

Explain why, in plain English. Comment a safety rule or an unusual money rule. Delete a comment that no longer matches the code.

## Verification

Add or update `feature.test.ts` when a domain rule changes. Cover the success path and the failure that would corrupt money, dates, or ownership.

Before handoff, run the checks that exist for the files you changed. Once `npm run check:lines` is present, run it. Review the diff for secrets, user-data deletions, and files over 200 lines.

State what you ran and what you could not run.

## Completion checklist

- The change matches the requested scope and `PRODUCT.md`.
- New files follow the target layout and the feature skeleton.
- Hand-written source stays at or under 200 lines.
- Server input is validated. The user can reach only their own data.
- Dates stay `YYYY-MM-DD` and month filters split the string.
- Money rules are pure and tested.
- User data is still on disk.
- Open product questions stayed open.
