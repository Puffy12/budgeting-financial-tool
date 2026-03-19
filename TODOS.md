# TODOS

## Backend Unit Tests
**Priority:** High
**What:** Set up Vitest and write unit tests for the 4 highest-risk backend modules:
1. **Recurring processor** (`utils/recurringProcessor.js`) — test `calculateNextDueDate` across all 5 frequencies (weekly, biweekly, monthly, quarterly, yearly), including month-boundary edge cases (Jan 31 → Feb 28, leap years)
2. **PIN auth** (`auth/pinToken.js`) — test token generation, validation, expiry after 14 days, timing-safe comparison, malformed token handling
3. **Stats calculations** (`routes/users.js` stats endpoints) — test monthly summaries with mixed income/expenses, recurring estimates per frequency, empty-month handling
4. **Import/export** (`routes/export.js`) — test merge-mode category dedup (case-insensitive), replace mode, data integrity after round-trip export→import

**Why:** Zero test coverage on a financial app. These modules have the most complex logic (date arithmetic, cryptographic validation, aggregation math, data merging) and the highest bug potential.
**Estimated effort:** human ~2 days / CC ~15-30 minutes
**Depends on:** Nothing — can be done independently
**Added:** 2026-03-19 via /plan-eng-review
