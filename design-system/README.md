# S1P design-system kit

Everything Claude Code needs to apply the approved S1P design system to this repo. Start with `CLAUDE_CODE_PROMPT.md`.

| Path | What it is |
| --- | --- |
| `CLAUDE_CODE_PROMPT.md` | The build prompt: phases, rules and placements for this repo |
| `tokens/tokens.json` | Canonical design tokens (colour light/dark, type, spacing, radius, shadow, border, stroke, motion, layout, breakpoints, z-index) |
| `tokens/tokens.css` | CSS custom properties compiled from tokens.json, plus type classes and `@font-face` (fonts resolved from `../fonts/`) |
| `fonts/` | Sora and Manrope variable woff2 (Latin subset), with their OFL licences |
| `docs/brand-book.md` | Principles, voice, colour, type, layout, shape, surfaces, icons, logo, accessibility |
| `docs/01-illustration.md` | Illustration system and the S1P-ILL-001…012 library |
| `docs/02-motion.md` | Motion principles, tokens, entrances, reduced motion |
| `docs/03-pages-and-admin.md` | Page art direction and the admin treatment |
| `docs/04-handoff.md` | Interaction lifecycles, technical notes, open decisions (written before the repo was available — the repo wins on conflicts) |
| `docs/components.md` | Usage rules and states for every component and page composition |
| `reference/` | Working React reference implementation (`bundle.js`, `bundle.css`, `index.d.ts`) and the component/page previews — a spec to port, not a runtime dependency |
| `assets/icons/` | 26 interface icons, 24px grid, 2px stroke |
| `assets/motifs/` | 8 brand motifs (pizza disc with one slice missing, slice, sunburst, arcs, confetti, leaf, offset plate, heart) |
| `illustrations/` | The 12 approved scenes as transparent WebP at @1x and @2x |
