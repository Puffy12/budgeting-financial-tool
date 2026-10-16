# Product

## Platform

web

## Users

This is a personal budgeting app. A person signs in with a name and a 4-digit PIN. Each user's categories, transactions, and recurring items stay separate.

## Product purpose

Help a person set a budget for the month, see whether spending is inside, close, or over, and follow a finding down to the transactions that caused it.

## Confirmed behavior

- Set a budget for the month.
- Show green when spending is inside the budget, yellow when it is close, and red when it is over.
- Give monthly feedback that names the major spender and a lower target to try.
- Insights are tappable down to the actual transactions, including on a phone.
- Show trends and a projection for future months.

The current app already has Home, Dashboard, Transactions, Categories, Recurring, Breakdown, and Settings. Recurring items can be weekly, biweekly, monthly, quarterly, or yearly, and a processor creates due transactions. Settings can change the PIN and export or import that user's data. Keep those paths working while the budget behavior is added.

## Open product choices

These are unconfirmed. Use them only as labeled proposals. Do not treat them as decided, and do not replace them with a different default.

- Yellow starts at 80% of the budget. That percent is a working proposal.
- The first budget slice has one required monthly total. Per-category caps are optional. Whether those caps ship in the first slice is a working proposal.

The Suggestions page is an experiment. It stores one monthly total, colors it with the 80% proposal, compares that total with expenses, lists the largest expenses and categories in the months on screen, and projects next month as the average of those months. Those formulas are still open. Do not treat the experiment as the decision.

Also not decided:

- What the monthly budget is compared with (expenses only, or income against expenses).
- What "major spender" groups by.
- How the lower target number is chosen.
- How the future-month projection is calculated.

## Phone layout

iPhone Safari must keep a stable page width. Focusing a control must not zoom the page and change the layout width. A long description must not push the amount off screen.

## Storage

The storage target is SQLite, migrated from the current JSON files, with the same date rules. Dates stay `YYYY-MM-DD`.

## Brand

Mike confirmed Precise instrument. `DESIGN.md` is the palette, type, and glow. Category icons stay Lucide ids.

## Product principles

- Money status comes from one rule, shared by the screen and the server.
- A finding names real transactions and opens them.
- A person's data stays theirs, on disk, until Mike asks for a deletion or a migration.
- An open question stays open.

## Accessibility

Support keyboard use, visible focus, and phone layouts. Budget insights must be reachable and tappable on a phone, and the amount must stay on screen when a description is long.
