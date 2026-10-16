# Design

Mike confirmed Precise instrument on 2026-10-16. The specimen is `docs/design-review/themes.html` (`#instrument`). Build this finish. Do not invent a second palette.

Mood: a cool platinum panel in the light. In the dark, the same metal reads as a cyan neon instrument: brighter type, glowing edges, and actions that stay easy to see. Figures stay the loudest thing. Gradients and glow mark the metal edge, the brand, and whether the month is inside, close, or over.

## Type

- Text: IBM Plex Sans
- Money: IBM Plex Mono, tabular numbers
- Body size at least 16px on form controls so iPhone Safari does not zoom

## Palette

| Token | Light | Dark |
| --- | --- | --- |
| Background | `#eef1f4` | `#070b12` |
| Surface | `#f8f9fb` | `#101820` |
| Text | `#12171d` | `#f7fbff` |
| Muted text | `#4e5966` | `#d5e4f0` |
| Border | `#8fa0b0` | `#67c8ea` |
| Brand | `#1a456e` | `#8eebff` |
| Brand accent | `#3f6284` | `#3ec6ef` |

Brand is steel. It is for selection, actions, and the metal edge. It is not a budget status.

## Status

Green, yellow, and red mean budget state. They are not the brand.

| Status | Meaning | Light | Dark |
| --- | --- | --- | --- |
| Green | Inside the budget | `#0d6b3c` on `#e5f6ec` | `#8ed7ae` on `#10281c` |
| Yellow | Close to the budget | `#7a5206` on `#fbf3d4` | `#f0d48a` on `#33280f` |
| Red | Over the budget | `#a61b14` on `#fdecea` | `#f5b2aa` on `#3a1816` |

Where yellow starts is still the open 80% proposal in `PRODUCT.md`.

## Material

- Corner radius on panels: 16px
- Panel edge: a platinum gradient border, plus a soft offset shadow
- Ambient brand glow sits behind a panel, slow, and off when `prefers-reduced-motion` is set
- Status chips and the budget meter carry a glow in the status color
- Amounts stay in the text color, with a plus or minus. Green is reserved for inside budget
- Icons stay Lucide ids, stroke 1.75, ink colored. The selected nav item uses brand

## Components

### Brand mark and icon assets

The abstract financial mark is two complementary hooks separated by open negative space. Use the existing platinum (`#f7fbff`) and cyan (`#8eebff`) on steel (`#1a456e`), with flat fills and no bevel, glow, or bounce on the mark. The established Precise instrument system above remains unchanged.

- `public/favicon.svg` is the shared master for the browser icon and all in-app marks through `src/components/BrandMark.tsx`. Preserve its proportions and negative space at every size.
- `public/favicon-32.png` is the 32px browser fallback. `public/apple-touch-icon.png` is the opaque 180px Apple touch icon. Keep both derived from the same mark and the links in `index.html` aligned.
- The in-app mark is decorative alongside its visible product name; keep its empty alternative text and hidden accessibility state.

## Do not

- Do not return to parchment, carbon black, Inter, or the emerald brand (`#10b981`)
- Do not use gradient text
- Do not tint category icons by category
