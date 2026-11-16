# Illustration system

Modern flat editorial illustration: warm, colour-blocked people with simple friendly faces, set against large geometric shapes, a few confetti marks and a dark crust ground line. The approved library is twelve scenes (S1P-ILL-001 to 012, Illustrations group); every new scene must sit beside them without looking like a different illustrator.

## Character construction

The reference is `S1P-ILL-005_community-cast.png`: eight people across four skin tones, several hair types, a head wrap, glasses, a child and a wheelchair user.

- **Proportions:** slim adults about 7 heads tall, with small round heads, long torsos and wide-leg trousers or overalls. Children are about 4 heads tall and stocky. Never chibi proportions or oversized heads.
- **Faces:** simple and warm: small dark eyes, thin brows, a short nose stroke and a smile. Joy closes the eyes into arcs. No blush, lashes or detailed lips.
- **Hair:** solid crust-brown (or muted-earth) masses with a few flowing strand lines; buns, curls, long hair, short crops and a tomato head wrap.
- **Hands:** simplified hands with suggested fingers, always readable at the gesture.
- **Clothing:** flat blocks from the palette — tomato, gold, basil, warm white, crust — with fine interior lines for folds, seams and pockets.
- **Poses:** gesture carries the story: offering, reaching, waving, cheering, carrying, pointing, thinking. Rotate the cast; no skin tone or outfit is tied to a role (donor, volunteer, recipient).
- Never depict a real person, never imply an illustrated figure is a real beneficiary, never draw poverty shorthand (torn clothes, empty bowls held up, sad faces).

## Line

- Figures are drawn as flat colour shapes without a heavy contour; fine crust-brown lines describe folds, seams, features and hair strands.
- Objects people handle (parcels, plates, cards, wheelchair, the pizza disc) carry a thin crust outline.
- Every scene stands on a thick, rounded crust-brown ground bar.
- Background shapes (hills, rose slabs, golden half-suns) have no outline.

## Colour

- Grounds: `color-illustration-plate` (cream) behind everything; background slabs in rose, basil-soft, gold-soft or cream-200.
- Per scene: crust line + one or two clothing accents + tomato + gold. Basil appears where something grows or succeeds. Not every scene uses every colour.
- Clothing colours come from the palette only: tomato, tomato-600, gold, basil, warm white, cream-200, crust.
- No gradients, textures, realistic shadows or highlights. The only "shadow" is the flat offset disc (`motif-offset-plate`).

## Composition

- Asymmetric, with a ground line (a crust slab, 14–16 units tall, rounded ends) that the people stand on.
- Vary scale within a scene (an adult beside a child, a large disc behind small people) and overlap: people in front of the disc, the disc in front of a rose slab.
- Leave air but no voids: a scene's subject fills 60–75% of the artboard width.
- Confetti marks — dots, rings, plus signs, dashes, triangles, small arcs — cluster in the empty corner only, five to eight per scene.
- Draw scenes for the slot they live in (wide hero, square side panel, small spot) rather than cropping a generic picture.

## Motifs

`Motifs` group: `slice`, `disc` (the pizza with one slice missing — the signature), `sunburst`, `arcs`, `confetti`, `leaf`, `offset-plate`, `heart`. Use them as section dividers, stat marks, social avatars and campaign stickers. One motif per section. Never scatter literal pizza slices as wallpaper.

## Library

| ID | File | Use | Render width | Ground |
| --- | --- | --- | --- | --- |
| S1P-ILL-001 | `S1P-ILL-001_shared-table_desktop.png` | Homepage hero, desktop | 560–720px | plate or canvas |
| S1P-ILL-002 | `S1P-ILL-002_shared-table_mobile.png` | Homepage hero below 900px | full width | plate or canvas |
| S1P-ILL-003 | `S1P-ILL-003_pass-it-on.png` | "Why it matters" band; contribution side panel | 360–600px | rose band or plate |
| S1P-ILL-004 | `S1P-ILL-004_many-hands.png` | "How you can help"; Impact header — never a chart | 400–640px | plate (hill runs to the edges) |
| S1P-ILL-005 | `S1P-ILL-005_community-cast.png` | About "Who's involved" strip; character reference | up to 1240px | plate or canvas |
| S1P-ILL-006 | `S1P-ILL-006_set-aside-slice.png` | About origin section | 360–600px | plate |
| S1P-ILL-007 | `S1P-ILL-007_welcome-to-the-table.png` | About volunteer call (only if offered) | 360–600px | plate |
| S1P-ILL-008 | `S1P-ILL-008_celebrate.png` | After a confirmed contribution; admin first publish | 240–560px | plate |
| S1P-ILL-009 | `S1P-ILL-009_empty-plate.png` | Empty gallery and admin lists | 200–260px | plate |
| S1P-ILL-010 | `S1P-ILL-010_try-again.png` | Recoverable errors | 200–260px | plate |
| S1P-ILL-011 | `S1P-ILL-011_looking-closely.png` | No search or filter results | 200–260px | plate |
| S1P-ILL-012 | `S1P-ILL-012_wandering-slice.png` | 404 page | 400–640px | plate or canvas |
| Motifs | `motif-*.svg` | Dividers, stat marks, stickers, social | 24–160px | any brand ground |

All scenes are transparent PNGs. On dark grounds always show them on `color-illustration-plate` — the crust lines and ground bar disappear otherwise.

**Naming for new assets:** `S1P-ILL-<next number>_<short-scene-name>.png`, transparent, at least 1,400px wide, generated with S1P-ILL-001 as the style reference and crops of S1P-ILL-005 as character references.

**Adding a scene:** start from the cast, put people on the crust ground bar, add one large background shape and one prop that carries the idea (a parcel = a contribution, a growing plant = progress, a shared table or disc = community, a passed object = generosity), then a few confetti marks in the emptiest corner.

## In the interface

- On the web, render scenes with the `Illustration` component (plate, alt text, responsive hero, one-time entrance). Use the PNG files directly for slides, social and print.
- Photographs and illustrations never share a frame. Illustrations sit beside or between photo sections; photos are never drawn on.
- Alt text describes the action ("One person hands a wrapped parcel to another"); decorative scenes are hidden when the copy says it all.
