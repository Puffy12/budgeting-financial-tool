# Theme and icon directions

Proposal only. Nothing in the app has been restyled. Open `themes.html` beside this file to judge the three specimens.

This is an Operate surface: a personal finance dashboard Mike uses often, with real money on the screen. Scanability, stable alignment, and honest status outrank atmosphere. Brand lives in a few precise details. Green, yellow, and red are budget status. They are a shared functional system, identical in every direction.

## What is already decided

- Screens stay: Home (pick a user), Dashboard, Transactions, Categories, Recurring, Breakdown, Settings.
- Dates stay `YYYY-MM-DD`. Display still parses them at `T12:00:00` so the calendar day does not shift.
- Category icons stay icon-id strings. Emoji stays out.
- Gradients and motion are allowed later only when they help someone read a money state. These specimens use neither a gradient nor a glass surface. The only color fill on the sample bar is the inside-budget green, because that sample month is inside budget.
- The current emerald brand (`#10b981` in `legacy/frontend/src/index.css`) is the same hue family as income and as "inside budget." Every direction below moves the brand off green so those jobs can separate.

## Direction packet

```yaml
design_system_packet:
  source_of_truth: none yet. Incumbent tokens are parchment, near-black, Inter, emerald.
  work_mode: direction proposal. No visual implementation until Mike picks.
  product_type: personal finance dashboard
  audience: Mike, reviewing his own month
  primary_workflow: see whether the month is inside budget, then read the transactions that explain it
  frequency_of_use: often, including short repeat visits
  risk_level: high, because a misread amount or status is a money error
  desired_feeling: analytical and professionally made
  taste_direction:
    visual_material: operational surface, light and dark both required
    density: compact and scannable
    color_roles: neutral ground, one brand for selection and actions, shared status colors for the budget
    motion_character: instant by default
  anti_patterns:
    - purple-blue gradient
    - glassmorphism
    - emoji
    - fake live or verified badges
    - brand green that collides with inside-budget green
```

## Shared status colors

These hexes are the same in all three themes. Chip text is the first hex. Chip fill is the second. The chip border matches the text.

| State | Light | Dark |
| --- | --- | --- |
| Inside budget | `#0d6b3c` on `#e5f6ec` | `#8ed7ae` on `#10281c` |
| Close to budget | `#7a5206` on `#fbf3d4` | `#f0d48a` on `#33280f` |
| Over budget | `#a61b14` on `#fdecea` | `#f5b2aa` on `#3a1816` |

Checked as text on its own chip fill: each pair is above 4.5:1. Expense amounts in the specimen stay the theme's text color, with a minus sign. Red stays available for "over budget."

## 1. Editorial paper

Mood: a monthly review set like a printed page: warm paper, sharp ink, and an oxide accent for actions.

Closest cousin of the current parchment light theme. The oxide brand replaces emerald. Titles use a serif. Body and figures use a sans with tabular numbers, so the serif never carries a column of amounts.

| Token | Light | Dark |
| --- | --- | --- |
| Background | `#f3efe6` | `#161412` |
| Surface | `#fbf9f4` | `#211e1b` |
| Text | `#1a1714` | `#f3efe6` |
| Muted text | `#5e574e` | `#b3aa9e` |
| Border | `#aea395` | `#6a6056` |
| Brand | `#7a3e2e` | `#e4c2ae` |
| Brand accent | `#8d6848` | `#c4a48c` |

