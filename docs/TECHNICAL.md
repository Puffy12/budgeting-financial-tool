# Technical contract

Read this before changing storage, dates, auth, or the API. `AGENTS.md` remains the authority for how code is structured.

## User-scoped API

The API is user-scoped. Legacy routes mount under `/api`, with user resources at `/api/users/:userId/`.

| Method | Path | Role |
| --- | --- | --- |
| POST | `/api/auth/register` | Create a user with a name and PIN |
| POST | `/api/auth/pin-login` | Sign in |
| POST | `/api/auth/set-pin` | Set a PIN when the user has none |
| POST | `/api/auth/validate-token` | Check a token |
| PUT | `/api/auth/change-pin` | Change the PIN for the signed-in user |
| GET, PUT, DELETE | `/api/users/:userId` | That user's profile |
| * | `/api/users/:userId/categories` | That user's categories |
| * | `/api/users/:userId/transactions` | That user's transactions |
| * | `/api/users/:userId/recurring` | That user's recurring items |
| POST | `/api/users/:userId/recurring/:id/process` | Create the due transaction for one item |
| GET | `/api/users/:userId/stats/summary` | Month summary. Client sends local `month` and `year` |
| GET | `/api/users/:userId/stats/monthly` | Monthly breakdown |
| GET | `/api/users/:userId/stats/comparison` | Month comparison |
| GET, POST | `/api/users/:userId/export` and `/import` | That user's backup and restore |

Auth routes are the exception that does not require a token yet. Every other user path checks the token and checks that the token's user matches `:userId`. Keep that check on the server.

`DEV_MODE=true` skips the token check outside production. Leave that switch local. Do not widen it, and do not enable it in production.

Transaction list query `month` is 0–11. The export path `/export/month/:year/:month` treats `:month` as a calendar month, 1–12. Keep both contracts until a deliberate change updates the client and the server together.

List responses stay paginated: `{ transactions, total, limit, offset }`.

## JSON shapes to keep

During the move to SQLite, request and response shapes stay compatible with the current client types.

User: `id`, `name`, `createdAt`, `updatedAt`. Never send `pinHash`.

Category: `id`, `userId`, `name`, `type` (`income` or `expense`), `icon`, `createdAt`, `updatedAt`.

Transaction: `id`, `userId`, `categoryId`, `amount`, `type`, `date`, `notes`, `isRecurring`, `recurringId`, `createdAt`, `updatedAt`. A list item may include a nested `category` of `id`, `name`, and `icon`.

Recurring: `id`, `userId`, `name`, `categoryId`, `amount`, `type`, `frequency` (`weekly`, `biweekly`, `monthly`, `quarterly`, `yearly`), `startDate`, `nextDueDate`, `notes`, `isActive`, `createdAt`, `updatedAt`.

`amount` is a JSON number. Keep that meaning. `date`, `startDate`, and `nextDueDate` are `YYYY-MM-DD`. `icon` is an icon id, never an emoji.

There is no budget record yet. Do not invent its fields while the open questions in `PRODUCT.md` are unanswered.

## Dates

Store calendar dates as `YYYY-MM-DD`. Display them with `T12:00:00` attached. Filter a month by splitting the string. The client sends the local month and year. Transaction filters compare `month` 0–11 to the calendar month minus one.

The legacy recurring processor builds the next due date with `new Date(currentDate)` and `toISOString()`. The legacy month export filters with `new Date(t.date)`. Those paths can shift a calendar day. When you change them, split the stored string and write back `YYYY-MM-DD`.

## Current JSON storage

Live JSON is under `data/`. The parked copy is `legacy/backend/data/`, written by `legacy/backend/utils/db.js`:

```text
data/users.json
data/{userId}/categories.json
data/{userId}/transactions.json
data/{userId}/recurring.json
```

Writes go to a temp file and then rename over the target. Keep that atomic replace for any JSON write that remains. A crash mid-write must leave the previous file intact.

Reads today load a whole collection file. That is a property of the JSON files. Do not copy it into SQLite.

## SQLite target

SQLite replaces the JSON files. The target files live under `data/` at the repo root. PostgreSQL and Prisma are out of scope. Access the database through a storage adapter. Pure rules must not import the SQLite driver.

Related writes commit in one transaction. A failed write leaves the previous rows in place.

Add indexes for the growing transaction list, at least the user and the date columns the month filter uses. Query the page or the month that was asked for. Once SQLite is in place, do not read the full transaction collection to answer a month, a page, or a summary.

Timeouts are not a concern yet. Pagination and indexed reads are the bound that matters.

Migrate existing JSON into SQLite without changing date strings, amounts, ids, or ownership. Do not delete `legacy/backend/data/` or `data/` as part of routine work. A migration task copies forward and verifies. Mike decides when the old files can be removed.

## PIN

The PIN stays on the server. The legacy auth route hashes it with bcrypt (cost 12) and stores `pinHash` on the user record. The login schema requires exactly four digits. Responses strip `pinHash`.

The session token is an HMAC built in `server/auth/pinToken.js` (parked original: `legacy/backend/auth/pinToken.js`) from the user id, an expiry, and `PIN_AUTH_SECRET`. The legacy TTL is 14 days. If `PIN_AUTH_SECRET` is missing, the process generates a random secret and existing tokens die on restart. Set the secret in the server environment when tokens should survive a restart.

Never log a PIN, a pin hash, a token, `PIN_AUTH_SECRET`, or a full auth body.

## Logging and imports

Log a short operational reason. Leave secrets and full transaction exports out of logs.

Import accepts `merge` or `replace` for that user only. `replace` overwrites that user's collections. Do not point an import at another user's directory.

## Production deployment and backups

The Opalstack project is `/home/advran/apps/budgeting-financial-tool/myproject`.
Its original `data/`, `.env`, and `storage/` remain in place during deployment.
The new `server/` and existing `data/` are siblings. Opalstack's launcher runs
`npm start`, which now runs `node server/server.js` from this project root.
The laptop's `data/` is a separate development copy and is never uploaded.

- `npm run backup:production` makes and verifies a production backup without restarting.
- `node scripts/deploy.mjs --check-env` checks local deployment configuration without connecting.
- `npm run test:deployment` checks archive exclusions, exact backups, and rollback using disposable fixtures.
- `npm run deploy` builds, backs up, stages dependencies while the old app serves, then switches code.

Backups live outside the app under `/home/advran/backups/budgeting-financial-tool/`.
Each timestamped backup contains `data/`, the unchanged `.env`, startup scripts,
and a manifest of file hashes, counts, and a recent date/amount. A second backup
is taken with the app stopped immediately before cutover. A busy or malformed
source aborts backup verification; incomplete copies remain for inspection.

The archive contains only `server/`, `dist/`, `package.json`, and `package-lock.json`.
It excludes environment files, data, storage, dependencies, and the legacy tree.
Dependencies are installed in staging; previous code and dependencies are retained
under the app's `.deploy/<release>/previous/`. There is no reset flag.

Verification compares every data file and `.env` with the final backup, checks
all users' records through authenticated reads, checks ownership rejection, and
checks the release marker and frontend route through public HTTPS. The API probe
uses short-lived signed tokens on the server; it does not know or change any PIN.
Actual browser PIN entry remains a separate user check.

Failure during cutover restores the previous code and dependencies automatically.
It never restores an older data snapshot over subsequent user writes. If automatic
recovery reports a failure, inspect the retained release, stop/start scripts, and
listener before retrying. Keep the deploy lock until recovery is understood.
Successful deployment receipts are saved locally under ignored `.deploy-tmp/`.
