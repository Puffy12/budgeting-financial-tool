# Organization

`AGENTS.md` is the authority. This file is the map of where code goes.

## Target tree

```text
/
  package.json              # one package
  vite.config.ts            # proxies /api to the local API
  index.html
  src/
    features/<feature>/
    components/ui/          # shared primitives only
  server/                   # Express. Thin routes.
  data/                     # user data on disk
  scripts/check-file-lines.mjs
  docs/
```

`npm run dev:all` starts Vite and the API together. The previous `frontend/` and `backend/` packages are parked in `legacy/`. New modules go into `src/` and `server/`. Do not add a third app root.

## Feature skeleton

Each feature that has real behavior uses this shape:

```text
feature/
  FeaturePage.tsx           # composes the page
  components/               # UI used by this feature
  hooks/                    # browser state and actions
  api/                      # typed HTTP client
  feature.schema.ts         # runtime boundary shared with the server
  feature.rules.ts          # pure domain behavior
  feature.test.ts           # tests for those rules
```

Current pages become features with the same jobs:

| Feature | Legacy page | Job |
| --- | --- | --- |
| `home` | `legacy/frontend/src/pages/Home.tsx` | Sign-in and user entry |
| `dashboard` | `legacy/frontend/src/pages/Dashboard.tsx` | Month overview. Budget status joins this overview unless Mike places it elsewhere |
| `transactions` | `legacy/frontend/src/pages/Transactions.tsx` | Transaction list and edits |
| `categories` | `legacy/frontend/src/pages/Categories.tsx` | Income and expense categories |
| `recurring` | `legacy/frontend/src/pages/Recurring.tsx` | Recurring items |
| `breakdown` | `legacy/frontend/src/pages/Breakdown.tsx` | Month and year analysis |
| `settings` | `legacy/frontend/src/pages/Settings.tsx` | PIN, export, import |

Feature-only pieces stay inside the feature. `src/components/ui/` is for primitives used by more than one feature: buttons, inputs, dialogs, and the same kind of control. The parked shell is `legacy/frontend/src/components/Layout.tsx`. The live shell stays thin.

## Server

`server/` is Express. Routes stay thin: authenticate, authorize, validate, call a service, map the HTTP result. A service performs one use case and calls pure rules plus a storage adapter. The storage adapter is the only server module that imports the SQLite driver or reads the legacy JSON files.

Pure rules live in `feature.rules.ts`. The client and the server both call that module. Do not add a second rules tree under `server/`.

Legacy route files and what replaces them:

| Legacy file | Target responsibility |
| --- | --- |
| `legacy/backend/routes/auth.js` | Sign-in, register, PIN change |
| `legacy/backend/routes/users.js` | Profile and summary routes, still thin |
| `legacy/backend/routes/categories.js` | Category routes |
| `legacy/backend/routes/transactions.js` | Transaction routes |
| `legacy/backend/routes/recurring.js` | Recurring routes |
| `legacy/backend/routes/export.js` | Export and import routes |
| `legacy/backend/utils/db.js` | Storage adapter, then SQLite |
| `legacy/backend/utils/recurringProcessor.js` | Recurring service plus a pure next-date rule |
| `legacy/backend/auth/pinToken.js` | Server-only token module |
| `legacy/backend/middleware/pinAuth.js` | Auth and ownership middleware |
| `legacy/backend/validation/schemas.js` | Boundary schemas, ideally the feature schema |

A route file does not compute budget status, next due dates, or month totals.

## Dependency direction

```text
FeaturePage -> hooks and components
hooks -> feature api and feature rules
routes -> services
services -> pure rules and the storage adapter
```

Pure rules import neither React, nor Express, nor the database driver. The client and the server call the same rule for a money result.

## File rules

- One file, one job.
- Aim for 150 lines. Stop at 200. `npm run check:lines` enforces the stop for hand-written source.
- Generated files, lockfiles, and data fixtures are excluded.
- Do not create `utils`, `helpers`, or `common` dumping grounds.
- The parked `legacy/frontend/src/utils/categoryIcons.ts` and `legacy/frontend/src/lib/utils.ts` are migration targets, not a pattern to copy.
- Comments explain why, in plain English.

## Data on disk

Runtime user data lives in `data/`. The previous copy is `legacy/backend/data/`. Those directories are not source. Do not delete them in routine work. Details are in `docs/TECHNICAL.md`.