Type to load: [Newsreader](https://fonts.google.com/specimen/Newsreader) for the month title, [Public Sans](https://fonts.google.com/specimen/Public+Sans) for body and money.

Fit for this app: strong if the emotional center is the monthly review. Weaker for Transactions and Categories, where a serif title adds a second voice on screens that are visited as tools. Oxide (`#7a3e2e`) must stay visually separate from over-budget red (`#a61b14`). They are brown versus scarlet in the specimen. If they feel like the same color in your eye, this direction needs a brand shift before any build, and that shift should stay inside this direction.

Corners are nearly square (2px). No shadow.

## 2. Precise instrument

Mood: a cool, dense panel where the figures are the loudest thing and color is reserved for budget state.

This is the direction I recommend.

Cool gray ground, one steel brand for selection and actions, mono figures so dollars line up. Light and dark are peers. Neither one is a themed costume of the other.

| Token | Light | Dark |
| --- | --- | --- |
| Background | `#eef1f4` | `#0d1116` |
| Surface | `#f8f9fb` | `#151b22` |
| Text | `#12171d` | `#e8eef4` |
| Muted text | `#4e5966` | `#a8b4c0` |
| Border | `#8fa0b0` | `#4a5c6e` |
| Brand | `#1a456e` | `#b7d0e6` |
| Brand accent | `#3f6284` | `#9bb6cc` |

Type to load: [IBM Plex Sans](https://fonts.google.com/specimen/IBM+Plex+Sans) for titles, labels, and body. [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono) for money. One sans everywhere else keeps the daily screens quiet. The mono is justified because it is the money, not a decorative second voice.

Fit for this app: steel does not sit on green, yellow, or red. A frequent user can learn one family and read amounts without a display face. Density can go up on Transactions without the page starting to look like a poster. Corners are 6px. No shadow. The brand is a deep steel, used for the active nav item and the Insight label, and it is a flat color.

## 3. Quiet night ledger

Mood: a dark-first account book in bone and ink, with a daylight version of the same system.

Dark is the primary specimen. The ground is blue-black ink (`#101318`), chosen so the background itself does not read as status green. Brand is bone. Light mode is the same ink system in daylight: cool gray, not the warm paper of direction 1.

| Token | Light | Dark |
| --- | --- | --- |
| Background | `#f2f4f6` | `#101318` |
| Surface | `#fbfcfd` | `#181c22` |
| Text | `#141a22` | `#e7ecf1` |
| Muted text | `#4d5864` | `#aeb6c0` |
| Border | `#9aa6b0` | `#4c5664` |
| Brand | `#6e5a38` | `#e0d0b4` |
| Brand accent | `#7a6544` | `#b6a68a` |

Type to load: [Commissioner](https://fonts.google.com/specimen/Commissioner) for title, body, and money, with tabular figures. One family is the right call on a daily tool. Commissioner is a bit more official than a generic geometric sans, which is the ledger quality, and it still reads at label size.

Fit for this app: calm if you live in dark mode. The risk to judge in the file is bone versus the yellow "close" chip. Bone is the brand (`#e0d0b4` on dark, `#6e5a38` on light). Yellow is only a status chip (`#f0d48a` on `#33280f`, `#7a5206` on `#fbf3d4`). If those feel like one color, say so. I would cool the bone inside this direction rather than invent a fourth theme. Corners are 4px. No shadow.

## Recommendation

Use Precise instrument.

You open this app to answer a money question and leave. A steel brand stays off the green, yellow, and red status system, including on the dark ground. Mono figures make a column of amounts easier to scan than a serif or a soft grotesque. Editorial paper is the right choice if you want the month to feel like something you sit down and read. Quiet night ledger is the right choice if dark mode is the real product and the bone accent still looks distinct from the yellow chip after you see them together.

Mike asked for a luxury finish on this direction: platinum edge gradients, a slow ambient brand glow, and status glow on the green, yellow, and red chips. The steel palette and IBM Plex pairing stay. Motion is one slow drift of the ambient light, and it stops when reduced motion is on. No gradient text, no count-up, no entrance sequence.

## Icons

One icon set for all three themes. Stroke icons, 1.75 weight, round caps, 24 grid. Category icons use the theme text color. The selected nav item uses the brand. Icons are not tinted by category, because a rainbow of category colors would compete with budget status.

Lucide can cover the set. I would stay on Lucide. The app already stores Lucide ids in `legacy/frontend/src/utils/categoryIcons.ts` and renders them through `getIconById()`. Phosphor is a good library, and its weights are slightly softer, but a switch would mean a second icon language and a migration of stored ids for a gain that does not help someone read a budget. I would not install either library for this proposal.

The drawings in `themes.html` are inline stand-ins so the file has no icon-font dependency. After you approve, implementation should use the Lucide components, not these paths.

| Use | Lucide id | In the app today |
| --- | --- | --- |
| Groceries | `shopping-cart` | `shopping-cart` |
| Rent | `building-2` | `home` exists and reads as a house. Rent should use a building so it does not match the Home nav house. |
| Utilities | `lightbulb` | `lightbulb` |
| Transportation | `car` | `car` |
| Entertainment | `film` | `film` |
| Dining | `utensils` | `utensils` |
| Healthcare | `stethoscope` | `stethoscope` |
| Shopping | `shopping-bag` | `shopping-bag` |
| Subscriptions | `calendar-clock` | No dedicated subscriptions id. `smartphone` is Phone. `refresh-cw` is already the Recurring nav icon, so subscriptions should not reuse a circular-arrow glyph. |
| Salary | `wallet` | `wallet` |
| Investments | `trending-up` | `trending-up` |
| Other | `folder` | `folder`, also the fallback |
| Nav, Home | `house` | Home is the user picker. |
| Nav, Dashboard | `layout-dashboard` | Already `LayoutDashboard` in `legacy/frontend/src/components/Layout.tsx`. Keep this so Dashboard is not a second house. |
| Nav, Transactions | `receipt` | Already `Receipt`. |
| Nav, Insights | `chart-pie` | Breakdown currently uses `TrendingUp`, which is the same idea as Investments. A pie keeps the two jobs apart. |
| Nav, Settings | `settings` | Already `Settings`. |
| Nav, Recurring | `refresh-cw` | Already `RefreshCw`. Not in the 16-icon specimen. Keep it. |
| Nav, Categories | `tags` | Already `Tags`. Not in the 16-icon specimen. Keep it. |

Saved categories that already store `home` for housing can keep that id. `building-2` is the proposed default for Rent going forward, not a silent rewrite of existing rows.

## Open judgments

Please decide these before any visual implementation:

1. Which direction: Editorial paper, Precise instrument, or Quiet night ledger.
2. What to change inside that direction. In particular: does editorial oxide feel too close to over-budget red, does night-ledger bone feel too close to the yellow chip, and should expense amounts stay ink-colored.
3. Income is emerald in the app today, on Transactions, Recurring, Breakdown, and elsewhere. Should a positive amount keep a green of its own, or should the plus sign and the label do that work so green means only "inside budget"?
4. Send the examples you mentioned, if you still want them to steer the pick.
5. Should category icons stay Lucide, with the id notes above?
