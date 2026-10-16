# Claude Project Instructions

`AGENTS.md` is the authoritative instruction file for this project. Read it fully before making changes.

Also read:

- `PRODUCT.md` for confirmed behavior and open product questions
- `docs/ORGANIZATION.md` for the target layout and feature skeleton
- `docs/TECHNICAL.md` for storage, dates, auth, and the API
- `docs/SKILLS.md` before visual work
- `DESIGN.md` before any visual change

The target layout is one package: `src/features/`, `server/`, and `data/`. The old split is parked in `legacy/frontend/` and `legacy/backend/`. Do not invent a different architecture. Hand-written source aims for 150 lines and stops at 200. `npm run check:lines` enforces the stop once that script exists.
