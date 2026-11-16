# Motion

S1P moves like a short picture book: a scene arrives, a number settles, a choice confirms itself, and then the page is still. Motion explains a relationship, points attention or rewards an action — never fills time.

## Principles

- **Purposeful** — every movement answers "what changed?" or "where should I look?".
- **Characterful** — springy overshoot (`motion-ease-spring`) is reserved for small celebratory things: confetti, a selected chip, a check mark, a wave.
- **Consistent** — durations, curves, distances and staggers come from tokens only.
- **Responsive** — less travel and fewer moving parts on small screens and touch.
- **Respectful** — nothing blocks reading, forms, navigation or the contribution decision; nothing loops.
- **Performant** — transforms and opacity only; no animated layout properties, no scroll-jacking.

## Tokens

| Token | Value | Use |
| --- | --- | --- |
| `motion-duration-instant` | 80ms | Press feedback, checkbox tick |
| `motion-duration-micro` | 140ms | Hover, focus, colour |
| `motion-duration-standard` | 220ms | Accordion, validation message, chip selection |
| `motion-duration-emphasized` | 360ms | Dialog, mobile nav sheet, success swap |
| `motion-duration-entrance` | 560ms | Section and stat entrances |
| `motion-duration-story` | 900ms | A character entering, a gesture |
| `motion-duration-cinematic` | 1400ms | The longest a whole sequence may run |
| `motion-ease-standard` | cubic-bezier(0.2, 0, 0, 1) | Default |
| `motion-ease-exit` | cubic-bezier(0.4, 0, 1, 1) | Leaving |
| `motion-ease-emphasized` | cubic-bezier(0.2, 0.9, 0.1, 1) | Entrances, story moves |
| `motion-ease-spring` | cubic-bezier(0.34, 1.56, 0.64, 1) | Pops, selections, waves |
| `motion-stagger-tight` / `-standard` / `-loose` | 40 / 80 / 160ms | Confetti / cards / characters |
| `motion-distance-sm` / `-md` / `-lg` | 8 / 24 / 64px | Lifts / entrances / characters from the edge |

Interruption: hover and press transitions reverse from where they are; entrances never replay on scroll-back; a sequence still running when the person interacts jumps to its final frame.

## Categories

1. **Feedback** (instant–micro): button lift and press, chip selection, focus, checkbox tick.
2. **Transitions** (standard–emphasized): accordion, dialog, nav sheet, messages sliding in `motion-distance-sm`.
3. **Entrances** (entrance): a section's heading, then its content, rise `motion-distance-md` once, at most six items staggered.
4. **Illustration entrances** (entrance–story): each scene rises `motion-distance-md` and fades in, once, on first view.
5. **Celebration**: only after a confirmed success.

## Signature sequences

- **Hero — the shared table** (on load): the scene rises in over `motion-duration-entrance` while the headline, lead and buttons render immediately and are never delayed.
- **Section scenes** (pass it on, many hands, set-aside slice): rise in once as their section reaches 35% visibility; never replay on scroll-back.
- **Impact figures**: each `ImpactStat` with an exact verified value counts up once over 1.1s (ease-out) when half visible and lands on the real value. Rounded or "+" figures don't count.
- **Success**: the celebrate scene rises in; the confirmation text is already present and receives focus.
- **Error**: the try-again scene appears without movement; no shaking.

## Scroll storytelling

- Allowed: one-time reveals as sections enter; a timeline whose markers pop as they pass.
- Not allowed: pinned/sticky scroll scenes, scroll-scrubbed animations that hide text, anything between the visitor and the contribution form.

## Page transitions

Optional cross-fade of the main region (`motion-duration-standard`) with the View Transitions API where supported. Never delay navigation, break back/forward, or block direct links. Restore scroll position on back.

## Implementation

- CSS keyframes and transitions do everything here (bundle.css). The Illustration component arms a scene with a class, waits for 35% visibility via IntersectionObserver, then adds `is-in`, which transitions the image in. The scenes are flat PNGs, so they move as a whole; part-by-part choreography would need layered vector or Lottie versions of the art.
- Reach for an animation library only for orchestration CSS cannot express (e.g. scroll-linked timelines on the Impact page), and load it lazily.
- If JavaScript fails, scenes render complete and static.

## Reduced motion

`prefers-reduced-motion: reduce` → no travel, no scaling, no loops: scenes show their final frame, counters show final values, transitions collapse to ~0ms (colour changes still happen), skeleton shimmer stops. The spinner keeps turning slowly because it signals progress. Nothing is removed; only movement is.

## Mobile

At most one illustration entrance per screen; stagger caps at four items.
